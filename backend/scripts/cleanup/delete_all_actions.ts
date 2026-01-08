import { getStrapiClient } from '../utils/strapi-client';
import cliProgress from 'cli-progress';
import chalk from 'chalk';

const deleteAllActions = async () => {
  const client = getStrapiClient();
  console.log(chalk.red('🔥 STARTING ACTION PURGE 🔥'));

  let paging = true;
  let page = 1;
  let totalDeleted = 0;

  while (paging) {
    console.log(`Fetching page ${page}...`);
    const res = await client.collection('actions').find({
      pagination: { page, pageSize: 100 },
    });

    const entities = res.data;
    if (!entities || entities.length === 0) {
      paging = false;
      break;
    }

    console.log(chalk.yellow(`Found ${entities.length} actions. Deleting...`));

    // Delete in parallel (limit 10)
    const promises = entities.map(async (e: any) => {
      try {
        await client.collection('actions').delete(e.documentId || e.id);
        process.stdout.write('.');
      } catch (err: any) {
        process.stdout.write(chalk.red('x'));
      }
    });

    await Promise.all(promises);
    totalDeleted += entities.length;
    console.log(`\nPage ${page} cleared.`);
    // Don't increment page, as deleting shifts the window. Just fetch page 1 again until empty?
    // Actually Strapi pagination might shift. Safest is to keep fetching page 1.
    page = 1;
  }

  console.log(chalk.green(`\n✅ PURGE COMPLETE. Deleted ${totalDeleted} Actions.`));
};

deleteAllActions();
