import { zodToJsonSchema } from 'zod-to-json-schema';
import { getNativeGeminiClient } from './llm';
import { MODEL_NAME } from './constants';
import { z } from 'zod';
import { jsonrepair } from 'jsonrepair';

const callGemini = async (prompt: string, jsonSchema: any) => {
  const genAI = getNativeGeminiClient();
  const res: any = await genAI.models.generateContent({
    model: MODEL_NAME,
    contents: prompt,
    config: { responseMimeType: 'application/json', responseJsonSchema: jsonSchema },
  });
  const txt = typeof res.text === 'function' ? res.text() : res.text || JSON.stringify(res);
  try {
    return JSON.parse(txt);
  } catch {
    return JSON.parse(jsonrepair(txt));
  }
};

export const generateStructuredContent = async (
  prompt: string,
  schema: z.ZodSchema,
  retryContext: string = ''
): Promise<any> => {
  let finalPrompt = retryContext ? `${prompt}\n\n${retryContext}` : prompt;
  let lastError: any;

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      // 1. Prepare Schema (Strict with Loose Fallback)
      let jsonSchema: any;
      let useStrict = true;
      try {
        jsonSchema = zodToJsonSchema(schema, { name: 'result', $refStrategy: 'none' });
      } catch (e) {
        useStrict = false;
        jsonSchema = { type: 'object', properties: {}, additionalProperties: true };
      }

      // 2. Call API
      let result: any;
      try {
        result = await callGemini(finalPrompt, jsonSchema);
      } catch (apiErr: any) {
        // If Strict failed on API side (e.g. 400), try Loose immediately WITH SCHEMA IN PROMPT
        if (useStrict && (apiErr.message?.includes('INVALID_ARGUMENT') || apiErr.message?.includes('schema'))) {
          // console.warn(`⚠️ Strict Schema API rejected (Attempt ${attempt}), retrying with Loose Schema type...`);
          // Append schema to prompt so LLM knows what to do
          const schemaJsonString = JSON.stringify(jsonSchema, null, 2);
          const fallbackPrompt = `${finalPrompt}\n\nIMPORTANT: Output must strictly follow this JSON Schema:\n\`\`\`json\n${schemaJsonString}\n\`\`\``;

          result = await callGemini(fallbackPrompt, { type: 'object', properties: {}, additionalProperties: true });
        } else {
          throw apiErr;
        }
      }

      // 3. Validation
      const validation = schema.safeParse(result);
      if (validation.success) return validation.data;

      // 4. Prepare Feedback for Next Attempt
      const issues = validation.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
      throw new Error(`Output failed Zod Validation: ${issues}`);
    } catch (e: any) {
      lastError = e;
      if (attempt < 3) {
        console.warn(`⚠️ Attempt ${attempt} failed: ${e.message.substring(0, 150)}... Retrying...`);
        finalPrompt += `\n\nSYSTEM_ERROR_FEEDBACK: The previous response was rejected. \nERROR: ${e.message}\nTASK: generating a valid JSON that strictly matches the requirements. Fix the errors and retry.`;
      }
    }
  }

  throw new Error(`Failed after 3 attempts. Last error: ${lastError?.message}`);
};
