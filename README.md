# 🦀 Learn Rust By Coding

A zero-backend, interactive split-screen learning platform designed to teach the Rust programming language step-by-step through hands-on practice.

![Learn Rust By Coding Interface](public/vite.svg)

---

## ✨ Features

- **Split-Screen Pair Programming**:
  - **Left Side**: Theory & mental models (ownership, memory, borrowing, error handling), code snippets, progressive clues (revealed step-by-step), objective checklist, and reference solution.
  - **Right Side**: Monaco Rust code editor with line numbers, syntax highlighting, format code (`rustfmt`), run `fn main()`, and `cargo test` unit testing.
- **Authentic Rust Compilation with Zero Backend**:
  - Directly interfaces with the official **Rust Playground API** (`https://play.rust-lang.org`).
  - Real `rustc` compiler errors, warnings, borrow checker diagnostics, and panic traces.
  - Select between **Rust Edition 2021** and **Rust Edition 2024**.
- **Comprehensive Built-In Curriculum (10 Practices)**:
  1. *Hello, Rustacean! (Macros & Printing)*
  2. *Variables & Mutability (`let` vs `let mut`)*
  3. *Variable Shadowing & `const`*
  4. *Ownership & Move Semantics (Heap vs Stack)*
  5. *References & Borrowing (`&` vs `&mut`)*
  6. *Structs & Methods (`impl` & `&self`)*
  7. *Enums & Pattern Matching (`match`)*
  8. *Null-Free Safety with `Option<T>`*
  9. *Error Handling with `Result<T, E>` & `?`*
  10. *Iterators & Functional Pipelines*
- **Custom Challenge Engine**:
  - Add your own custom challenges using a standard JSON format.
  - In-browser visual challenge creator + raw JSON import/export.
  - Export all challenges as `.json` or load sample templates with one click.
- **Progress Tracking & Persistence**:
  - All progress, solved challenges, and code drafts are automatically saved to `localStorage`.
  - Confetti and celebration banner upon passing all test assertions.

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+)
- npm (v9+)
*(No local Rust installation or backend required!)*

### Running Locally
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:5173` in your browser.

### Building for Production
```bash
npm run build
npm run preview
```

---

## 📄 Custom Challenge JSON Schema

You can create custom challenges by importing a JSON file or entering JSON in the **"Custom JSON"** modal:

```json
{
  "id": "custom-my-challenge",
  "title": "My Custom Practice",
  "category": "Custom Practices",
  "difficulty": "beginner",
  "summary": "Short description of the challenge",
  "theory": "### Markdown Explanation\n\nExplain how things work in Rust...",
  "requirements": [
    "Implement solve() function",
    "Return true"
  ],
  "hints": [
    "Clue 1: Think about ownership",
    "Clue 2: Use match expression"
  ],
  "starterCode": "pub fn solve() -> bool {\n    todo!()\n}\n\nfn main() {\n    println!(\"{}\", solve());\n}",
  "solutionCode": "pub fn solve() -> bool {\n    true\n}\n\nfn main() {\n    println!(\"{}\", solve());\n}",
  "testCode": "\n#[cfg(test)]\nmod tests {\n    use super::*;\n\n    #[test]\n    fn test_solve() {\n        assert_eq!(solve(), true);\n    }\n}\n",
  "validationMode": "tests"
}
```

Check `public/challenges/rust-challenge-schema.json` for the full JSON schema.
