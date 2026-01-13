export const llmService = {
  generate: async (prompt: string) => {
    console.log(`[LLMService] Stubbed generation for prompt: ${prompt.substring(0, 20)}...`);
    return 'Stubbed LLM Response';
  }
};
