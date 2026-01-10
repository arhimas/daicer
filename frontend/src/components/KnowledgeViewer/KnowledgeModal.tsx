import { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, BookOpen, Database, Tag, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MarkdownRenderer } from './MarkdownRenderer';
// Note: importing UnifiedSearchResult type from backend might be hard if not shared.
// We define a local interface matching it.

export interface SearchResult {
  id: number;
  title: string;
  excerpt: string;
  score: number;
  sourceId: number;
  sourceName: string;
  tags: string[];
  kind?: 'entity' | 'knowledge';
  content?: string; // Full content to be fetched
}

interface KnowledgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: SearchResult | null;
}

export function KnowledgeModal({ isOpen, onClose, result }: KnowledgeModalProps) {
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(false);

  // In a real app, 'result' might only have excerpt. We need to fetch full content.
  // For now, we mock fetch or assume snippet has content (which it usually does).
  // If snippet content is truncated, we'd fetch source.

  // Derived state pattern to reset loading when result changes
  const [lastResultId, setLastResultId] = useState<number | null>(null);

  if (result?.id !== lastResultId) {
    setLastResultId(result?.id ?? null);
    setLoading(true);
    setContent('');
  }

  useEffect(() => {
    if (isOpen && result && loading) {
      // Simulate fetch delay for "Juicy" feel
      const timer = setTimeout(() => {
        // Fallback to excerpt for demo
        setContent(
          result.content ||
            (result.excerpt ? `${result.excerpt}\n\n*(Full content would be fetched here...)*` : 'Loading...')
        );
        setLoading(false);
      }, 300);

      return () => clearTimeout(timer);
    }
    return undefined;
  }, [isOpen, result, loading]);

  if (!result) return null;

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 transition-opacity animate-in fade-in" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-4xl translate-x-[-50%] translate-y-[-50%] gap-4 border border-white/10 bg-zinc-950 p-0 shadow-2xl duration-200 animate-in zoom-in-95 sm:rounded-xl">
          {/* Header */}
          <div className="flex flex-col gap-1 border-b border-white/10 p-6 bg-white/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'p-2 rounded-lg',
                    result.kind === 'entity' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-emerald-500/20 text-emerald-400'
                  )}
                >
                  {result.kind === 'entity' ? <Database className="w-5 h-5" /> : <BookOpen className="w-5 h-5" />}
                </div>
                <div>
                  <Dialog.Title className="text-xl font-bold text-white tracking-tight">{result.title}</Dialog.Title>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-medium text-white/40 uppercase tracking-wider">
                      {result.kind === 'entity' ? 'Game Entity' : 'Knowledge Source'}
                    </span>
                    {result.kind === 'entity' && (
                      <span className="text-xs text-white/20">• ID: {result.sourceName}</span>
                    )}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="rounded-full p-2 hover:bg-white/10 transition-colors text-white/60 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tags */}
            {result.tags && result.tags.length > 0 && (
              <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-1 scrollbar-hide">
                {result.tags.map((tag, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/5 text-xs font-medium text-white/60 whitespace-nowrap"
                  >
                    <Tag className="w-3 h-3 opacity-50" />
                    {tag}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Content Area */}
          <div className="p-6 h-[60vh] overflow-y-auto custom-scrollbar bg-zinc-950">
            {loading ? (
              <div className="flex items-center justify-center h-full text-white/30 animate-pulse">
                Loading content...
              </div>
            ) : (
              <MarkdownRenderer content={content} />
            )}
          </div>

          {/* Footer / Pagination */}
          <div className="flex items-center justify-between p-4 border-t border-white/10 bg-white/5 text-sm text-white/40">
            <div className="flex items-center gap-2">
              <span>Matched Score:</span>
              <span className={cn('font-bold', (result.score || 0) > 0.8 ? 'text-emerald-400' : 'text-amber-400')}>
                {Math.round((result.score || 0) * 100)}%
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button type="button" className="p-2 hover:bg-white/10 rounded-lg disabled:opacity-30" disabled>
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span>Page 1 of 1</span>
              <button type="button" className="p-2 hover:bg-white/10 rounded-lg disabled:opacity-30" disabled>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
