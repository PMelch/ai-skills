---
id: task-16
title: Add Void Agent Support
status: To Do
assignee: []
created_date: '2026-01-27 11:42'
labels:
  - enhancement
  - agent-support
dependencies: []
priority: low
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
## Overview
Implement support for Void agent in the ai-skills CLI tool. Void is a privacy-focused fork of VS Code.

## Document Findings (CombineSkilsAndRules.md)

- **Architecture**: Directory Scanner
- **Config Path**: `.void/rules/` or via `AGENTS.md`
- **Integration Strategy**: **Direct Symlink** (fully supported)
- **File Extension**: `.md`
- **Frontmatter**: Partial

### Key Characteristics
- Privacy-focused VS Code fork
- Generally aligns with open standards
- Allows local rule definitions that can be symlinked
- Similar to RooCode in capability

## Implementation Requirements

### 1. VoidAgent Class Implementation
Create `src/core/agents/void.ts`:

```typescript
export class VoidAgent extends BaseAgent {
  readonly id = 'void';
  readonly name = 'Void';
  
  getSkillsPath(): string {
    // ~/.void/skills or central location
  }
  
  async updateProjectConfiguration(skills: string[], projectRoot: string): Promise<void> {
    // Symlink skills to .void/rules/
  }
}
```

### 2. Project-Specific Activation
- **Target**: `.void/rules/` directory (or AGENTS.md if directory not supported)
- **Strategy**: Symlink skill files into target directory

### 3. Detection
- Check for Void installation or `.void/` directory presence

## Success Criteria
- [ ] Void agent detected via `ai-skills init`
- [ ] Skills symlinked to `.void/rules/`
- [ ] Skills recognized by Void
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Research completed: verified .void/rules/ path and symlink support
- [ ] #2 VoidAgent class implemented in src/core/agents/void.ts
- [ ] #3 Agent registered in AgentManager
- [ ] #4 Symlink-based project activation working
- [ ] #5 Integration tests added
- [ ] #6 README.md updated with Void in supported agents
<!-- AC:END -->
