---
id: task-18
title: Add OpenCode Agent Support
status: To Do
assignee: []
created_date: '2026-01-27 11:42'
labels:
  - enhancement
  - agent-support
  - terminal-agent
dependencies: []
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
## Overview
Implement support for OpenCode terminal agent in the ai-skills CLI tool.

## Document Findings (CombineSkilsAndRules.md)

- **Architecture**: Directory Scanner
- **Config Path**: `.opencode/agents/`
- **Integration Strategy**: **Direct Symlink** (fully supported)
- **File Extension**: `.md`
- **Frontmatter**: Native (relies on YAML frontmatter for description and triggering)

### Key Characteristics
- Highly compliant with the "Agent Skills" open standard
- Direct symlink works seamlessly
- Native frontmatter support for conditional activation
- Similar architecture to RooCode

## Implementation Requirements

### 1. OpenCodeAgent Class Implementation
Create `src/core/agents/opencode.ts`:

```typescript
export class OpenCodeAgent extends BaseAgent {
  readonly id = 'opencode';
  readonly name = 'OpenCode';
  
  getSkillsPath(): string {
    // ~/.opencode/skills or central location
  }
  
  async updateProjectConfiguration(skills: string[], projectRoot: string): Promise<void> {
    // Symlink skills to .opencode/agents/
  }
}
```

### 2. Project-Specific Activation
- **Target**: `.opencode/agents/` directory
- **Strategy**: Symlink skill files directly
- **Frontmatter**: Preserve YAML frontmatter for conditional triggering

### 3. Detection
- Check for OpenCode installation or `.opencode/` directory presence

## Success Criteria
- [ ] OpenCode agent detected via `ai-skills init`
- [ ] Skills symlinked to `.opencode/agents/`
- [ ] Frontmatter respected for conditional activation
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Research completed: verified .opencode/agents/ path
- [ ] #2 OpenCodeAgent class implemented in src/core/agents/opencode.ts
- [ ] #3 Agent registered in AgentManager
- [ ] #4 Symlink-based project activation working
- [ ] #5 Frontmatter preserved for conditional activation
- [ ] #6 Integration tests added
- [ ] #7 README.md updated with OpenCode in supported agents
<!-- AC:END -->
