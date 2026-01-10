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

// Define components outside of render
const MarkdownComponents: Record<string, React.ElementType> = {
  code({
    node: _node,
    inline,
    className,
    children,
    ...props
  }: React.ComponentPropsWithoutRef<'code'> & { inline?: boolean; node?: unknown }) {
    const match = /language-(\w+)/.exec(className || '');
    return !inline && match ? (
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      <SyntaxHighlighter style={vscDarkPlus as any} language={match[1]} PreTag="div" {...props}>
        {String(children).replace(/\n$/, '')}
      </SyntaxHighlighter>
    ) : (
      <code className={className} {...props}>
        {children}
      </code>
    );
  },

  table({ children }: React.ComponentPropsWithoutRef<'table'>) {
    return (
      <div className="overflow-x-auto my-4 rounded-lg border border-white/10">
        <table className="w-full text-left text-sm">{children}</table>
      </div>
    );
  },

  thead({ children }: React.ComponentPropsWithoutRef<'thead'>) {
    return <thead className="bg-white/5 text-amber-200">{children}</thead>;
  },

  tr({ children }: React.ComponentPropsWithoutRef<'tr'>) {
    return <tr className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">{children}</tr>;
  },

  th({ children }: React.ComponentPropsWithoutRef<'th'>) {
    return <th className="p-3 font-medium uppercase tracking-wider">{children}</th>;
  },

  td({ children }: React.ComponentPropsWithoutRef<'td'>) {
    return <td className="p-3 text-white/80">{children}</td>;
  },
};

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  return (
    <div
      className={cn(
        'prose prose-invert max-w-none prose-headings:text-amber-400 prose-a:text-blue-400 prose-code:text-rose-300',
        className
      )}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={MarkdownComponents}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
