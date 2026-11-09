import React, { useState } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import {
  Play,
  CheckCircle,
  RotateCcw,
  Sparkles,
  Terminal,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Loader2,
  Copy,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Minimize2,
  Wand2
} from 'lucide-react';
import { ExecutionResult } from '../types/challenge';

interface RightPanelProps {
  code: string;
  onChangeCode: (code: string) => void;
  onRunCode: () => void;
  onRunTests: () => void;
  onResetCode: () => void;
  onFormatCode: () => void;
  isExecuting: boolean;
  executingType: 'run' | 'test' | 'format' | null;
  executionResult: ExecutionResult | null;
  validationMode: 'tests' | 'output' | 'compile';
}

export const RightPanel: React.FC<RightPanelProps> = ({
  code,
  onChangeCode,
  onRunCode,
  onRunTests,
  onResetCode,
  onFormatCode,
  isExecuting,
  executingType,
  executionResult,
  validationMode,
}) => {
  const [activeConsoleTab, setActiveConsoleTab] = useState<'output' | 'tests' | 'diagnostics'>('output');
  const [consoleHeight, setConsoleHeight] = useState<number>(240);
  const [isConsoleCollapsed, setIsConsoleCollapsed] = useState<boolean>(false);
  const [copiedOutput, setCopiedOutput] = useState(false);

  const handleEditorMount: OnMount = (editor, monaco) => {
    // Configure editor defaults
    editor.updateOptions({
      fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', Consolas, monospace",
      fontSize: 13,
      lineHeight: 20,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      renderLineHighlight: 'all',
      tabSize: 4,
      insertSpaces: true,
      wordWrap: 'on',
      automaticLayout: true,
    });
  };

  const copyOutput = () => {
    const text = (executionResult?.stdout || '') + '\n' + (executionResult?.stderr || '');
    navigator.clipboard.writeText(text);
    setCopiedOutput(true);
    setTimeout(() => setCopiedOutput(false), 2000);
  };

  // Determine status display
  let statusBadge = null;
  if (isExecuting) {
    statusBadge = (
      <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-medium animate-pulse">
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
        <span>Compiling with rustc...</span>
      </span>
    );
  } else if (executionResult) {
    if (executionResult.testSummary) {
      if (executionResult.testSummary.failed === 0 && executionResult.testSummary.passed > 0) {
        statusBadge = (
          <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-xs font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>All Tests Passed ({executionResult.testSummary.passed}/{executionResult.testSummary.total})</span>
          </span>
        );
      } else {
        statusBadge = (
          <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30 text-xs font-semibold">
            <XCircle className="w-3.5 h-3.5" />
            <span>Tests Failed ({executionResult.testSummary.failed} failed)</span>
          </span>
        );
      }
    } else if (executionResult.success) {
      statusBadge = (
        <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-xs font-medium">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Executed Successfully ({executionResult.executionTime}ms)</span>
        </span>
      );
    } else {
      statusBadge = (
        <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30 text-xs font-medium">
          <XCircle className="w-3.5 h-3.5" />
          <span>Build Error</span>
        </span>
      );
    }
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-[#1e1e1e] overflow-hidden">
      {/* Editor Action Toolbar */}
      <div className="h-12 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between shrink-0 select-none">
        {/* Left: File tag and status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-xs font-mono text-amber-400">
            <span className="w-2 h-2 rounded-full bg-orange-500" />
            <span>main.rs</span>
          </div>

          <div className="hidden sm:block">{statusBadge}</div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Format Code */}
          <button
            onClick={onFormatCode}
            disabled={isExecuting}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium transition-colors cursor-pointer disabled:opacity-50"
            title="Format with rustfmt"
          >
            <Wand2 className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">Format</span>
          </button>

          {/* Reset Code */}
          <button
            onClick={onResetCode}
            disabled={isExecuting}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-rose-400 text-xs font-medium transition-colors cursor-pointer disabled:opacity-50"
            title="Reset code to starter code"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Reset</span>
          </button>

          {/* Run Code (main) */}
          <button
            onClick={onRunCode}
            disabled={isExecuting}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-100 hover:text-white text-xs font-semibold border border-slate-700 transition-colors cursor-pointer disabled:opacity-50 shadow-xs"
            title="Compile & run main()"
          >
            <Play className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
            <span>Run</span>
          </button>

          {/* Test & Submit */}
          <button
            onClick={onRunTests}
            disabled={isExecuting}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-500 hover:to-orange-400 text-white text-xs font-bold transition-all shadow-md shadow-orange-500/20 cursor-pointer disabled:opacity-50"
            title="Run challenge test suite and submit"
          >
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Test & Submit</span>
          </button>
        </div>
      </div>

      {/* Code Editor Container */}
      <div className="flex-1 relative overflow-hidden">
        <Editor
          height="100%"
          defaultLanguage="rust"
          theme="vs-dark"
          value={code}
          onChange={val => onChangeCode(val || '')}
          onMount={handleEditorMount}
          options={{
            fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
            fontSize: 13,
            lineHeight: 20,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 4,
            insertSpaces: true,
          }}
        />
      </div>

      {/* Terminal / Output Console */}
      <div
        className="border-t border-slate-800 bg-slate-950 flex flex-col shrink-0 transition-all duration-150"
        style={{ height: isConsoleCollapsed ? '36px' : `${consoleHeight}px` }}
      >
        {/* Terminal Header */}
        <div className="h-9 px-3 bg-slate-900/90 border-b border-slate-800/80 flex items-center justify-between select-none">
          {/* Console tabs */}
          <div className="flex items-center gap-1 text-xs">
            <button
              onClick={() => {
                setActiveConsoleTab('output');
                setIsConsoleCollapsed(false);
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition-colors cursor-pointer ${
                activeConsoleTab === 'output' && !isConsoleCollapsed
                  ? 'bg-slate-800 text-white font-medium'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Terminal className="w-3.5 h-3.5 text-amber-400" />
              <span>Execution Output</span>
            </button>

            <button
              onClick={() => {
                setActiveConsoleTab('tests');
                setIsConsoleCollapsed(false);
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition-colors cursor-pointer ${
                activeConsoleTab === 'tests' && !isConsoleCollapsed
                  ? 'bg-slate-800 text-white font-medium'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Test Results</span>
              {executionResult?.testSummary && (
                <span className="text-[10px] px-1 rounded bg-slate-700 text-slate-200">
                  {executionResult.testSummary.passed}/{executionResult.testSummary.total}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                setActiveConsoleTab('diagnostics');
                setIsConsoleCollapsed(false);
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition-colors cursor-pointer ${
                activeConsoleTab === 'diagnostics' && !isConsoleCollapsed
                  ? 'bg-slate-800 text-white font-medium'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>Diagnostics</span>
              {executionResult?.diagnostics && executionResult.diagnostics.length > 0 && (
                <span className="text-[10px] px-1 rounded bg-rose-500/20 text-rose-300 font-mono">
                  {executionResult.diagnostics.length}
                </span>
              )}
            </button>
          </div>

          {/* Console Controls */}
          <div className="flex items-center gap-1">
            {executionResult && !isConsoleCollapsed && (
              <button
                onClick={copyOutput}
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                title="Copy Terminal Output"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              onClick={() => setIsConsoleCollapsed(!isConsoleCollapsed)}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title={isConsoleCollapsed ? 'Expand Terminal' : 'Collapse Terminal'}
            >
              {isConsoleCollapsed ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Console Body */}
        {!isConsoleCollapsed && (
          <div className="flex-1 overflow-y-auto p-3 font-mono text-xs leading-relaxed selection:bg-amber-500/30">
            {isExecuting ? (
              <div className="flex items-center gap-2 text-amber-400 py-4 justify-center">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Contacting Rust Playground & compiling with rustc...</span>
              </div>
            ) : !executionResult ? (
              <div className="text-slate-500 py-6 text-center">
                Press <span className="text-slate-300 font-semibold">"Run"</span> to execute main() or{' '}
                <span className="text-amber-400 font-semibold">"Test & Submit"</span> to run challenge tests.
              </div>
            ) : (
              <>
                {/* Output Tab */}
                {activeConsoleTab === 'output' && (
                  <div className="space-y-2">
                    {executionResult.stdout && (
                      <div>
                        <div className="text-slate-400 font-semibold mb-1 text-[11px] uppercase tracking-wider">
                          Standard Output:
                        </div>
                        <pre className="text-emerald-300 whitespace-pre-wrap">{executionResult.stdout}</pre>
                      </div>
                    )}

                    {executionResult.stderr && (
                      <div className="mt-2 pt-2 border-t border-slate-800">
                        <div className="text-slate-400 font-semibold mb-1 text-[11px] uppercase tracking-wider">
                          Compiler & Runtime Diagnostics:
                        </div>
                        <pre className="text-slate-300 whitespace-pre-wrap">{executionResult.stderr}</pre>
                      </div>
                    )}

                    {!executionResult.stdout && !executionResult.stderr && (
                      <div className="text-slate-500 italic">Program executed cleanly with no console output.</div>
                    )}
                  </div>
                )}

                {/* Tests Tab */}
                {activeConsoleTab === 'tests' && (
                  <div className="space-y-3">
                    {executionResult.testSummary ? (
                      <div className="space-y-2">
                        <div className="p-2.5 rounded bg-slate-900 border border-slate-800 flex items-center justify-between">
                          <span className="font-semibold text-slate-200">
                            Test Suite Result:
                          </span>
                          <span
                            className={`font-bold ${
                              executionResult.testSummary.failed === 0 ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                          >
                            {executionResult.testSummary.raw}
                          </span>
                        </div>
                        <pre className="text-slate-300 whitespace-pre-wrap bg-slate-900/50 p-2.5 rounded border border-slate-800/60">
                          {executionResult.stdout}
                        </pre>
                      </div>
                    ) : (
                      <div className="text-slate-400 py-4 text-center">
                        No test suite has run yet. Click{' '}
                        <button
                          onClick={onRunTests}
                          className="text-amber-400 font-bold underline hover:text-amber-300"
                        >
                          "Test & Submit"
                        </button>{' '}
                        above to run unit tests.
                      </div>
                    )}
                  </div>
                )}

                {/* Diagnostics Tab */}
                {activeConsoleTab === 'diagnostics' && (
                  <div className="space-y-2">
                    {executionResult.diagnostics && executionResult.diagnostics.length > 0 ? (
                      executionResult.diagnostics.map((diag, i) => (
                        <div
                          key={i}
                          className={`p-2.5 rounded border text-xs ${
                            diag.level === 'error'
                              ? 'bg-rose-950/20 border-rose-800/40 text-rose-300'
                              : diag.level === 'warning'
                              ? 'bg-amber-950/20 border-amber-800/40 text-amber-300'
                              : 'bg-blue-950/20 border-blue-800/40 text-blue-300'
                          }`}
                        >
                          <div className="font-semibold uppercase text-[10px] tracking-wider mb-0.5">
                            {diag.level} {diag.line ? `at line ${diag.line}` : ''}
                          </div>
                          <div>{diag.message}</div>
                        </div>
                      ))
                    ) : (
                      <div className="text-slate-400 py-4 text-center">
                        {executionResult.success ? '✨ No compiler warnings or errors!' : 'No diagnostics parsed.'}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
