export const imageGenerationService = {
  generate: async () => {
    console.log('[ImageGenerationService] Stubbed generation.');
    return 'https://placehold.co/600x400';
  },
  generateAndAttach: async (payload: unknown) => {
     console.log('[ImageGenerationService] Stubbed generateAndAttach.');
     return { success: true, id: 1 };
  }
};
