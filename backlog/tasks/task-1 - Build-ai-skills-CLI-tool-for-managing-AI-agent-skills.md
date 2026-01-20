---
id: task-1
title: Build ai-skills CLI tool for managing AI agent skills
status: To Do
assignee: []
created_date: '2026-01-20 14:50'
labels:
  - cli
  - tooling
  - infrastructure
dependencies: []
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Create a command-line tool that manages AI agent skills centrally from ~/.config/ai-skills with symlinks to agent-specific folders (Claude, Gemini, etc.). 

Key features:
- `ai-skills init`: Setup central config folder with symlinks to agent folders
- `ai-skills activate`: Interactive UI to select/enable skills per project
- Multi-agent support with selection interface
- Rich terminal output for better UX
- Distributable via npx/uvx (no source code download required)
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Tool is installable via npx or uvx
- [ ] #2 Init command creates ~/.config/ai-skills and symlinks to agent folders
- [ ] #3 Activate command provides interactive skill selection
- [ ] #4 Multi-agent configuration works correctly
- [ ] #5 Rich terminal UI enhances user experience
<!-- AC:END -->
