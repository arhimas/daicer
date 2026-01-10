/**
 * Agent Service
 */

export default ({ strapi }) => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async executeTool(roomId: string, toolName: string, payload: any, user: any) {
    const registry = strapi.service('api::agent.tool-registry');

    // 1. Validate Tool Exists
    if (!registry.hasTool(toolName)) {
      throw new Error(`Tool '${toolName}' not found`);
    }

    // 2. Execute Tool Logic
    const result = await registry.execute(toolName, roomId, payload, user);

    return result;
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async handleAnswer(questionId: string, answer: string, user: any) {
    strapi.log.info(`[Agent] Received answer for question ${questionId}: ${answer} from ${user?.username}`);
    // TODO: Connect this to the actual Agent Narrative loop (LangGraph)
    // For now, we acknowledge it so the frontend doesn't hang.
    return { success: true };
  },
});
