---
id: task-1.9
title: Implement Gemini Settings Persistence for Active Skills
status: Done
assignee: []
created_date: '2026-01-20 17:46'
updated_date: '2026-01-20 17:55'
labels: []
dependencies: []
parent_task_id: task-1
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Implement functionality to persist activated skills to `.gemini/settings.json` in the project root.

The JSON structure should be:
```json
{
  "agent": {
    "activeSkills": ["skill-1", "skill-2"]
  }
}
```

Requirements:
- If the file does not exist, create it with the specified structure.
- If the file exists, parse it and safely update the `agent.activeSkills` array.
- Ensure other existing configuration in the file is preserved.
- This logic must be triggered when the `ai-skills activate` command is executed.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Verify .gemini/settings.json is created if it does not exist when saving skills.
- [ ] #2 Verify "agent.activeSkills" array is created or updated without overwriting other existing settings in .gemini/settings.json.
- [ ] #3 Ensure idempotent addition of skills to the list (no duplicates).

- [ ] #4 Verify `ai-skills activate <skill>` adds the skill to `.gemini/settings.json`.
<!-- AC:END -->
