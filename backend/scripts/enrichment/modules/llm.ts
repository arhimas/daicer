import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { GoogleGenAI } from '@google/genai';
import path from 'path';

// ensure env (shim for scripts)
const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
if (!apiKey) {
  require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });
  require('dotenv').config({ path: path.resolve(__dirname, '../../../../.env') });
}

export const getGeminiModel = (modelName: string = 'gemini-2.0-flash-exp') => {
  const key = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
  if (!key) throw new Error('Missing Google/Gemini API Key');

  return new ChatGoogleGenerativeAI({
    model: modelName,
    maxOutputTokens: 8192,
    temperature: 0,
    apiKey: key,
  });
};

export const getNativeGeminiClient = () => {
  const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!key) throw new Error('Missing GEMINI_API_KEY (or GOOGLE_API_KEY)');
  return new GoogleGenAI({ apiKey: key });
};
