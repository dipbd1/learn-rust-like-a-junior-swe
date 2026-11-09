import React, { useState } from 'react';
import { X, Upload, Download, Plus, Check, AlertCircle, FileCode, Sparkles, BookOpen } from 'lucide-react';
import { Challenge, Difficulty, ValidationMode } from '../types/challenge';
import { validateChallenge, validateChallengeList } from '../utils/challengeValidator';
import { exportChallengesAsJson } from '../services/challengeStorage';

interface CustomChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddChallenge: (challenge: Challenge) => void;
  allChallenges: Challenge[];
}

const SAMPLE_JSON_CHALLENGE = {
  id: "custom-fibonacci-recursion",
  title: "Recursion & Match: Fibonacci",
  category: "Custom Practices",
  difficulty: "beginner",
  summary: "Write a recursive Fibonacci sequence calculator in Rust using pattern matching.",
  theory: "### Recursion in Rust\n\nRecursion is natural in Rust. When matching base cases, using `match` provides an expressive and safe way to handle integer patterns:\n\n```rust\nmatch n {\n    0 => 0,\n    1 => 1,\n    _ => fib(n - 1) + fib(n - 2),\n}\n```",
  requirements: [
    "Define `pub fn fib(n: u32) -> u32`",
    "Return 0 for n = 0, 1 for n = 1",
    "Compute sum of previous two terms for n >= 2"
  ],
  hints: [
    "Clue 1: Use a match expression on `n`.",
    "Clue 2: The wildcard pattern `_` handles all integers greater than 1."
  ],
  starterCode: "pub fn fib(n: u32) -> u32 {\n    // TODO: Implement recursive Fibonacci\n    todo!()\n}\n\nfn main() {\n    println!(\"fib(6) = {}\", fib(6));\n}",
  solutionCode: "pub fn fib(n: u32) -> u32 {\n    match n {\n        0 => 0,\n        1 => 1,\n        _ => fib(n - 1) + fib(n - 2),\n    }\n}\n\nfn main() {\n    println!(\"fib(6) = {}\", fib(6));\n}",
  testCode: "\n#[cfg(test)]\nmod tests {\n    use super::*; \n\n    #[test]\n    fn test_fib() {\n        assert_eq!(fib(0), 0);\n        assert_eq!(fib(1), 1);\n        assert_eq!(fib(6), 8);\n        assert_eq!(fib(10), 55);\n    }\n}",
  validationMode: "tests"
};

