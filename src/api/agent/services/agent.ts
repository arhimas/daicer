/**
 * Agent Service
 * Orchestrates high-level agent interactions, including tool execution and dialogue handling.
 */

export default ({ strapi }) => ({
  /**
   * Executes a specific tool via the ToolRegistry.
   *
   * @param roomId - The room context.
   * @param toolName - The identifier of the tool to run.
   * @param payload - The input data for the tool (validated by registry).
   * @param user - The user initiating the tool execution.
   * @returns The result of the tool execution.
   * @throws Error if tool is not found.
   */
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

  /**
   * Handles user dialogue answers/inputs.
   * Currently acts as a loop-closer for the frontend, preventing hangs.
   * Future: Connect to LangGraph narrative loop.
   *
   * @param questionId - Context ID of the question being answered.
   * @param answer - The user's text input.
   * @param user - The user context.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async handleAnswer(questionId: string, answer: string, user: any) {
    strapi.log.info(`[Agent] Received answer for question ${questionId}: ${answer} from ${user?.username}`);
    // TODO: Connect this to the actual Agent Narrative loop (LangGraph)
    // For now, we acknowledge it so the frontend doesn't hang.
    return { success: true };
  },
});
