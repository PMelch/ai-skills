---
id: task-11
title: Add Roo Code Agent Support
status: To Do
assignee: []
created_date: '2026-01-24 10:35'
updated_date: '2026-01-27 11:41'
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
- [ ] #1 Research completed on `.roomodes` vs `.clinerules` priority.
- [ ] #2 `RooAgent` class implemented.
- [ ] #3 Project configuration update logic implemented.
- [ ] #4 Tests added.
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
## Document Findings (CombineSkilsAndRules.md)

**RooCode is the GOLD STANDARD** for this architecture according to the document.

- **Architecture**: Recursive Directory Scanner
- **Config Path**: `.roo/rules/` (Project) and `~/.roo/rules/` (Global)
- **Integration Strategy**: **Direct Symlink** (fully supported)
- **File Extension**: `.md`
- **Frontmatter**: Native - used for conditional rule application via `globs` field

### Key Features
- Supports mode-specific directories: `.roo/rules-architect/`, `.roo/rules-code/`, etc.
- Can map specific global skills to specific agent personas (modes)
- Reads YAML frontmatter to apply rules conditionally
- Follows filesystem standards including symlinks

### Implementation Approach
1. Create symlink from `~/.agentrules/skills/my-skill.md` to `.roo/rules/my-skill.md`
2. Support mode-specific skill mapping if needed
3. Leverage frontmatter for conditional activation

### Key Changes from Original Research
- Use `.roo/rules/` NOT `.roomodes` or `.clinerules`
- Symlinks work perfectly - this is the ideal agent for the architecture
<!-- SECTION:NOTES:END -->