export const CustomChallengeModal: React.FC<CustomChallengeModalProps> = ({
  isOpen,
  onClose,
  onAddChallenge,
  allChallenges,
}) => {
  const [tab, setTab] = useState<'json' | 'form'>('json');
  const [jsonText, setJsonText] = useState<string>('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    category: 'Custom Practices',
    difficulty: 'beginner' as Difficulty,
    summary: '',
    theory: '',
    requirements: '',
    hints: '',
    starterCode: '// Starter code\npub fn solve() {\n    todo!()\n}\n\nfn main() {\n    solve();\n}',
    solutionCode: 'pub fn solve() {\n    println!("Done");\n}\n\nfn main() {\n    solve();\n}',
    testCode: '#[cfg(test)]\nmod tests {\n    use super::*;\n\n    #[test]\n    fn test_solve() {\n        assert!(true);\n    }\n}',
  });

  if (!isOpen) return null;

  const handleLoadSample = () => {
    setJsonText(JSON.stringify(SAMPLE_JSON_CHALLENGE, null, 2));
    setValidationError(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      const content = event.target?.result as string;
      setJsonText(content);
      setValidationError(null);
    };
    reader.readAsText(file);
  };

  const handleImportJson = () => {
    try {
      setValidationError(null);
      setSuccessMessage(null);

      if (!jsonText.trim()) {
        setValidationError('Please paste JSON content or load a sample first.');
        return;
      }

      const parsed = JSON.parse(jsonText);
      const result = validateChallengeList(parsed);

      if (!result.valid) {
        setValidationError(result.errors.join('\n'));
        return;
      }

      // Add each valid challenge
      for (const ch of result.challenges) {
        onAddChallenge(ch);
      }

      setSuccessMessage(`Successfully imported ${result.challenges.length} challenge(s)!`);
      setTimeout(() => {
        onClose();
        setSuccessMessage(null);
      }, 1500);
    } catch (err: any) {
      setValidationError(`Invalid JSON syntax: ${err.message}`);
    }
  };

  const handleExportAll = () => {
    const jsonStr = exportChallengesAsJson(allChallenges);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rust-challenges-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const challengePayload = {
      id: `custom-${formData.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now().toString().slice(-4)}`,
      title: formData.title,
      category: formData.category,
      difficulty: formData.difficulty,
      summary: formData.summary,
      theory: formData.theory,
      requirements: formData.requirements.split('\n').filter(r => r.trim().length > 0),
      hints: formData.hints.split('\n').filter(h => h.trim().length > 0),
      starterCode: formData.starterCode,
      solutionCode: formData.solutionCode,
      testCode: formData.testCode,
      validationMode: 'tests' as ValidationMode,
    };

    const res = validateChallenge(challengePayload);
    if (!res.valid || !res.challenge) {
      setValidationError(res.errors.map(err => `${err.field}: ${err.message}`).join(', '));
      return;
    }

    onAddChallenge(res.challenge);
    setSuccessMessage(`Challenge "${formData.title}" created successfully!`);
    setTimeout(() => {
      onClose();
      setSuccessMessage(null);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/75 backdrop-blur-xs" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden z-10">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Custom Rust Challenges</h2>
              <p className="text-xs text-slate-400">Add, import, or export custom challenges using standard JSON schema</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch & Actions */}
        <div className="px-4 py-2.5 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTab('json')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                tab === 'json' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              JSON Import / Editor
            </button>
            <button
              onClick={() => setTab('form')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                tab === 'form' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              Visual Form Creator
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportAll}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium transition-colors cursor-pointer"
              title="Download all challenges as a JSON file"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>Export JSON ({allChallenges.length})</span>
            </button>
          </div>
        </div>

        {/* Messages */}
        {validationError && (
          <div className="m-4 mb-0 p-3 rounded-lg bg-rose-950/40 border border-rose-800 text-rose-300 text-xs flex items-start gap-2 whitespace-pre-wrap">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
            <div>{validationError}</div>
          </div>
        )}

        {successMessage && (
          <div className="m-4 mb-0 p-3 rounded-lg bg-emerald-950/40 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>{successMessage}</div>
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4">
          {tab === 'json' ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Paste your JSON challenge or upload a .json file:</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleLoadSample}
                    className="text-amber-400 hover:underline flex items-center gap-1 cursor-pointer font-medium"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    Load Sample JSON
                  </button>

                  <label className="flex items-center gap-1 text-slate-300 hover:text-white px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 cursor-pointer transition-colors">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload File</span>
                    <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
                  </label>
                </div>
              </div>

              <textarea
                value={jsonText}
                onChange={e => setJsonText(e.target.value)}
                placeholder={`{\n  "id": "my-challenge",\n  "title": "Title",\n  "category": "My Category",\n  "difficulty": "beginner",\n  "summary": "Short summary",\n  "theory": "Markdown theory...",\n  "requirements": ["Requirement 1"],\n  "hints": ["Hint 1"],\n  "starterCode": "fn main() {}",\n  "solutionCode": "fn main() {}",\n  "testCode": "#[cfg(test)] mod tests { ... }",\n  "validationMode": "tests"\n}`}
                className="w-full h-80 p-3 bg-slate-950 border border-slate-800 rounded-lg font-mono text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500 leading-relaxed"
              />

              <div className="flex justify-end gap-2">
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleImportJson}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Import & Save Challenge</span>
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Challenge Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Iterators: Custom Filter"
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded text-slate-200 focus:border-amber-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Category</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded text-slate-200 focus:border-amber-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Difficulty</label>
                  <select
                    value={formData.difficulty}
                    onChange={e => setFormData({ ...formData, difficulty: e.target.value as Difficulty })}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded text-slate-200 focus:border-amber-500 outline-none"
                  >
                    <option value="beginner">Beginner (Easy)</option>
                    <option value="intermediate">Intermediate (Medium)</option>
                    <option value="advanced">Advanced (Hard)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">One-line Summary *</label>
                  <input
                    type="text"
                    required
                    value={formData.summary}
                    onChange={e => setFormData({ ...formData, summary: e.target.value })}
                    placeholder="Brief description of the practice"
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded text-slate-200 focus:border-amber-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Theory & Explanation (Markdown supported) *</label>
                <textarea
                  rows={4}
                  required
                  value={formData.theory}
                  onChange={e => setFormData({ ...formData, theory: e.target.value })}
                  placeholder="Explain the Rust concept, why it matters, syntax snippets..."
                  className="w-full p-2 bg-slate-950 border border-slate-800 rounded font-mono text-slate-200 focus:border-amber-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Objectives (one per line) *</label>
                  <textarea
                    rows={3}
                    required
                    value={formData.requirements}
                    onChange={e => setFormData({ ...formData, requirements: e.target.value })}
                    placeholder="Implement solve()&#10;Return valid String&#10;Handle edge case"
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded font-mono text-slate-200 focus:border-amber-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Progressive Clues (one per line)</label>
                  <textarea
                    rows={3}
                    value={formData.hints}
                    onChange={e => setFormData({ ...formData, hints: e.target.value })}
                    placeholder="Clue 1: Check the function signature&#10;Clue 2: Use match expression"
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded font-mono text-slate-200 focus:border-amber-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Starter Code *</label>
                  <textarea
                    rows={5}
                    required
                    value={formData.starterCode}
                    onChange={e => setFormData({ ...formData, starterCode: e.target.value })}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded font-mono text-slate-200 focus:border-amber-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Solution Code *</label>
                  <textarea
                    rows={5}
                    required
                    value={formData.solutionCode}
                    onChange={e => setFormData({ ...formData, solutionCode: e.target.value })}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded font-mono text-slate-200 focus:border-amber-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Test Code (cargo test harness) *</label>
                <textarea
                  rows={4}
                  required
                  value={formData.testCode}
                  onChange={e => setFormData({ ...formData, testCode: e.target.value })}
                  className="w-full p-2 bg-slate-950 border border-slate-800 rounded font-mono text-slate-200 focus:border-amber-500 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Challenge</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
