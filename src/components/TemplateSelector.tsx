import React, { useState } from 'react';
import { POPULAR_TEMPLATES, MemeTemplate } from '../data/templates';
import { TrendingMemeConcept } from '../types';
import { TrendingSection } from './TrendingSection';
import { Upload, Search, Sparkles, Flame, LayoutGrid } from 'lucide-react';

interface TemplateSelectorProps {
  onSelectTemplate: (template: MemeTemplate) => void;
  onUploadImage: (file: File) => void;
  onOpenAiGenerator: () => void;
  onSelectTrendingTrend?: (trend: TrendingMemeConcept, matchedTemplate: MemeTemplate) => void;
}

const CATEGORIES = ['All', 'Classic', 'Work & Tech', 'Reactions', 'Animals'] as const;

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  onSelectTemplate,
  onUploadImage,
  onOpenAiGenerator,
  onSelectTrendingTrend,
}) => {
  const [activeTab, setActiveTab] = useState<'trending' | 'all'>('trending');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTemplates = POPULAR_TEMPLATES.filter((tpl) => {
    const matchesCategory = selectedCategory === 'All' || tpl.category === selectedCategory;
    const matchesSearch =
      searchQuery === '' ||
      tpl.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tpl.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUploadImage(file);
    }
  };

  const handleStartTrendingTrend = (trend: TrendingMemeConcept, matchedTemplate: MemeTemplate) => {
    if (onSelectTrendingTrend) {
      onSelectTrendingTrend(trend, matchedTemplate);
    } else {
      onSelectTemplate(matchedTemplate);
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload & AI generation banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <label className="flex items-center justify-center gap-2 p-2.5 bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 border border-slate-700/80 rounded-xl cursor-pointer transition text-xs font-bold uppercase tracking-wider text-slate-200 shadow-md">
          <Upload className="w-4 h-4 text-amber-400" />
          <span>Upload Custom Photo</span>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileInputChange}
            className="hidden"
          />
        </label>

        <button
          onClick={onOpenAiGenerator}
          className="flex items-center justify-center gap-2 p-2.5 bg-gradient-to-r from-purple-900/50 to-pink-900/50 hover:from-purple-800/60 hover:to-pink-800/60 border border-purple-500/40 rounded-xl transition text-xs font-bold uppercase tracking-wider text-purple-200 shadow-md cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span>Generate with AI Prompt</span>
        </button>
      </div>

      {/* Main Mode Toggle: Live Trending vs Template Library */}
      <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
        <button
          type="button"
          onClick={() => setActiveTab('trending')}
          className={`flex-1 py-2 rounded-lg text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer ${
            activeTab === 'trending'
              ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Flame className="w-3.5 h-3.5" />
          <span>🔥 Live Viral Trends</span>
          <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-slate-950/40 text-amber-200 font-normal hidden sm:inline">
            Search Grounded
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={`flex-1 py-2 rounded-lg text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer ${
            activeTab === 'all'
              ? 'bg-amber-400 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <LayoutGrid className="w-3.5 h-3.5" />
          <span>Template Library</span>
          <span className="text-[9px] text-slate-400 font-mono hidden sm:inline">
            ({POPULAR_TEMPLATES.length})
          </span>
        </button>
      </div>

      {/* 1. Live Trending Section with Google Search Grounding */}
      {activeTab === 'trending' && (
        <TrendingSection onStartMemeFromTrend={handleStartTrendingTrend} />
      )}

      {/* 2. Classic Template Library Grid */}
      {activeTab === 'all' && (
        <div className="space-y-3">
          {/* Search & Category Filter */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search templates (e.g., Drake, Distracted, Doge)..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-amber-400 text-slate-950 font-bold'
                      : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Templates Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[380px] overflow-y-auto pr-1">
            {filteredTemplates.map((template) => (
              <div
                key={template.id}
                onClick={() => onSelectTemplate(template)}
                className="group relative rounded-xl border border-slate-800 hover:border-amber-400/80 bg-slate-950 overflow-hidden cursor-pointer transition-all hover:scale-[1.02] shadow-md flex flex-col"
              >
                <div className="aspect-[4/3] w-full bg-slate-900 flex items-center justify-center overflow-hidden">
                  <img
                    src={template.thumbnail}
                    alt={template.name}
                    className="w-full h-full object-cover group-hover:opacity-90 transition"
                  />
                </div>
                <div className="p-2 bg-slate-900/90 border-t border-slate-800/80">
                  <div className="text-[11px] font-bold text-slate-200 truncate group-hover:text-amber-400 transition">
                    {template.name}
                  </div>
                  <div className="text-[9px] uppercase tracking-wider text-slate-500 font-mono">
                    {template.category}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
