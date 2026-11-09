import React from 'react';
import { Menu, PlusCircle, RotateCcw, CheckCircle2, Terminal } from 'lucide-react';
import { Challenge } from '../types/challenge';

interface HeaderProps {
  challenges: Challenge[];
  completedIds: string[];
  edition: '2021' | '2024';
  setEdition: (edition: '2021' | '2024') => void;
  onOpenSidebar: () => void;
  onOpenCustomModal: () => void;
  onResetProgress: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  challenges,
  completedIds,
  edition,
  setEdition,
  onOpenSidebar,
  onOpenCustomModal,
  onResetProgress,
}) => {
  const total = challenges.length;
  const completed = completedIds.length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <header className="h-14 border-b border-slate-800 bg-slate-900/90 backdrop-blur px-4 flex items-center justify-between select-none z-10 shrink-0">
      {/* Left: Brand & Sidebar toggle */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenSidebar}
          className="p-1.5 rounded-md hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
          title="Open Curriculum & Challenges"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-600 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/20 text-white font-black text-lg">
            🦀
          </div>
          <div>
            <h1 className="font-bold text-slate-100 text-sm tracking-tight flex items-center gap-2">
              Learn Rust By Coding
              <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                Interactive
              </span>
            </h1>
            <p className="text-[11px] text-slate-400 leading-none">Real rustc compiler • Zero backend</p>
          </div>
        </div>
      </div>

      {/* Middle: Progress tracker */}
      <div className="hidden md:flex items-center gap-3 bg-slate-950/70 border border-slate-800/80 px-3 py-1.5 rounded-full">
        <div className="flex items-center gap-1.5 text-xs text-slate-300 font-medium">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>
            {completed} / {total} Completed
          </span>
          <span className="text-slate-500">({percentage}%)</span>
        </div>
        <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 rounded-full transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Right: Edition toggle & Custom Challenges */}
      <div className="flex items-center gap-2">
        {/* Edition selector */}
        <div className="flex items-center bg-slate-950 border border-slate-800 rounded-md p-0.5 text-xs">
          <span className="px-2 text-slate-400 font-mono text-[11px] hidden sm:inline">Edition:</span>
          <button
            onClick={() => setEdition('2021')}
            className={`px-2 py-0.5 rounded text-xs font-mono transition-colors cursor-pointer ${
              edition === '2021' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            2021
          </button>
          <button
            onClick={() => setEdition('2024')}
            className={`px-2 py-0.5 rounded text-xs font-mono transition-colors cursor-pointer ${
              edition === '2024' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            2024
          </button>
        </div>

        {/* Custom Challenges button */}
        <button
          onClick={onOpenCustomModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-medium transition-colors cursor-pointer"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Custom JSON</span>
        </button>

        {/* Reset progress */}
        <button
          onClick={onResetProgress}
          className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
          title="Reset All Progress"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
