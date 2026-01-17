# Contributing

Thank you for your interest in contributing to this repository! This document describes the development workflow, branching strategy, and rules that help keep the project stable and releases predictable.

> [!NOTE]
> This repository is intended as a technical test / demo project. Contributions should stay clean, minimal, and easy to review.

---

## 🔂 Development Workflow

### 1. Development happens in `dev`

- **All regular development Pull Requests must target the `dev` branch**
- Feature work, fixes, refactoring, and documentation updates should **never be merged directly into `main`**
- Typical branch examples:
  - `feature/add-authentication`
  - `fix/null-reference`
  - `chore/update-ci`
  - `docs/update-readme`

---

### 2. Release process

When the project is ready for a release:

1. Create a release branch **from `dev`** using semantic versioning:

   ```text
   release/vX.Y.Z
   ```

   Examples:
   - `release/v1.0.0`
   - `release/v1.2.3`

2. Only stabilization changes should go into a release branch:
   - Bug fixes
   - Documentation updates
   - Version-related adjustments

3. Open a Pull Request:
   - **Source:** `release/vX.Y.Z`
   - **Target:** `main`

4. After the release PR is merged:
   - `main` represents the latest released state
   - (Optional but recommended) merge `main` back into `dev` to keep branches in sync

> [!IMPORTANT]
> Pull Requests to `main` are **only allowed from `release/vX.Y.Z` branches**.
> Pull Requests that do not follow this naming convention are automatically **blocked by CI**.

---

## ‼️ Pull Request Requirements

### 📝 Conventional Commits (PR title)

Pull Request titles **must follow the [Conventional Commits specification](https://www.conventionalcommits.org/en/v1.0.0/)**. This is required for automated versioning and CI checks.

Allowed prefixes:

- `fix:` — bug fix (patch)
- `feat:` — new feature (minor)
- `feat!:` — breaking change (major)
- `chore:` — maintenance / configuration (unversioned)
- `docs:` — documentation only (unversioned)
- `test:` — unit/integration tests (unversioned)

Examples:

- `fix: handle null input`
- `feat: add docker support`
- `feat!: change authentication flow`
- `chore: configure CI workflow`
- `docs: update README`
- `test: add integration tests`

---

## ☑️ PR Checklist

Before opening a Pull Request, make sure that:

- PR title follows Conventional Commits
- Changes are made against the correct branch (`dev` or `release/vX.Y.Z`)
- The project builds successfully
- Tests pass (if applicable)
- Documentation is updated when behavior or API changes

---

## 👍 Code Quality Guidelines

- Keep changes small and focused
- Avoid unrelated refactoring in the same PR
- Do not commit temporary files, secrets, or debug artifacts
- If behavior or public API changes, update the documentation accordingly

---

## 🔒 Security

Do **not** commit secrets (API keys, tokens, credentials).
If something sensitive is accidentally committed:
1. Revoke the secret immediately
2. Remove it from the repository history

---

## Need Help?

If anything is unclear:
- Open an Issue, or
- Ask questions directly in your Pull Request

🙏 We appreciate your contribution!