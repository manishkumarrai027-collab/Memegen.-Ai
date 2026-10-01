import React, { useState, useEffect } from 'react';
import { TrendingMemeConcept, GroundingSource, TrendingMemesResponse } from '../types';
import { POPULAR_TEMPLATES, MemeTemplate } from '../data/templates';
import {
  Flame,
  Globe,
  RefreshCw,
  ExternalLink,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Search,
  Check,
  AlertCircle,
} from 'lucide-react';

interface TrendingSectionProps {
  onStartMemeFromTrend: (trend: TrendingMemeConcept, matchedTemplate: MemeTemplate) => void;
}

export const TrendingSection: React.FC<TrendingSectionProps> = ({ onStartMemeFromTrend }) => {
  const [trends, setTrends] = useState<TrendingMemeConcept[]>([]);
  const [searchQueries, setSearchQueries] = useState<string[]>([]);
  const [sources, setSources] = useState<GroundingSource[]>([]);
  const [groundedAt, setGroundedAt] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [topicInput, setTopicInput] = useState<string>('');
  const [activeTopic, setActiveTopic] = useState<string>('General Internet Viral');
  const [showSources, setShowSources] = useState<boolean>(false);

  const fetchTrendingMemes = async (topic?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/gemini/trending-memes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ topic: topic || undefined }),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch trending memes (status ${response.status})`);
      }

      const data: TrendingMemesResponse = await response.json();
      setTrends(data.trendingMemes || []);
      setSearchQueries(data.searchQueries || []);
      setSources(data.sources || []);
      setGroundedAt(data.groundedAt || new Date().toISOString());
    } catch (err: any) {
      console.error('Error fetching trending memes:', err);
      setError(err.message || 'Unable to connect to live web search');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTrendingMemes();
  }, []);

  const handleSearchTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (topicInput.trim()) {
      setActiveTopic(topicInput.trim());
      fetchTrendingMemes(topicInput.trim());
    }
  };

  const findMatchingTemplate = (suggestedName: string): MemeTemplate => {
    const directMatch = POPULAR_TEMPLATES.find(
      (t) => t.name.toLowerCase() === suggestedName.toLowerCase()
    );
    if (directMatch) return directMatch;

    const partialMatch = POPULAR_TEMPLATES.find((t) =>
      suggestedName.toLowerCase().includes(t.name.toLowerCase()) ||
      t.name.toLowerCase().includes(suggestedName.toLowerCase())
    );
    if (partialMatch) return partialMatch;

    return POPULAR_TEMPLATES[0]; // fallback to classic Distracted Boyfriend
  };

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="p-3.5 bg-gradient-to-r from-amber-500/15 via-orange-500/15 to-red-500/15 border border-amber-500/30 rounded-2xl relative overflow-hidden shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-gradient-to-tr from-amber-400 to-orange-500 text-slate-950 shadow-md">
              <Flame className="w-4 h-4 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="text-xs font-black uppercase tracking-wider text-amber-300">
                  Live Viral Meme Trends
                </h3>
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 flex items-center gap-1">
                  <Globe className="w-2.5 h-2.5" />
                  Google Search Grounded
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Real-time internet culture mined from Reddit, TikTok & X to jumpstart memes
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => fetchTrendingMemes(activeTopic !== 'General Internet Viral' ? activeTopic : undefined)}
            disabled={isLoading}
            className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-850 border border-amber-400/40 text-amber-300 hover:text-white rounded-xl text-xs font-bold transition shadow cursor-pointer disabled:opacity-50"
            title="Refresh trends with live Google Search"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Searching...' : 'Refresh Trends'}</span>
          </button>
        </div>

        {/* Quick Topic Filter Input */}
        <form onSubmit={handleSearchTopic} className="mt-3 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={topicInput}
              onChange={(e) => setTopicInput(e.target.value)}
              placeholder="Search niche trends (e.g. Gaming, Crypto, Work from Home, Anime)..."
              className="w-full bg-slate-950/90 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !topicInput.trim()}
            className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl transition disabled:opacity-40 cursor-pointer shadow"
          >
            Search
          </button>
        </form>

        {/* Suggested Quick Filter Chips */}
        <div className="flex items-center gap-1.5 mt-2.5 overflow-x-auto pb-0.5 text-[10px]">
          <span className="text-slate-500 uppercase tracking-wider font-bold">Popular:</span>
          {['Tech & AI', 'Workplace Struggles', 'TikTok Brainrot', 'Gaming Relatable', 'Crypto & Stocks'].map(
            (chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => {
                  setTopicInput(chip);
                  setActiveTopic(chip);
                  fetchTrendingMemes(chip);
                }}
                className={`px-2 py-0.5 rounded-full border transition whitespace-nowrap cursor-pointer ${
                  activeTopic === chip
                    ? 'bg-amber-400/20 text-amber-300 border-amber-400'
                    : 'bg-slate-950/80 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                {chip}
              </button>
            )
          )}
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="py-12 flex flex-col items-center justify-center space-y-3 bg-slate-950/50 rounded-2xl border border-slate-800">
          <div className="relative">
            <Globe className="w-8 h-8 text-amber-400 animate-spin" style={{ animationDuration: '3s' }} />
            <Sparkles className="w-4 h-4 text-purple-400 absolute -top-1 -right-1 animate-pulse" />
          </div>
          <p className="text-xs font-bold text-slate-300">
            Grounding trends with Google Search...
          </p>
          <p className="text-[11px] text-slate-500">
            Analyzing TikTok, Reddit, and Twitter discussions for viral formats
          </p>
        </div>
      )}

      {/* Error state */}
      {error && !isLoading && (
        <div className="p-3 bg-red-950/40 border border-red-800 text-red-200 rounded-xl text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={() => fetchTrendingMemes()}
            className="px-2 py-1 bg-red-900/60 hover:bg-red-800 rounded text-[11px] font-bold text-white transition"
          >
            Retry
          </button>
        </div>
      )}

      {/* Trending Cards Grid */}
      {!isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[460px] overflow-y-auto pr-1">
          {trends.map((trend, idx) => {
            const matchedTemplate = findMatchingTemplate(trend.suggestedTemplateName);

            return (
              <div
                key={trend.id || idx}
                className="p-3.5 bg-slate-950 border border-slate-800 hover:border-amber-400/70 rounded-2xl flex flex-col justify-between transition-all group shadow-md hover:shadow-amber-500/5 relative overflow-hidden"
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-400/10 text-amber-300 border border-amber-400/20">
                      {trend.vibeBadge || 'Viral'}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1 font-mono">
                      <TrendingUp className="w-3 h-3" />
                      {trend.viralityScore || 95}% Hot
                    </span>
                  </div>

                  {/* Title & Lore */}
                  <h4 className="text-sm font-black text-white group-hover:text-amber-400 transition flex items-center gap-1.5">
                    {trend.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {trend.description}
                  </p>

                  {/* Suggested Captions Preview Box */}
                  <div className="mt-2.5 p-2 bg-slate-900/90 rounded-xl border border-slate-800/80 space-y-1">
                    <div className="text-[10px] font-mono text-slate-400 flex items-center justify-between">
                      <span className="font-semibold text-amber-400/90">TOP:</span>
                      <span className="truncate max-w-[190px] text-slate-200">
                        {trend.setupCaption}
                      </span>
                    </div>
                    <div className="text-[10px] font-mono text-slate-400 flex items-center justify-between border-t border-slate-800/60 pt-1">
                      <span className="font-semibold text-purple-400">BOTTOM:</span>
                      <span className="truncate max-w-[190px] text-slate-200 font-bold">
                        {trend.punchlineCaption}
                      </span>
                    </div>
                  </div>

                  {/* Matched Template Badge */}
                  <div className="mt-2 flex items-center gap-2 text-[10px] text-slate-400">
                    <span className="text-slate-500 font-semibold">Format:</span>
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <img
                        src={matchedTemplate.thumbnail}
                        alt={matchedTemplate.name}
                        className="w-4 h-4 rounded object-cover border border-slate-700"
                      />
                      <span className="font-medium truncate max-w-[140px]">
                        {matchedTemplate.name}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Primary Action Button */}
                <button
                  type="button"
                  onClick={() => onStartMemeFromTrend(trend, matchedTemplate)}
                  className="mt-3.5 w-full py-2 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition flex items-center justify-center gap-1.5 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Start Meme with This Trend</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Grounding Metadata Drawer (Sources & Queries) */}
      {(sources.length > 0 || searchQueries.length > 0) && (
        <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
              <span>Google Search Grounding Context</span>
              <span className="text-[10px] text-slate-500">
                ({sources.length} sources)
              </span>
            </span>
            <button
              type="button"
              onClick={() => setShowSources(!showSources)}
              className="text-[10px] text-amber-400 hover:underline cursor-pointer"
            >
              {showSources ? 'Hide Sources' : 'View Sources'}
            </button>
          </div>

          {showSources && (
            <div className="mt-2.5 space-y-2 pt-2 border-t border-slate-800 text-[11px]">
              {searchQueries.length > 0 && (
                <div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">
                    Queries executed:
                  </span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {searchQueries.map((q, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md bg-slate-900 text-slate-300 text-[10px] font-mono border border-slate-800"
                      >
                        "{q}"
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {sources.length > 0 && (
                <div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">
                    Live Verified Web Sources:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mt-1">
                    {sources.map((s, idx) => (
                      <a
                        key={idx}
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 bg-slate-900 hover:bg-slate-850 rounded-lg text-[10px] text-slate-300 hover:text-amber-300 transition flex items-center justify-between gap-1 border border-slate-800 truncate"
                      >
                        <span className="truncate">{s.title}</span>
                        <ExternalLink className="w-3 h-3 shrink-0 text-slate-500" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
