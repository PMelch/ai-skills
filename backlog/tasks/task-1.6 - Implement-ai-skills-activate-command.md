---
id: task-1.6
title: Implement 'ai-skills activate' command
status: Done
assignee: []
created_date: '2026-01-20 14:53'
updated_date: '2026-01-20 15:03'
labels:
  - command
  - activate
dependencies:
  - task-1.2
  - task-1.3
  - task-1.4
parent_task_id: task-1
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Create the activate command that:
- Reads available skills from ~/.config/ai-skills
- Presents interactive multi-select UI for skill selection
- Saves project-specific skill configuration (.ai-skills.json or similar)
- Configures selected agents with chosen skills
- Supports updating existing configuration (not just first-time setup)
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Lists all available skills correctly
- [x] #2 Interactive selection UI is intuitive
- [x] #3 Project config file is created/updated
- [x] #4 Agent-specific skill configs are written
- [x] #5 Can update existing activation
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
✅ Lists skills from ~/.config/ai-skills

✅ Interactive checkbox UI with pre-selection

✅ Saves .ai-skills.json in project folder

✅ Manages agent-specific symlinks

✅ Supports updating existing config
<!-- SECTION:NOTES:END -->
