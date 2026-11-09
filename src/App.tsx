import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { LeftPanel } from './components/LeftPanel';
import { RightPanel } from './components/RightPanel';
import { CustomChallengeModal } from './components/CustomChallengeModal';
import { CelebrationModal, triggerConfetti } from './components/CelebrationModal';
import { Challenge, ExecutionResult, UserProgress } from './types/challenge';
import {
  getAllChallenges,
  getStoredProgress,
  saveUserProgress,
  addCustomChallenge,
  deleteCustomChallenge,
  resetAllUserProgress,
} from './services/challengeStorage';
import { DEFAULT_CHALLENGES } from './data/defaultChallenges';
import { executeRustCode, formatRustCode } from './services/rustRunner';

export function App() {
  const [challenges, setChallenges] = useState<Challenge[]>(() => getAllChallenges());
  const [progress, setProgress] = useState<UserProgress>(() => getStoredProgress());
  const [edition, setEdition] = useState<'2021' | '2024'>('2021');

  // UI Drawer / Modal States
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [isCelebrationOpen, setIsCelebrationOpen] = useState(false);

  // Execution States
  const [isExecuting, setIsExecuting] = useState(false);
  const [executingType, setExecutingType] = useState<'run' | 'test' | 'format' | null>(null);
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null);

  // Active Challenge
  const currentChallenge = useMemo(() => {
    return challenges.find(c => c.id === progress.currentChallengeId) || challenges[0];
  }, [challenges, progress.currentChallengeId]);

  // Current challenge index and navigation
  const currentIndex = useMemo(() => {
    return challenges.findIndex(c => c.id === currentChallenge.id);
  }, [challenges, currentChallenge.id]);

  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < challenges.length - 1;

  // Active Code for the Current Challenge
  const activeCode = useMemo(() => {
    if (progress.savedCode[currentChallenge.id] !== undefined) {
      return progress.savedCode[currentChallenge.id];
    }
    return currentChallenge.starterCode;
  }, [progress.savedCode, currentChallenge]);

  // Revealed hints count for current challenge
  const revealedHintCount = useMemo(() => {
    return progress.revealedHints[currentChallenge.id] || 0;
  }, [progress.revealedHints, currentChallenge.id]);

  // Save progress helper
  const updateProgress = (updater: (prev: UserProgress) => UserProgress) => {
    setProgress(prev => {
      const next = updater(prev);
      saveUserProgress(next);
      return next;
    });
  };

  // Change code
  const handleCodeChange = (newCode: string) => {
    updateProgress(prev => ({
      ...prev,
      savedCode: {
        ...prev.savedCode,
        [currentChallenge.id]: newCode,
      },
    }));
  };

  // Select Challenge
  const handleSelectChallenge = (id: string) => {
    setExecutionResult(null);
    updateProgress(prev => ({
      ...prev,
      currentChallengeId: id,
    }));
  };

  // Navigate Previous / Next
  const handlePrevChallenge = () => {
    if (hasPrev) {
      handleSelectChallenge(challenges[currentIndex - 1].id);
    }
  };

  const handleNextChallenge = () => {
    if (hasNext) {
      handleSelectChallenge(challenges[currentIndex + 1].id);
    }
  };

  // Progressive Hint Reveal
  const handleRevealNextHint = () => {
    if (revealedHintCount < currentChallenge.hints.length) {
      updateProgress(prev => ({
        ...prev,
        revealedHints: {
          ...prev.revealedHints,
          [currentChallenge.id]: revealedHintCount + 1,
        },
      }));
    }
  };

  // Apply Solution
  const handleApplySolution = (solutionCode: string) => {
    handleCodeChange(solutionCode);
  };

  // Reset Code
  const handleResetCode = () => {
    if (confirm('Reset your code back to the initial starter code?')) {
      handleCodeChange(currentChallenge.starterCode);
      setExecutionResult(null);
    }
  };

  // Run Code (main)
  const handleRunCode = async () => {
    setIsExecuting(true);
    setExecutingType('run');
    try {
      const result = await executeRustCode(activeCode, false, { edition });
      setExecutionResult(result);
    } finally {
      setIsExecuting(false);
      setExecutingType(null);
    }
  };

  // Run Tests & Submit
  const handleRunTests = async () => {
    setIsExecuting(true);
    setExecutingType('test');

    try {
      // Append test harness if available
      let codeToTest = activeCode;
      if (currentChallenge.testCode) {
        codeToTest = `${activeCode}\n\n// ==========================================\n// Built-in Validation Test Suite\n// ==========================================\n${currentChallenge.testCode}`;
      }

      const result = await executeRustCode(codeToTest, true, { edition });
      setExecutionResult(result);

      // Check if tests passed!
      const testPassed =
        result.success &&
        result.testSummary &&
        result.testSummary.failed === 0 &&
        result.testSummary.passed > 0;

      if (testPassed) {
        // Mark as completed
        if (!progress.completedIds.includes(currentChallenge.id)) {
          updateProgress(prev => ({
            ...prev,
            completedIds: [...prev.completedIds, currentChallenge.id],
          }));
        }

        // Trigger celebratory confetti and modal
        triggerConfetti();
        setIsCelebrationOpen(true);
      }
    } finally {
      setIsExecuting(false);
      setExecutingType(null);
    }
  };

  // Format Code
  const handleFormatCode = async () => {
    setIsExecuting(true);
    setExecutingType('format');
    try {
      const result = await formatRustCode(activeCode, edition);
      if (result.success && result.formattedCode) {
        handleCodeChange(result.formattedCode);
      } else if (result.error) {
        alert(`Format error: ${result.error}`);
      }
    } finally {
      setIsExecuting(false);
      setExecutingType(null);
    }
  };

  // Add Custom Challenge
  const handleAddCustomChallenge = (challenge: Challenge) => {
    const res = addCustomChallenge(challenge);
    if (res.success) {
      const updated = getAllChallenges();
      setChallenges(updated);
      handleSelectChallenge(challenge.id);
    } else {
      alert(res.error || 'Failed to add challenge');
    }
  };

  // Delete Custom Challenge
  const handleDeleteCustomChallenge = (id: string) => {
    deleteCustomChallenge(id);
    const updated = getAllChallenges();
    setChallenges(updated);
    if (currentChallenge.id === id) {
      handleSelectChallenge(updated[0]?.id || DEFAULT_CHALLENGES[0].id);
    }
  };

  // Reset Progress
  const handleResetProgress = () => {
    if (confirm('Are you sure you want to reset all progress and saved drafts?')) {
      resetAllUserProgress();
      setProgress(getStoredProgress());
      setExecutionResult(null);
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Top Navigation */}
      <Header
        challenges={challenges}
        completedIds={progress.completedIds}
        edition={edition}
        setEdition={setEdition}
        onOpenSidebar={() => setIsSidebarOpen(true)}
        onOpenCustomModal={() => setIsCustomModalOpen(true)}
        onResetProgress={handleResetProgress}
      />

      {/* Main Split Body */}
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {/* Left Panel: Theory, Instructions, Clues, Goals */}
        <div className="w-full md:w-[45%] lg:w-[42%] h-1/2 md:h-full flex flex-col border-b md:border-b-0 md:border-r border-slate-800 shrink-0">
          <LeftPanel
            challenge={currentChallenge}
            revealedHintCount={revealedHintCount}
            onRevealNextHint={handleRevealNextHint}
            onApplySolution={handleApplySolution}
            onPrevChallenge={handlePrevChallenge}
            onNextChallenge={handleNextChallenge}
            hasPrev={hasPrev}
            hasNext={hasNext}
            isCompleted={progress.completedIds.includes(currentChallenge.id)}
          />
        </div>

        {/* Right Panel: Rust Code Editor, Actions, Terminal Console */}
        <div className="w-full md:w-[55%] lg:w-[58%] h-1/2 md:h-full flex flex-col">
          <RightPanel
            code={activeCode}
            onChangeCode={handleCodeChange}
            onRunCode={handleRunCode}
            onRunTests={handleRunTests}
            onResetCode={handleResetCode}
            onFormatCode={handleFormatCode}
            isExecuting={isExecuting}
            executingType={executingType}
            executionResult={executionResult}
            validationMode={currentChallenge.validationMode}
          />
        </div>
      </main>

      {/* Sidebar Drawer */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        challenges={challenges}
        currentChallengeId={currentChallenge.id}
        completedIds={progress.completedIds}
        onSelectChallenge={handleSelectChallenge}
        onDeleteCustomChallenge={handleDeleteCustomChallenge}
      />

      {/* Custom Challenge Modal */}
      <CustomChallengeModal
        isOpen={isCustomModalOpen}
        onClose={() => setIsCustomModalOpen(false)}
        onAddChallenge={handleAddCustomChallenge}
        allChallenges={challenges}
      />

      {/* Celebration Modal on Passing Test */}
      <CelebrationModal
        isOpen={isCelebrationOpen}
        onClose={() => setIsCelebrationOpen(false)}
        onNextChallenge={handleNextChallenge}
        hasNext={hasNext}
        challengeTitle={currentChallenge.title}
      />
    </div>
  );
}

export default App;
