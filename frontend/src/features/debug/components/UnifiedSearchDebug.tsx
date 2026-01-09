import React, { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { KnowledgeModal, SearchResult } from '@/components/KnowledgeViewer/KnowledgeModal';
import { cn } from '@/lib/utils';
// We'll fetch directly from backend for debug, or use a hook if available.
// For now, raw fetch to strapi endpoint.

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:1337';

export function UnifiedSearchDebug() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedResult, setSelectedResult] = useState<SearchResult | null>(null);

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      // Call the Unified Search Endpoint
      // Note: Endpoint might be /api/unified-search or /knowledge-snippets/search depending on route config.
      // In previous steps we updated KnowledgeSnippet controller 'search' to use UnifiedSearchService.
      // So endpoint is /api/knowledge-snippets/search?q=...

      const res = await fetch(`${BACKEND_URL}/api/knowledge-snippets/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();

      if (Array.isArray(data)) {
        setResults(data);
      } else {
        console.error('Search invalid response', data);
        setResults([]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-zinc-900 rounded-xl border border-white/10 w-full max-w-3xl mx-auto mt-10">
      <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <Search className="w-5 h-5 text-amber-500" />
        Unified Knowledge Search
      </h2>

      <form onSubmit={handleSearch} className="flex gap-2 mb-6">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask the knowledge base (e.g. 'Fireball', 'Goblins')..."
          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-amber-600 hover:bg-amber-500 text-white font-medium px-6 py-2 rounded-lg disabled:opacity-50 transition-colors"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Search'}
        </button>
      </form>

      <div className="space-y-3">
        {results.map((result) => (
          <div
            key={result.id}
            onClick={() => setSelectedResult(result)}
            className="group p-4 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 hover:border-amber-500/30 transition-all cursor-pointer"
          >
            <div className="flex justify-between items-start mb-1">
              <h3 className="font-bold text-lg text-white group-hover:text-amber-400 transition-colors">
                {result.title}
              </h3>
              <span
                className={cn(
                  'text-xs font-mono px-2 py-1 rounded bg-black/20',
                  (result.score || 0) > 0.8 ? 'text-green-400' : 'text-yellow-400'
                )}
              >
                {Math.round((result.score || 0) * 100)}%
              </span>
            </div>

            <div className="flex gap-2 mb-2 text-xs">
              <span
                className={cn(
                  'uppercase tracking-wider font-bold',
                  result.kind === 'entity' ? 'text-indigo-400' : 'text-emerald-400'
                )}
              >
                {result.kind === 'entity' ? 'Entity' : 'Knowledge'}
              </span>
              <span className="text-white/20">|</span>
              <span className="text-white/40">{result.sourceName}</span>
            </div>

            <p className="text-sm text-white/60 line-clamp-2">{result.excerpt}</p>

            {result.tags && (
              <div className="flex gap-2 mt-3">
                {result.tags.map((t) => (
                  <span
                    key={t}
                    className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-white/40 border border-white/5"
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <KnowledgeModal isOpen={!!selectedResult} onClose={() => setSelectedResult(null)} result={selectedResult} />
    </div>
  );
}
