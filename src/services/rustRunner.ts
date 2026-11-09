import { ExecutionResult } from '../types/challenge';

const PLAYGROUND_BASE = 'https://play.rust-lang.org';

export interface PlaygroundOptions {
  edition?: '2021' | '2024' | '2018';
  mode?: 'debug' | 'release';
  channel?: 'stable' | 'beta' | 'nightly';
}

/**
 * Execute Rust code via the official Rust Playground API
 */
export async function executeRustCode(
  code: string,
  runTests: boolean = false,
  options: PlaygroundOptions = {}
): Promise<ExecutionResult> {
  const startTime = performance.now();
  const edition = options.edition || '2021';
  const mode = options.mode || 'debug';
  const channel = options.channel || 'stable';

  try {
    const response = await fetch(`${PLAYGROUND_BASE}/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        channel,
        mode,
        edition,
        crateType: 'bin',
        tests: runTests,
        code,
        backtrace: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Rust Playground API responded with HTTP status ${response.status} (${response.statusText})`);
    }

    const data = await response.json();
    const executionTime = Math.round(performance.now() - startTime);

    const stdout: string = data.stdout || '';
    const stderr: string = data.stderr || '';
    const success: boolean = Boolean(data.success);

    // Parse test summary if runTests was enabled
    let testSummary;
    if (runTests) {
      testSummary = parseTestOutput(stdout + '\n' + stderr);
    }

    // Parse compiler diagnostics
    const diagnostics = parseDiagnostics(stderr);

    return {
      success,
      stdout,
      stderr,
      exitDetail: data.exitDetail,
      executionTime,
      testSummary,
      diagnostics,
    };
  } catch (error: any) {
    const executionTime = Math.round(performance.now() - startTime);
    return {
      success: false,
      stdout: '',
      stderr: `Network or service error connecting to Rust Playground: ${error?.message || error}\n\nPlease check your internet connection. The application communicates with the official Rust Playground API (https://play.rust-lang.org) to provide authentic rustc compilation.`,
      exitDetail: 'Connection Failed',
      executionTime,
    };
  }
}

/**
 * Format Rust code using rustfmt on the Rust Playground
 */
export async function formatRustCode(code: string, edition: string = '2021'): Promise<{ success: boolean; formattedCode?: string; error?: string }> {
  try {
    const response = await fetch(`${PLAYGROUND_BASE}/format`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code,
        edition,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }

    const data = await response.json();
    if (data.success && data.code) {
      return { success: true, formattedCode: data.code };
    } else {
      return { success: false, error: data.stderr || 'Failed to format code' };
    }
  } catch (err: any) {
    return { success: false, error: err?.message || 'Network error' };
  }
}

/**
 * Parse standard cargo test output
 */
function parseTestOutput(combinedOutput: string) {
  // Looks for: "test result: ok. 2 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out"
  // or "test result: FAILED. 1 passed; 1 failed; 0 ignored"
  const match = combinedOutput.match(/test result:\s*([A-Za-z]+)\.\s*(\d+)\s*passed;\s*(\d+)\s*failed;/i);

  if (match) {
    const passed = parseInt(match[2], 10);
    const failed = parseInt(match[3], 10);
    return {
      total: passed + failed,
      passed,
      failed,
      raw: match[0],
    };
  }

  return undefined;
}

/**
 * Extract warnings and error line numbers from rustc stderr
 */
function parseDiagnostics(stderr: string) {
  const diagnostics: Array<{ level: 'error' | 'warning' | 'note' | 'help'; message: string; line?: number }> = [];
  const lines = stderr.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const match = line.match(/^(error|warning|help|note)(?:\[E\d+\])?: (.*)$/);
    if (match) {
      const level = match[1] as 'error' | 'warning' | 'note' | 'help';
      const message = match[2];

      // Check next line for location pointer (e.g. " --> src/main.rs:4:5")
      let lineNum: number | undefined;
      if (i + 1 < lines.length) {
        const nextLine = lines[i + 1];
        const locMatch = nextLine.match(/-->\s*(?:.*):(\d+):(\d+)/);
        if (locMatch) {
          lineNum = parseInt(locMatch[1], 10);
        }
      }

      diagnostics.push({ level, message, line: lineNum });
    }
  }

  return diagnostics;
}
