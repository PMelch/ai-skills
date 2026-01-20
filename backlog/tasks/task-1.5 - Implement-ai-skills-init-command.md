---
id: task-1.5
title: Implement 'ai-skills init' command
status: Done
assignee: []
created_date: '2026-01-20 14:53'
updated_date: '2026-01-20 15:03'
labels:
  - command
  - init
dependencies:
  - task-1.2
  - task-1.3
  - task-1.4
parent_task_id: task-1
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Create the init command that:
- Creates ~/.config/ai-skills directory structure
- Prompts user to select which agents to configure (multi-select)
- Creates symlinks from agent folders to ~/.config/ai-skills
- Handles existing installations (update vs fresh install)
- Validates write permissions and handles errors
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Creates central config folder successfully
- [x] #2 Symlinks work on macOS, Linux, and Windows
- [x] #3 Multi-agent selection UI works
- [x] #4 Handles re-running init gracefully
- [x] #5 Error messages are clear and actionable
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
✅ Creates ~/.config/ai-skills directory

✅ Symlinks using fs.symlink with 'dir' type for cross-platform

✅ Multi-agent selection UI with checkboxes

✅ Handles re-running by removing existing symlinks

✅ Clear error messages and warnings
<!-- SECTION:NOTES:END -->
