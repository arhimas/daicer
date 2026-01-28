export default {
  existsSync: () => false,
  readFileSync: () => '',
  statSync: () => ({ isFile: () => false, isDirectory: () => false }),
  promises: {
    readFile: async () => '',
  },
};
