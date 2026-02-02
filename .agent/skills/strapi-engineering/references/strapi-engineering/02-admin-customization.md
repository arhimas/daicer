# 🎨 Strapi 5 Engineering: Admin & Custom Fields

> **Goal**: Create highly interactive, premium UI within the Admin Panel without forking the codebase.

## 1. Injection Zones (Surgical UI)

Strapi exposes "Zones" where plugins can inject React components.

### Implementation
**File**: `src/admin/app.tsx` or plugin's `admin/src/index.tsx`

```typescript
// src/admin/app.tsx or plugin index
import MyWidget from './components/MyWidget';

export default {
  bootstrap(app: any) {
    app.getPlugin('content-manager').injectComponent('editView', 'right-links', {
      name: 'my-widget',
      Component: MyWidget,
    });
  }
};
```

### Available Zones
| Zone | Description | Use Case |
| :--- | :--- | :--- |
| `content-manager.editView.right-links` | Sidebar of Edit View | Metadata, Status Checks, Quick Actions |
| `content-manager.editView.informations` | Below "Information" box | Additional Context, Warnings |
| `content-manager.listView.actions` | Top right of List View | Bulk Operations, Exports |

## 2. Managing Data in Admin

The Admin Panel is isolated from the Server. You need "Bridges".

### A. Calling the API (`useFetchClient`)
Use this hook to make authenticated requests to your backend (Controllers).

```typescript
import { useFetchClient } from '@strapi/strapi/admin';

const MyComponent = () => {
  const { get, post, put } = useFetchClient();

  const handleAction = async () => {
    // Authenticated request to your plugin's admin route
    await post('/my-plugin/process-queue', { id: 123 });
  };
};
```

### B. Interacting with the Form (`useCMEditViewDataManager`)
Use this to read/write the content currently being edited.

```typescript
import { useCMEditViewDataManager } from '@strapi/strapi/admin';

const MyField = () => {
  // initialData = Saved DB state
  // modifiedData = Current dirty state form
  // onChange = Update the form
  const { modifiedData, onChange } = useCMEditViewDataManager();

  return (
    <input 
      value={modifiedData.title}
      onChange={e => onChange({ target: { name: 'title', value: e.target.value } })}
    />
  );
};
```

## 3. Custom Fields
A "Custom Field" is a specialized Input Component tied to a specific data type in the Schema.

### Registration
Allows the field to appear in Content Type Builder.

```typescript
// src/plugins/my-plugin/admin/src/index.tsx
app.customFields.register({
  name: 'color-picker',
  pluginId: 'my-plugin',
  type: 'string', // Stored as STRING in DB
  intlLabel: { id: 'color-picker.label', defaultMessage: 'Color Picker' },
  intlDescription: { id: 'color-picker.desc', defaultMessage: 'Pick a hex color' },
  components: {
    Input: async () => import('./components/ColorPicker'),
  },
});
```

### Schema Usage
```json
// schema.json
"myColor": {
  "type": "customField",
  "customField": "plugin::my-plugin.color-picker"
}
```

## 📚 Official Reference
-   [Injection Zones API](https://docs.strapi.io/cms/plugins-development/admin-panel-api#injection-zones-api)
-   [Custom Fields Documentation](https://docs.strapi.io/cms/admin-panel/custom-fields)
-   [Strapi Design System](https://design-system.strapi.io)
