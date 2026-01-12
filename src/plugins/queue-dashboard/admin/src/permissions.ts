const pluginPermissions = {
  // This action corresponds to the one registered in server/bootstrap.ts
  // format: plugin::<plugin-name>.<uid>
  read: [{ action: 'plugin::queue-dashboard.read', subject: null }],
};

export default pluginPermissions;
