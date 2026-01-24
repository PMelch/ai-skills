---
id: task-13
title: Add Cline Agent Support
status: To Do
assignee: []
created_date: '2026-01-24 10:38'
labels: []
dependencies: []
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
## Overview
Implement support for the Cline agent in the ai-skills CLI tool. Cline is an autonomous coding agent extension for VS Code.

## Background Research
Cline uses `.clinerules` to define project-specific rules and instructions.

### Configuration File Locations

#### Project-Specific Configuration
- **Location**: `.clinerules` (file) or `.clinerules/` (directory) in the project root.
- **Verification Needed**: Confirm if Cline supports a single `.clinerules` file or requires a directory structure. The common convention is a file, but some sources mention a directory.
- **Purpose**: Guide the agent with project context, style guides, and architectural decisions.

#### Global Configuration
- **Location**: System-dependent (e.g., `~/Documents/Cline/Rules` on macOS/Linux).
- **Purpose**: Global rules applied to all projects.

## Implementation Requirements

### 1. Research Phase
- [ ] Verify the exact format of `.clinerules` (text vs markdown vs JSON).
- [ ] Confirm if it supports imports or if we need to append instructions directly.
- [ ] Check if we can symlink global skills into the global rules directory.

### 2. ClineAgent Class Implementation
Create `src/core/agents/cline.ts`:

```typescript
export class ClineAgent extends BaseAgent {
  readonly id = 'cline';
  readonly name = 'Cline';
  
  getSkillsPath(): string {
     // Likely ~/.config/ai-skills or specialized global path
  }
  
  async updateProjectConfiguration(skills: string[], projectRoot: string): Promise<void> {
    // Update .clinerules
  }
}
```

### 3. Project-Specific Activation
- **Target**: `.clinerules` in project root.
- **Strategy**: 
  - If it's a file: Append/Prepend skill instructions.
  - If it's a directory: Symlink skill files into it?

## Success Criteria
- [ ] Cline agent detected.
- [ ] Skills activation updates `.clinerules`.
- [ ] Global skills synced if applicable.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] Research completed on `.clinerules` structure.
- [ ] `ClineAgent` class implemented.
- [ ] Project activation logic implemented.
- [ ] Integration tests added.
<!-- AC:END -->
<!-- SECTION:DESCRIPTION:END -->
