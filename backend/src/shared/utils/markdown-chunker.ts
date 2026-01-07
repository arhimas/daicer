import { TokenTextSplitter } from '@langchain/textsplitters';
import { getEncoding } from 'js-tiktoken';

export interface KnowledgeChunk {
  title: string;
  content: string;
  level: number;
  path: string[];
}

interface MarkdownNode {
  header: string;
  level: number;
  content: string; // The content directly under this header (before next sub-header)
  children: MarkdownNode[];
}

const enc = getEncoding('cl100k_base');
const MAX_TOKENS = 6000;

function countTokens(text: string): number {
  return enc.encode(text).length;
}

/**
 * Parses markdown into a hierarchical tree.
 */
function parseMarkdownTree(text: string): MarkdownNode {
  const root: MarkdownNode = { header: 'Root', level: 0, content: '', children: [] };
  // Split by line but preserve newlines? No, line by line is easier.
  const lines = text.split('\n');
  const stack: MarkdownNode[] = [root];

  for (const line of lines) {
    const match = line.match(/^(#{1,6})\s+(.*)/);
    if (match) {
      const level = match[1].length;
      const header = match[2].trim();
      const node: MarkdownNode = { header, level, content: '', children: [] };

      // Pop until we find the parent (strictly smaller level)
      // e.g. Current on stack: H2. New: H2.
      // H2 is NOT smaller than H2. So pop H2. Parent is H1 (smaller).
      while (stack.length > 1 && stack[stack.length - 1].level >= level) {
        stack.pop();
      }
      stack[stack.length - 1].children.push(node);
      stack.push(node);
    } else {
      // Append to current active node
      stack[stack.length - 1].content += line + '\n';
    }
  }
  return root;
}

/**
 * Serializes a node and its children to text to check size or generate chunk.
 */
function serializeNode(node: MarkdownNode): string {
  let text = '';
  // Don't print "Root" header
  if (node.level > 0) {
    text += `${'#'.repeat(node.level)} ${node.header}\n`;
  }
  text += node.content;
  for (const child of node.children) {
    text += serializeNode(child);
  }
  return text;
}

/**
 * Recursively splits or aggregates nodes based on token size.
 */
async function processNode(node: MarkdownNode, path: string[], chunks: KnowledgeChunk[]) {
  const nodeText = serializeNode(node);

  // Calculate potential context first to ensure strict total limit
  const contextPath = path.slice(0, -1);
  const contextStr = contextPath.length > 0 ? `Context: ${contextPath.join(' > ')}\n\n` : '';

  // Strict check: Content + Context
  const totalTokens = countTokens(contextStr + nodeText);

  // 1. IF it fits, keep it WHOLE (The User's "Great" Case)
  if (totalTokens <= MAX_TOKENS && node.level > 0) {
    chunks.push({
      title: node.header,
      content: contextStr + nodeText.trim(),
      level: node.level,
      path: path,
    });
    return;
  }

  // 2. IF it's too big, try to split by Children (The "split in ## ok" Case)
  // If we have children, we can break it down.
  // BUT we must process the direct content of THIS node first if it exists.

  if (node.children.length > 0) {
    // Current node's direct content (the intro text before subheaders)
    if (node.content.trim().length > 0) {
      // Treat direct content as a pseudo-chunk.
      // It's effectively the "Intro" to this section.
      // We'll wrap it in a node to process it (in case IT is huge).
      const contentNode: MarkdownNode = {
        header: `${node.header} (Intro)`,
        level: node.level,
        content: node.content,
        children: [],
      };
      // Path remains same? Yes, it's this node.
      await processNode(contentNode, path, chunks);
    }

    // Recurse on children
    for (const child of node.children) {
      // Child's path is ParentPath + ChildHeader
      // Wait. The `path` arg passed to processNode IS the path TO this node?
      // No, in my call logic: `path` includes `node.header`?
      // Let's standardize: `path` passed to processNode is the FULL path including self.
      const childPath = [...path, child.header];
      // BUT if node is Root?
      const effectivePath = node.level === 0 ? [child.header] : [...path, child.header];

      await processNode(child, effectivePath, chunks);
    }
    return;
  }

  // 3. Leaf Node is TOO BIG (The "Safety Net" Case)
  // No children to split by, but text is > 7800 tokens.

  // Calculate available tokens
  const contextTokens = countTokens(contextStr);
  const availableTokens = Math.max(100, MAX_TOKENS - contextTokens - 50); // reserve 50 buffer

  const splitter = new TokenTextSplitter({
    encodingName: 'cl100k_base',
    chunkSize: availableTokens,
    chunkOverlap: 100,
  });

  const docs = await splitter.createDocuments([nodeText]);

  // Context is path except self? Or fully descriptive?
  // If we split a leaf node "Deep Content", the context should be path to it.
  // reuse existing vars
  // const contextPath = path.slice(0, -1);
  // const contextStr = contextPath.length > 0 ? \`Context: \${contextPath.join(' > ')}\n\n\` : '';

  docs.forEach((doc, idx) => {
    chunks.push({
      title: `${node.header} (Part ${idx + 1})`,
      content: contextStr + doc.pageContent,
      // ...
      level: node.level,
      path: path,
    });
  });
}

export async function chunkMarkdown(content: string): Promise<KnowledgeChunk[]> {
  const root = parseMarkdownTree(content);
  const chunks: KnowledgeChunk[] = [];

  // Start processing from root
  await processNode(root, [], chunks);

  return chunks;
}
