---
name: rust-challenge-authoring
description: Guide and procedure for authoring, testing, and formatting custom Rust learning practices and challenge JSON files for the Learn Rust By Coding platform.
---

# Rust Challenge Authoring Skill

Use this skill whenever you need to create, update, or validate Rust coding practices for the **Learn Rust By Coding** application.

---

## Challenge Structure Requirements

Every Rust practice must provide:
1. **Clear Theory & Mental Model (`theory`)**:
   - Provide conceptual explanation of *why* Rust behaves the way it does (e.g. borrow checker, lifetimes, drop semantics, pattern exhaustiveness).
   - Include illustrative code snippets enclosed in ````rust ... ```` blocks.
   - Explain common pitfalls and compiler error messages that students might encounter.

2. **Progressive Clues (`hints`)**:
   - Supply 2 to 4 progressive hints ranging from subtle direction (Clue 1) to actionable syntax guidance (Clue 3).
   - Avoid spoiling the exact solution in early clues.

3. **Starter Code (`starterCode`)**:
   - Must contain relevant function signatures and `todo!()` or commented placeholders.
   - Provide a sample `fn main()` displaying example usage.

4. **Self-Contained Cargo Test Suite (`testCode`)**:
   - Written using standard `#[cfg(test)] mod tests { use super::*; ... }`.
   - Test both normal expected behavior and edge cases (e.g. empty inputs, zero, boundary conditions).

5. **Verified Solution (`solutionCode`)**:
   - Idiomatic, clean Rust code that satisfies all test assertions and compiles with zero warnings.

---

## Authoring Workflow

### Step 1: Draft the Challenge JSON
Use the standard JSON format conforming to `public/challenges/rust-challenge-schema.json`.

```json
{
  "id": "practice-slug-name",
  "title": "Practice Name",
  "category": "Category Group",
  "difficulty": "beginner",
  "summary": "Short one-liner summary",
  "theory": "### Markdown explanation...",
  "requirements": [
    "Requirement 1",
    "Requirement 2"
  ],
  "hints": [
    "Clue 1: ...",
    "Clue 2: ..."
  ],
  "starterCode": "pub fn solve() { todo!() }",
  "solutionCode": "pub fn solve() { /* implementation */ }",
  "testCode": "\n#[cfg(test)]\nmod tests {\n    use super::*;\n    #[test]\n    fn test_works() {\n        assert!(true);\n    }\n}\n",
  "validationMode": "tests"
}
```

### Step 2: Test Against the Rust Playground API
Before committing a new challenge, verify that the `solutionCode` + `testCode` passes with exit code 0 against `https://play.rust-lang.org/execute`:

```bash
# Combine solutionCode and testCode into a test string and verify tests: true passes
```

### Step 3: Register the Challenge
- To add as a default practice: Append to `src/data/challenges.json`.
- To share as an importable module: Save in `public/challenges/<id>.json` or import directly in the UI via the "Custom JSON" modal.
- Verify with `npm run build`.
