---
id: task-5
title: Implement Codex project activation logic
status: Done
assignee: []
created_date: '2026-01-20 19:12'
updated_date: '2026-01-20 19:21'
labels:
  - feature
  - codex
dependencies: []
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Implement the logic to activate skills for the Codex agent. 

Activation for Codex involves adding entries to `.codex/config.toml`.

Configuration format:
```toml
[[skills.config]]
path = "~/.codex/skills/universal-refactor"
enabled = true
priority = "high"

[[skills.config]]
path = "./.codex/skills/local-deploy-tool"
enabled = true
```

The `path` should point to the skill directory. It handles both home-relative (`~`) and project-relative paths.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 When `ai-skills activate` is called and Codex is the selected agent, the `.codex/config.toml` file must be updated with the correct `[[skills.config]]` entry for the selected skill.
- [ ] #2 The `path` in `.codex/config.toml` must correctly reflect the skill's location (absolute, home-relative, or project-relative).
- [ ] #3 If the skill already exists in the configuration, it should be updated or ensured to be enabled.
- [ ] #4 Existing entries in `.codex/config.toml` must be preserved.
<!-- AC:END -->
