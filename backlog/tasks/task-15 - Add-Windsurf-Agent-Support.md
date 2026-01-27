---
id: task-15
title: Add Windsurf Agent Support
status: To Do
assignee: []
created_date: '2026-01-27 11:42'
labels:
  - enhancement
  - agent-support
dependencies: []
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
## Overview
Implement support for Windsurf (Cascade) agent in the ai-skills CLI tool.

## Document Findings (CombineSkilsAndRules.md)

- **Architecture**: Directory Scanner
- **Config Path**: `.windsurf/rules/`
- **Integration Strategy**: **Direct Symlink** (fully supported)
- **File Extension**: `.md`
- **Frontmatter**: Partial (context only)

### Key Characteristics
- Windsurf's "Cascade" engine is flexible and directory-aware
- Supports multiple rule files simultaneously
- Agnostic to frontmatter but absorbs the context well
- Symlinks work seamlessly

## Implementation Requirements

### 1. WindsurfAgent Class Implementation
Create `src/core/agents/windsurf.ts`:

```typescript
export class WindsurfAgent extends BaseAgent {
  readonly id = 'windsurf';
  readonly name = 'Windsurf';
  
  getSkillsPath(): string {
    // ~/.windsurf/skills or central location
  }
  
  async updateProjectConfiguration(skills: string[], projectRoot: string): Promise<void> {
    // Symlink skills to .windsurf/rules/
  }
}
```

### 2. Project-Specific Activation
- **Target**: `.windsurf/rules/` directory
- **Strategy**: Symlink `~/.agentrules/skills/skill.md` to `.windsurf/rules/skill.md`

### 3. Detection
- Check for Windsurf installation or `.windsurf/` directory presence

## Success Criteria
- [ ] Windsurf agent detected via `ai-skills init`
- [ ] Skills symlinked to `.windsurf/rules/`
- [ ] Skills recognized by Windsurf Cascade engine
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Research completed: verified .windsurf/rules/ path and symlink support
- [ ] #2 WindsurfAgent class implemented in src/core/agents/windsurf.ts
- [ ] #3 Agent registered in AgentManager
- [ ] #4 Symlink-based project activation working
- [ ] #5 Integration tests added
- [ ] #6 README.md updated with Windsurf in supported agents
<!-- AC:END -->
