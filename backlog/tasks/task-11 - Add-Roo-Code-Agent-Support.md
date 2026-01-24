---
id: task-11
title: Add Roo Code Agent Support
status: To Do
assignee: []
created_date: '2026-01-24 10:35'
labels: []
dependencies: []
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
## Overview
Implement support for Roo Code (formerly Roo Cline) agent in the ai-skills CLI tool. Roo Code is an autonomous coding agent extension for VS Code, based on Cline.

## Background Research
Roo Code appears to use `.roomodes` files to define "modes" (roles) and their custom instructions. It may also support `.clinerules` (from Cline) for general project rules.

### Configuration File Locations

#### Project-Specific Configuration
- **Likely Location**: `.roomodes` or `.clinerules` in the project root.
- **Format**: `.roomodes` is likely JSON or a specific text format defining modes. `.clinerules` is typically a text file with instructions.
- **Purpose**: Define custom behaviors, roles, and project-specific instructions.

#### Global Configuration
- **Potential Locations**: `~/.vscode/extensions/.../` or a dedicated config directory for Roo Code/Cline.

## Implementation Requirements

### 1. Research Phase
- [ ] Verify if Roo Code respects `.clinerules` (like Cline).
- [ ] Analyze the structure of `.roomodes`. Can we inject skills into a "default" mode or a new "Skills" mode?
- [ ] Determine how to activate skills: by appending to `.clinerules` or modifying `.roomodes`.

### 2. RooAgent Class Implementation
Create `src/core/agents/roo.ts`:

```typescript
export class RooAgent extends BaseAgent {
  readonly id = 'roo';
  readonly name = 'Roo Code';
  
  getSkillsPath(): string {
     // Likely ~/.roo/skills or similar, or reuse ~/.config/ai-skills
  }
  
  async updateProjectConfiguration(skills: string[], projectRoot: string): Promise<void> {
    // Update .roomodes or .clinerules
  }
}
```

### 3. Project-Specific Activation
- **Target**: `.clinerules` (if supported) or `.roomodes`.
- **Strategy**: Append skill instructions to the system prompt or custom instructions field.

## Success Criteria
- [ ] Roo Code agent detected.
- [ ] Skills activation updates the appropriate configuration file.
- [ ] Roo Code respects the injected skills.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] Research completed on `.roomodes` vs `.clinerules` priority.
- [ ] `RooAgent` class implemented.
- [ ] Project configuration update logic implemented.
- [ ] Tests added.
<!-- AC:END -->
<!-- SECTION:DESCRIPTION:END -->
