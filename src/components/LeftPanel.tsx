import React, { useState } from 'react';
import { Lightbulb, CheckSquare, Eye, EyeOff, ChevronRight, ChevronLeft, BookOpen, AlertCircle, Sparkles, Copy, Check } from 'lucide-react';
import { Challenge } from '../types/challenge';
import { MarkdownRenderer } from './MarkdownRenderer';

interface LeftPanelProps {
  challenge: Challenge;
  revealedHintCount: number;
  onRevealNextHint: () => void;
  onApplySolution: (solutionCode: string) => void;
  onPrevChallenge?: () => void;
  onNextChallenge?: () => void;
  hasPrev: boolean;
  hasNext: boolean;
  isCompleted: boolean;
}

export const LeftPanel: React.FC<LeftPanelProps> = ({
  challenge,
  revealedHintCount,
  onRevealNextHint,
  onApplySolution,
  onPrevChallenge,
  onNextChallenge,
  hasPrev,
  hasNext,
  isCompleted,
}) => {
  const [activeTab, setActiveTab] = useState<'theory' | 'requirements' | 'hints' | 'solution'>('theory');
  const [solutionRevealed, setSolutionRevealed] = useState(false);
  const [copiedSolution, setCopiedSolution] = useState(false);

  const copySolution = () => {
    navigator.clipboard.writeText(challenge.solutionCode);
    setCopiedSolution(true);
    setTimeout(() => setCopiedSolution(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-900 border-r border-slate-800 overflow-hidden">
      {/* Title & Navigation Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-900/90 shrink-0">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
          <span className="font-semibold text-amber-500 uppercase tracking-wider text-[11px]">{challenge.category}</span>
          <div className="flex items-center gap-1">
            <button
              onClick={onPrevChallenge}
              disabled={!hasPrev}
              className="p-1 rounded hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
              title="Previous practice"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={onNextChallenge}
              disabled={!hasNext}
              className="p-1 rounded hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
              title="Next practice"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold text-white tracking-tight leading-snug">{challenge.title}</h2>
          {isCompleted && (
            <span className="shrink-0 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[11px] font-medium">
              Solved ✓
            </span>
          )}
        </div>

        <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">{challenge.summary}</p>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-slate-800/80">
          <button
            onClick={() => setActiveTab('theory')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
              activeTab === 'theory' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Explanation & Code</span>
          </button>

          <button
            onClick={() => setActiveTab('requirements')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
              activeTab === 'requirements' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Goals ({challenge.requirements.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('hints')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer relative ${
              activeTab === 'hints' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Lightbulb className="w-3.5 h-3.5" />
            <span>Clues ({revealedHintCount}/{challenge.hints.length})</span>
            {revealedHintCount > 0 && activeTab !== 'hints' && (
              <span className="w-2 h-2 rounded-full bg-amber-400 absolute top-1 right-1" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('solution')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ml-auto ${
              activeTab === 'solution' ? 'bg-slate-800 text-amber-400 font-bold border border-amber-500/30' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Solution</span>
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Theory Tab */}
        {activeTab === 'theory' && (
          <div className="space-y-3">
            <MarkdownRenderer content={challenge.theory} />
          </div>
        )}

        {/* Requirements Tab */}
        {activeTab === 'requirements' && (
          <div className="space-y-4">
            <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 space-y-2">
              <h3 className="text-xs font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <CheckSquare className="w-4 h-4" />
                <span>Challenge Objectives</span>
              </h3>
              <p className="text-xs text-slate-400">
                Write code in the editor on the right that satisfies each of the following criteria:
              </p>
            </div>

            <div className="space-y-2">
              {challenge.requirements.map((req, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3 rounded-lg bg-slate-950/40 border border-slate-800/80 text-xs text-slate-200"
                >
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-amber-500/15 text-amber-400 font-mono text-[11px] font-bold shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <div className="leading-relaxed">
                    <MarkdownRenderer content={req} />
                  </div>
                </div>
              ))}
            </div>

            {challenge.validationMode === 'tests' && (
              <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-800/30 text-emerald-300 text-xs flex items-center gap-2">
                <Sparkles className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>This challenge is evaluated using an authentic Rust unit test suite (`cargo test`).</span>
              </div>
            )}
          </div>
        )}

        {/* Hints / Clues Tab */}
        {activeTab === 'hints' && (
          <div className="space-y-4">
            <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 space-y-1">
              <h3 className="text-xs font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Lightbulb className="w-4 h-4" />
                <span>Progressive Clues</span>
              </h3>
              <p className="text-xs text-slate-400">
                Stuck? Reveal hints step by step without spoiling the entire answer.
              </p>
            </div>

            {challenge.hints.length === 0 ? (
              <div className="text-slate-500 text-xs py-4 text-center">No hints provided for this challenge.</div>
            ) : (
              <div className="space-y-3">
                {challenge.hints.slice(0, revealedHintCount).map((hint, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-lg bg-amber-500/10 border border-amber-500/25 text-xs text-slate-200 space-y-1 animate-fadeIn"
                  >
                    <div className="flex items-center justify-between text-amber-400 font-semibold text-[11px]">
                      <span>Clue {idx + 1} of {challenge.hints.length}</span>
                    </div>
                    <div className="text-slate-300 leading-relaxed pt-1">
                      <MarkdownRenderer content={hint} />
                    </div>
                  </div>
                ))}

                {revealedHintCount < challenge.hints.length && (
                  <button
                    onClick={onRevealNextHint}
                    className="w-full py-2.5 px-4 rounded-lg bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-xs text-amber-300 font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Lightbulb className="w-4 h-4 text-amber-400" />
                    <span>
                      Reveal Clue {revealedHintCount + 1} of {challenge.hints.length}
                    </span>
                  </button>
                )}

                {revealedHintCount === challenge.hints.length && (
                  <p className="text-center text-xs text-slate-500 italic">All hints revealed!</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Solution Tab */}
        {activeTab === 'solution' && (
          <div className="space-y-4">
            {!solutionRevealed ? (
              <div className="p-6 rounded-lg bg-slate-950/70 border border-slate-800 text-center space-y-3">
                <AlertCircle className="w-8 h-8 text-amber-400 mx-auto" />
                <h3 className="text-sm font-semibold text-white">Reveal the Official Solution?</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  We encourage you to try solving the challenge or using the progressive clues first! If you are stuck or want to compare approaches, reveal it below.
                </p>
                <button
                  onClick={() => setSolutionRevealed(true)}
                  className="px-4 py-2 rounded-md bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer"
                >
                  Yes, Show Solution
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <button
                      type="button"
                      onClick={() => setSolutionRevealed(false)}
                      title="Hide solution"
                      className="cursor-pointer hover:text-white"
                    >
                      <EyeOff className="w-4 h-4" />
                    </button>
                    <span>Reference Solution:</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={copySolution}
                      className="flex items-center gap-1 text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
                    >
                      {copiedSolution ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedSolution ? 'Copied' : 'Copy'}</span>
                    </button>
                    <button
                      onClick={() => onApplySolution(challenge.solutionCode)}
                      className="px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Apply to Editor
                    </button>
                  </div>
                </div>

                <div className="rounded-lg overflow-hidden border border-slate-700 bg-slate-950 font-mono text-xs">
                  <pre className="p-3 overflow-x-auto text-amber-200 leading-relaxed">
                    <code>{challenge.solutionCode}</code>
                  </pre>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
