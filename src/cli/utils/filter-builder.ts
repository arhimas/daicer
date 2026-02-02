import { select, input, confirm } from '@inquirer/prompts';
import { ui } from './ui';

export type FilterOp = '$eq' | '$ne' | '$contains' | '$gt' | '$lt' | '$in' | '$notIn';

export interface FilterNode {
  field: string;
  operator: FilterOp;
  value: any;
}

export class FilterBuilder {
  /**
   * Interactively build a Strapi filter object
   */
  async build(schemaUid: string): Promise<any> {
    const filters: any[] = [];
    let addMore = true;

    await ui.header('Filter Builder');
    await ui.panel(`Target: ${schemaUid}`, { title: 'Scope', color: 'blue' });

    while (addMore) {
      const filter = await this.promptSingleFilter();
      if (filter) {
        filters.push(filter);
        await ui.kv('Added', `${filter.field} ${filter.operator} ${filter.value}`, 'green');
      }

      addMore = await confirm({ message: 'Add another filter condition (AND)?', default: false });
    }

    if (filters.length === 0) return {};
    if (filters.length === 1) return this.toStrapiFilter(filters[0]);

    // Implicit AND for now
    return {
      $and: filters.map((f) => this.toStrapiFilter(f)),
    };
  }

  private async promptSingleFilter(): Promise<FilterNode | null> {
    const field = await input({ message: 'Field Name (e.g. slug, stats.hp):' });
    if (!field) return null;

    const operator = await select({
      message: 'Operator:',
      choices: [
        { name: '= Equals ($eq)', value: '$eq' },
        { name: '!= Not Equals ($ne)', value: '$ne' },
        { name: '🔍 Contains ($contains)', value: '$contains' },
        { name: '> Greater ($gt)', value: '$gt' },
        { name: '< Less ($lt)', value: '$lt' },
        { name: '[ ] In List ($in)', value: '$in' },
      ],
    });

    let value: any;

    if (operator === '$in' || operator === '$notIn') {
      const valStr = await input({ message: 'Values (comma separated):' });
      value = valStr.split(',').map((s) => s.trim());
    } else {
      const valStr = await input({ message: 'Value:' });
      // Try to infer type
      if (valStr === 'true') value = true;
      else if (valStr === 'false') value = false;
      else if (!isNaN(Number(valStr)) && valStr.trim() !== '') value = Number(valStr);
      else value = valStr;
    }

    return { field, operator: operator as FilterOp, value };
  }

  private toStrapiFilter(node: FilterNode): any {
    // Handle nested fields (e.g. stats.hp)
    if (node.field.includes('.')) {
      const parts = node.field.split('.');
      const root: any = {};
      let current = root;

      for (let i = 0; i < parts.length - 1; i++) {
        current[parts[i]] = {};
        current = current[parts[i]];
      }

      current[parts[parts.length - 1]] = { [node.operator]: node.value };
      return root;
    }

    return {
      [node.field]: {
        [node.operator]: node.value,
      },
    };
  }
}

export const filterBuilder = new FilterBuilder();
