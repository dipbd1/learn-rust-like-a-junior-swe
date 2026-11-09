import React from 'react';
import { Trophy, ArrowRight, Sparkles, X } from 'lucide-react';
import confetti from 'canvas-confetti';

interface CelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNextChallenge: () => void;
  hasNext: boolean;
  challengeTitle: string;
}

export const triggerConfetti = () => {
  confetti({
    particleCount: 80,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#f59e0b', '#10b981', '#3b82f6', '#ec4899', '#f97316'],
  });
};

export const CelebrationModal: React.FC<CelebrationModalProps> = ({
  isOpen,
  onClose,
  onNextChallenge,
  hasNext,
  challengeTitle,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/70 backdrop-blur-xs" onClick={onClose} />

      {/* Card */}
      <div className="relative w-full max-w-md bg-slate-900 border border-amber-500/40 rounded-2xl p-6 shadow-2xl text-center z-10 animate-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 mx-auto flex items-center justify-center shadow-lg shadow-orange-500/30 text-white mb-4">
          <Trophy className="w-8 h-8" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-xs font-semibold mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Challenge Passed!</span>
        </div>

        <h3 className="text-xl font-bold text-white mb-1">Awesome Work, Rustacean!</h3>
        <p className="text-xs text-slate-300 max-w-xs mx-auto mb-6">
          You conquered <span className="text-amber-400 font-semibold">"{challengeTitle}"</span>. All compiler checks and test assertions passed.
        </p>

        <div className="flex items-center justify-center gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
          >
            Stay on this practice
          </button>

          {hasNext && (
            <button
              onClick={() => {
                onClose();
                onNextChallenge();
              }}
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs shadow-md shadow-orange-500/20 transition-all cursor-pointer"
            >
              <span>Next Practice</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
