import React, { useState } from 'react';
import { X, CheckCircle2, Circle, Sparkles, Trash2, Search, BookOpen, Layers } from 'lucide-react';
import { Challenge, Difficulty } from '../types/challenge';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  challenges: Challenge[];
  currentChallengeId: string;
  completedIds: string[];
  onSelectChallenge: (id: string) => void;
  onDeleteCustomChallenge: (id: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  challenges,
  currentChallengeId,
  completedIds,
  onSelectChallenge,
  onDeleteCustomChallenge,
}) => {
  const [search, setSearch] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState<Difficulty | 'all'>('all');

  if (!isOpen) return null;

  // Filter challenges
  const filtered = challenges.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase()) || c.category.toLowerCase().includes(search.toLowerCase());
    const matchesDifficulty = filterDifficulty === 'all' || c.difficulty === filterDifficulty;
    return matchesSearch && matchesDifficulty;
  });

  // Group by category
  const categories = Array.from(new Set(filtered.map(c => c.category)));

  const getDifficultyBadge = (diff: Difficulty) => {
    switch (diff) {
      case 'beginner':
        return <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">Easy</span>;
      case 'intermediate':
        return <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium">Medium</span>;
      case 'advanced':
        return <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 font-medium">Hard</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity" onClick={onClose} />

      {/* Drawer */}
      <div className="relative w-80 md:w-96 max-w-full bg-slate-900 border-r border-slate-800 h-full flex flex-col z-10 shadow-2xl">
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-400" />
            <h2 className="font-bold text-slate-100 text-sm">Curriculum & Practices</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Filter */}
        <div className="p-3 border-b border-slate-800 space-y-2 bg-slate-950/40">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-2.5 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search practices..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-md text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex items-center gap-1 text-[11px]">
            {(['all', 'beginner', 'intermediate', 'advanced'] as const).map(d => (
              <button
                key={d}
                onClick={() => setFilterDifficulty(d)}
                className={`px-2 py-0.5 rounded capitalize transition-colors cursor-pointer ${
                  filterDifficulty === d ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Challenges List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          {categories.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-xs">No challenges match your search filter.</div>
          ) : (
            categories.map(cat => {
              const items = filtered.filter(c => c.category === cat);
              return (
                <div key={cat} className="space-y-1">
                  <div className="flex items-center gap-1.5 px-2 py-1 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    <Layers className="w-3.5 h-3.5 text-amber-500" />
                    <span>{cat}</span>
                    <span className="text-[10px] text-slate-500 font-normal ml-auto">({items.length})</span>
                  </div>

                  <div className="space-y-1">
                    {items.map(challenge => {
                      const isSelected = challenge.id === currentChallengeId;
                      const isCompleted = completedIds.includes(challenge.id);

                      return (
                        <div
                          key={challenge.id}
                          className={`group flex items-center justify-between p-2 rounded-lg text-xs transition-all cursor-pointer border ${
                            isSelected
                              ? 'bg-amber-500/15 border-amber-500/40 text-amber-200 shadow-sm'
                              : 'bg-slate-950/40 hover:bg-slate-800/60 border-slate-800/60 text-slate-300'
                          }`}
                          onClick={() => {
                            onSelectChallenge(challenge.id);
                            onClose();
                          }}
                        >
                          <div className="flex items-center gap-2.5 min-w-0 pr-2">
                            {isCompleted ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                            ) : (
                              <Circle className="w-4 h-4 text-slate-600 shrink-0" />
                            )}
                            <div className="truncate">
                              <div className="font-medium truncate flex items-center gap-1.5">
                                <span>{challenge.title}</span>
                                {challenge.isCustom && (
                                  <span className="px-1 py-0.2 rounded bg-purple-500/20 text-purple-300 text-[9px] font-mono border border-purple-500/30">
                                    custom
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {getDifficultyBadge(challenge.difficulty)}

                            {challenge.isCustom && (
                              <button
                                onClick={e => {
                                  e.stopPropagation();
                                  if (confirm(`Delete custom challenge "${challenge.title}"?`)) {
                                    onDeleteCustomChallenge(challenge.id);
                                  }
                                }}
                                className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 rounded transition-opacity cursor-pointer"
                                title="Delete Custom Challenge"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/70 text-center text-[11px] text-slate-500">
          Tip: You can add custom challenges anytime via JSON.
        </div>
      </div>
    </div>
  );
};
