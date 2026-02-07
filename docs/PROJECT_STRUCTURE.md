# Project Structure

Updated: 2026-02-07

## Top-level Layout
```text
.
- .gitignore
- CLAUDE.md
- LICENSE
- README.md
- README_EN.md
- auto_deploy.exp
- backend
- deploy.sh
- docs
- src
- web
```

## Conventions
- Keep executable/business code under src/ as the long-term target.
- Keep docs under docs/ (or doc/ for Cangjie projects).
- Keep local runtime artifacts and secrets out of version control.
