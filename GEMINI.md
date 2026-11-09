# Learn Rust By Coding — Repository Guidelines & Architecture

## Overview
**Learn Rust By Coding** is a zero-backend, frontend-only interactive learning platform designed to teach the Rust programming language step-by-step through split-screen pair programming:
- **Left Panel**: Conceptual explanations, theoretical mental models (ownership, memory, stack vs heap), progressive hints/clues, challenge objectives, and reference solutions.
- **Right Panel**: Full Monaco Rust code editor, live `rustc` compilation & execution via the official Rust Playground API, `cargo test` evaluation, and terminal diagnostics.
- **Extensible Challenge Engine**: Standard JSON format for built-in and user-contributed custom challenges.

---

## Architecture & Technology Stack

1. **Frontend Framework**:
   - React 19 + TypeScript + Vite + Rolldown
   - Tailwind CSS v4 (`@tailwindcss/vite`)
   - Monaco Editor (`@monaco-editor/react`) for full Rust syntax highlighting, auto-indentation, and error markers
   - `lucide-react` for UI icons
   - `canvas-confetti` for celebration triggers upon passing challenges

2. **Zero-Backend Real Compilation Engine**:
   - Direct browser communication with the official **Rust Playground API**:
     - Endpoint: `https://play.rust-lang.org/execute`
     - Formatter: `https://play.rust-lang.org/format`
     - Editions: 2021 & 2024
   - **Mode "Run"**: Executes `fn main()` with `tests: false` and streams stdout/stderr directly into the console.
   - **Mode "Test & Submit"**: Concatenates user code with the challenge's `#[cfg(test)] mod tests { ... }` harness and executes with `tests: true` (`cargo test`).
   - Parses `test result: ok. X passed; 0 failed` to determine pass status and trigger completion celebration.

3. **Storage & State**:
   - `localStorage` manages user progress (`completedIds`), saved code drafts per practice, revealed hint counters, and custom user challenges.
   - Built-in challenges reside in `src/data/challenges.json`.

---

## Challenge JSON Schema Specification

Custom challenges must satisfy the schema defined in `public/challenges/rust-challenge-schema.json`:

```json
{
  "id": "kebab-case-unique-identifier",
  "title": "Practice Title",
  "category": "Curriculum Grouping (e.g. 1. Fundamentals, 2. Ownership & Memory)",
  "difficulty": "beginner | intermediate | advanced",
  "summary": "One-line summary",
  "theory": "Markdown string containing explanations, code snippets, and rules",
  "requirements": [
    "Requirement item 1",
    "Requirement item 2"
  ],
  "hints": [
    "Clue 1: Subtle hint",
    "Clue 2: More detailed direction",
    "Clue 3: Concrete syntax guidance"
  ],
  "starterCode": "// Initial code template provided to the learner\npub fn solve() {\n    todo!()\n}",
  "solutionCode": "// Complete working solution\npub fn solve() {\n    // ...\n}",
  "testCode": "\n#[cfg(test)]\nmod tests {\n    use super::*;\n\n    #[test]\n    fn test_solution() {\n        assert!(true);\n    }\n}\n",
  "validationMode": "tests"
}
```

---

## Adding Custom Challenges

1. **Via the Application UI**:
   - Click **"Custom JSON"** in the top navigation bar.
   - Paste any valid challenge JSON, upload a `.json` file, or use the **Visual Form Creator**.
   - Custom challenges are instantly saved to browser storage and added to the curriculum sidebar.

2. **As Permanent Built-In Challenges**:
   - Append the new challenge object to `src/data/challenges.json`.
   - Run `npm run build` to verify that TypeScript and the Vite bundler succeed.

---

## Development Commands

```bash
# Start local development server
npm run dev

# Run TypeScript check and production build
npm run build

# Preview production build locally
npm run preview
```
