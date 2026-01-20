---
id: task-7
title: Implement proper project activation of skills for Claude
status: Done
assignee: []
created_date: '2026-01-20 20:24'
updated_date: '2026-01-20 20:26'
labels: []
dependencies: []
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Claude uses `.claude/CLAUDE.md` for persistent activation of skills in a project context.

**Config File:** `<projectDir>/.claude/CLAUDE.md`

**Activation Method:** The skills should be listed in the configuration block with proper formatting.

**Guard Comments:** The skill activation block must be wrapped with special comments to clearly identify the section and enable future programmatic updates:
```
<!-- SKILLS_ACTIVATION_START -->
... skill activation instructions ...
<!-- SKILLS_ACTIVATION_END -->
```

**Syntax Example:**
```
<!-- SKILLS_ACTIVATION_START -->
# Project Instructions
- Always use the `security-auditor` skill for code reviews.
- Active global skills: `jira-linker`, `style-guide-v2`.

<!-- SKILLS_ACTIVATION_END -->
```

The Claude class should be extended with the `updateProjectConfiguration` method, similar to how it was implemented for Copilot in task-6.

The logic should:
- Create `.claude/CLAUDE.md` if it doesn't exist
- Read existing file and locate the activation block
- Update the activation block with the provided skills list
- Handle skill additions and removals properly
- Remove entries when skills are deactivated

The logic should be invoked when `bun src/cli.js activate --skill <skill-name> --agent claude` is invoked.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Create .claude/CLAUDE.md file in the project if it doesn't exist
- [x] #2 Implement updateProjectConfiguration method in ClaudeAgent class
- [x] #3 Guard skill activation block with special comments (SKILLS_ACTIVATION_START/END)
- [x] #4 Handle initial configuration (creating new file)
- [x] #5 Handle updating existing configuration (adding skills)
- [x] #6 Handle removing skills from configuration
- [x] #7 Test that skills are properly activated when Claude is used in the project
- [x] #8 Ensure the implementation follows the same pattern as CopilotAgent
<!-- AC:END -->
