---
id: task-6
title: Implement proper project activation of skills for Copilot
status: Done
assignee: []
created_date: '2026-01-20 19:56'
updated_date: '2026-01-20 20:16'
labels: []
dependencies: []
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Copilot uses `.github/copilot-instructions.md` for persistent activation of skills. It also supports a new "frontmatter" method for more granular control.

**Config File:** `<projectHome>/.github/copilot-instructions.md`

**Activation Method:** Explicitly name the skills in the instruction text or use the skills array if using the experimental JSON config.

**Guard Comments:** The skill activation block must be wrapped with special comments to clearly identify the section and enable future programmatic updates:
```
<!-- SKILLS_ACTIVATION_START -->
... skill activation instructions ...
<!-- SKILLS_ACTIVATION_END -->
```

**Syntax Example:**
```
# Copilot Instructions
<!-- SKILLS_ACTIVATION_START -->
When working in this repo, always enable these skills:
- @global/my-performance-profiler
- @project/custom-db-queries
<!-- SKILLS_ACTIVATION_END -->
```

**Alternative (Experimental JSON Config):**
Use frontmatter with a skills array for more granular control.

The Copilot class should be extended with the logic.
The logic should be invoked when `bun src/cli.js activate --skill tdd-protocol --agent copilot` is invoked.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Create .github/copilot-instructions.md file in the project
- [x] #2 Configure skills to be activated automatically when working in this repository
- [x] #3 Guard skill activation block with special comments (SKILLS_ACTIVATION_START/END)
- [x] #4 Test that skills are properly activated when Copilot is used in the project

- [x] #5 Document the activation method used and any configuration options
<!-- AC:END -->
