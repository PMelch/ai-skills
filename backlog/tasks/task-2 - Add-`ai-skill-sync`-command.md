---
id: task-2
title: Add `ai-skill sync` command
status: Done
assignee: []
created_date: '2026-01-20 15:09'
updated_date: '2026-01-20 15:13'
labels: []
dependencies: []
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Create a new command `ai-skill sync` that synchronizes skill folders between ~/.config/ai-skills and various ai-agent folders.

The command should:
- Detect newly added skill folders in ~/.config/ai-skills
- Create symlinks to these skills in the appropriate ai-agent folders
- Remove leftover symlinks that point to deleted/removed skill folders
- Ensure all ai-agent folders are kept in sync with the source skills directory
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Command `ai-skill sync` is available and executable
- [x] #2 New skill folders in ~/.config/ai-skills are automatically symlinked to ai-agent folders
- [x] #3 Orphaned symlinks (pointing to removed skills) are cleaned up
- [x] #4 Command handles edge cases (missing directories, permission errors, etc.)
- [x] #5 Command provides clear output about what was synced/removed
- [x] #6 README.md is updated to include documentation about new command
<!-- AC:END -->
