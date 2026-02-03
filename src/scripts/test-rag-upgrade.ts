/**
 * Test RAG Upgrade Script
 */
import { chunkMarkdown } from '@daicer/shared/utils/markdown-chunker';
import { embeddingService } from '@/services/embedding-service';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const SAMPLE_MD = `
# RAG System
RAG (Retrieval-Augmented Generation) is a technique to enhance LLM responses.

## Overview
It works by retrieving relevant documents and feeding them as context.
This overcomes the context window limit of LLMs.

## Components
There are two main components:
1. Retrieval System
2. Generation System
`;

async function test() {
  console.log('🧪 Testing RAG Upgrade...');

  try {
    // 1. Test Chunking
    console.log('\nTesting Chunking...');
    const chunks = await chunkMarkdown(SAMPLE_MD);
    console.log(`Generated ${chunks.length} chunks.`);
    chunks.forEach((c, i) => {
      console.log(`[Chunk ${i}] Title: ${c.title}`);
      console.log(`Path: ${JSON.stringify(c.path)}`);
      console.log(`Preview: ${c.content.substring(0, 50).replace(/\n/g, ' ')}...`);
      console.log('---');
    });

    if (chunks.length === 0) throw new Error('No chunks generated');

    // 2. Test Embedding
    console.log('\nTesting Embedding (OpenAI)...');
    const vec = await embeddingService.generateEmbedding(chunks[0].content);
    console.log('Vector generated successfully.');
    console.log('Dimension:', vec.length);

    if (vec.length !== 3072 && vec.length !== 1536) {
      console.warn('⚠️ Unexpected dimension:', vec.length);
    } else {
      console.log('✅ Dimension check passed.');
    }
  } catch (err) {
    console.error('❌ Test Failed:', err);
    process.exit(1);
  }
}

test();
