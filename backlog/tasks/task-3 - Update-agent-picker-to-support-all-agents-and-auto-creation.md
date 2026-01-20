---
id: task-3
title: Update agent picker to support all agents and auto-creation
status: Done
assignee: []
created_date: '2026-01-20 18:25'
updated_date: '2026-01-20 18:31'
labels:
  - enhancement
  - cli
  - ux
dependencies: []
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Update the `init` command to display all supported agents (Claude, Codex, Gemini, Copilot) in the selection list. 
Currently, only detected agents are shown. 
The new behavior should:
1. List all supported agents.
2. Pre-select agents that are already detected on the system.
3. Allow the user to manually select agents that are not yet detected.
4. If a user selects an agent that was not detected (i.e., its folder is missing), the initialization process must create the necessary directory structure (e.g., `~/.codex/skills`) for that agent.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 `init` command lists Claude, Codex, Gemini, Copilot.
- [ ] #2 Detected agents are pre-selected.
- [ ] #3 Undetected agents are selectable.
- [ ] #4 Selecting an undetected agent creates its config/skills folder structure.
<!-- AC:END -->
