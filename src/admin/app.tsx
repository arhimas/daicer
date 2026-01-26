
import type { StrapiApp } from '@strapi/strapi/admin';
import { Globe } from '@strapi/icons';

// Whitelist of entities that should have the locale generation button
const TARGET_MODELS = [
  'api::spell.spell',
  'api::item.item',
  'api::feature.feature',
  'api::trait.trait',
  'api::race.race',
  'api::class.class',
  'api::damage-type.damage-type',
  'api::magic-school.magic-school',
  'api::language.language',
  'api::status-effect.status-effect',
  'api::rule-set.rule-set',
  'api::prompt.prompt',
  'api::weapon-property.weapon-property',
  'api::proficiency.proficiency',
  'api::equipment-category.equipment-category',
];

const LocaleGeneratorBulkAction = ({ documents, model }: { documents: Array<{ documentId: string }>; model: string }) => {
    if (!TARGET_MODELS.includes(model)) {
        return null;
    }

    return {
        label: 'Generate Locales (PT/ES)',
        icon: <Globe />,
        variant: 'secondary',
        onClick: async () => {
             if (!window.confirm('Generate translations for selected items? (Overwrites existing PT/ES locales)')) {
                 return;
             }
             
             const documentIds = documents.map((doc) => doc.documentId);

             try {
                 const token = sessionStorage.getItem('jwtToken') || localStorage.getItem('jwtToken');
                 const headers: Record<string, string> = {
                     'Content-Type': 'application/json',
                 };
                 if (token) {
                     headers['Authorization'] = `Bearer ${token}`;
                 }

                 const response = await fetch('/api/game/generate-locales', {
                     method: 'POST',
                     headers,
                     body: JSON.stringify({
                         contentType: model,
                         documentIds
                     })
                 });

                 if (response.ok) {
                     console.log('Locales generated successfully');
                     window.location.reload(); // Refresh to see changes
                 } else {
                     console.error('Failed to generate locales');
                     alert('Failed to generate locales. Check console.');
                 }
             } catch (e) {
                 console.error('Error triggering locale generation', e);
                 alert('Error ' + e);
             }
        }
    };
};

export default {
  config: {
    locales: [
      'ar',
      'fr',
      'cs',
      'de',
      'dk',
      'es',
      'he',
      'id',
      'it',
      'ja',
      'ko',
      'ms',
      'nl',
      'no',
      'pl',
      'pt-BR',
      'pt',
      'ru',
      'sk',
      'sv',
      'th',
      'tr',
      'uk',
      'vi',
      'zh-Hans',
      'zh',
    ],
  },
  bootstrap(app: StrapiApp) {
    console.log('Using Daicer Custom Admin Extensions');

    // @ts-expect-error - content-manager plugin internal API
    const contentManager = app.getPlugin('content-manager');
    if (contentManager) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        contentManager.apis.addBulkAction((actions: any[]) => {
            return [...actions, LocaleGeneratorBulkAction];
        });
    }
  },
};
