---
id: task-9
title: Add support for Cursor agent
status: To Do
assignee: []
created_date: '2026-01-21 00:00'
labels:
  - agent-support
  - cursor
dependencies: []
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Add support for the **Cursor** agent.

**Research on Configuration:**
Cursor supports two main ways to configure AI behavior per project:
1.  **`.cursorrules` (Legacy/Simple):** A single file in the project root.
2.  **`.cursor/rules/*.mdc` (Recommended/Granular):** A directory containing individual rule files. `.mdc` files are Markdown with frontmatter.

**Implementation Strategy:**
We will support the modern **`.cursor/rules/`** approach as it aligns perfectly with the concept of discrete "skills".

- **Global Definition:** Skills continue to be defined in `~/.config/ai-skills/skills`.
- **Project Activation:**
    - When a skill is activated for a project, the tool should create a file: `<projectRoot>/.cursor/rules/<skill-name>.mdc`.
    - If the `.cursor/rules` directory does not exist, it should be created.
    - The content of the skill should be written to this file.
    - If the source skill content does not have frontmatter, we should generate a basic one or just write the content (Cursor handles plain md in this folder too, but mdc is preferred for globs).
    - **Frontmatter Example:**
      ```markdown
      ---
      description: <Skill Description>
      globs: *.ts, *.js
      ---
      # <Skill Name>
      <Skill Content>
      ```
    - Since our skills are generic markdown, we might need to assume defaults or allow the skill definition to include this metadata. For now, writing the content as-is (or wrapping it) is the goal.

**Task Requirements:**
- Double and triple check the location for the cursor skill files and for the activation logic in a project.
- Implement `CursorAgent` class in `src/core/agents/cursor.ts`.
- Implement detection logic (look for `.cursor` folder or specific Cursor files).
- Implement `ensureConfig` and `activateSkill` methods.
    - `activateSkill` should write to `.cursor/rules/<skill-name>.mdc`.
- Update `src/core/agents.ts` to include `CursorAgent`.
- Add tests for Cursor agent.

<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 `CursorAgent` class is implemented.
- [ ] #2 Tool detects Cursor projects (presence of `.cursorrules` or `.cursor/`).
- [ ] #3 `activate` command successfully creates `.cursor/rules/<skill-name>.mdc`.
- [ ] #4 `activate` command creates `.cursor/rules/` directory if missing.
- [ ] #5 Unit tests for Cursor agent are added and passing.
<!-- AC:END -->
