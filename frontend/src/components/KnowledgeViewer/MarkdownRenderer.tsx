import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { cn } from '@/lib/utils'; // Assuming generic utility exists, else standard className

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className }) => (
    <div
      className={cn(
        'prose prose-invert max-w-none prose-headings:text-amber-400 prose-a:text-blue-400 prose-code:text-rose-300',
        className
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ node, inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '');
            return !inline && match ? (
              <SyntaxHighlighter style={vscDarkPlus} language={match[1]} PreTag="div" {...props}>
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            ) : (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
          table({ children }) {
            return (
              <div className="overflow-x-auto my-4 rounded-lg border border-white/10">
                <table className="w-full text-left text-sm">{children}</table>
              </div>
            );
          },
          thead({ children }) {
            return <thead className="bg-white/5 text-amber-200">{children}</thead>;
          },
          tr({ children }) {
            return (
              <tr className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">{children}</tr>
            );
          },
          th({ children }) {
            return <th className="p-3 font-medium uppercase tracking-wider">{children}</th>;
          },
          td({ children }) {
            return <td className="p-3 text-white/80">{children}</td>;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
