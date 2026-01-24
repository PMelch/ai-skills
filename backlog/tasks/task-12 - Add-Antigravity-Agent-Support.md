---
id: task-12
title: Add Antigravity Agent Support
status: To Do
assignee: []
created_date: '2026-01-24 10:35'
labels: []
dependencies: []
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
## Overview
Implement support for the Antigravity agent (Google's AI-first IDE/Platform) in the ai-skills CLI tool.

## Background Research
Antigravity is a fork of VS Code focused on agentic workflows. It likely has its own mechanism for defining agent behaviors, potentially distinct from standard VS Code settings.

### Configuration File Locations

#### Project-Specific Configuration
- **Hypothesis**: `.antigravity/` folder or specific config files in project root.
- **Needs Verification**: specific file names (e.g., `antigravity.yaml`, `.antigravity-rules`, etc.).

#### Global Configuration
- **Hypothesis**: `~/.antigravity/` or similar.

## Implementation Requirements

### 1. Research Phase (High Priority)
- [ ] Identify the exact configuration file structure for Antigravity agents.
- [ ] Determine if it supports "rules" or "instructions" files similar to `.cursorrules` or `.clinerules`.
- [ ] Check if it supports VS Code extensions' settings or has its own override mechanism.

### 2. AntigravityAgent Class Implementation
Create `src/core/agents/antigravity.ts`:

```typescript
export class AntigravityAgent extends BaseAgent {
  readonly id = 'antigravity';
  readonly name = 'Antigravity';
  
  getSkillsPath(): string {
     // TBD based on research
  }
  
  async updateProjectConfiguration(skills: string[], projectRoot: string): Promise<void> {
    // TBD
  }
}
```

### 3. Strategy
- If Antigravity is fully compatible with VS Code, it might respect `.vscode` settings.
- If it has a specific "Agent" panel, we need to find where that panel reads its context/instructions from.

## Success Criteria
- [ ] Antigravity agent detected.
- [ ] Configuration mechanism identified and implemented.
- [ ] Skills successfully injected into Antigravity's context.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] Research on Antigravity config completed.
- [ ] `AntigravityAgent` class implemented.
- [ ] Integration with Antigravity's rule system working.
- [ ] Tests added.
<!-- AC:END -->
<!-- SECTION:DESCRIPTION:END -->
