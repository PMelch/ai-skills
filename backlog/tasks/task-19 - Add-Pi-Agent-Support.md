---
id: task-19
title: Add Pi Agent Support
status: To Do
assignee: []
created_date: '2026-02-06 12:00'
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
Implement support for the Pi coding agent in the ai-skills CLI tool.

## Background Research
Pi is a coding agent that uses a global skills directory and a project-level configuration file for agent behavior customization.

### Configuration File Locations

#### Global Configuration
- **Skills Directory**: `~/.pi/agent/skills/`
- Skills are defined as files within this global directory, following Pi's expected format.

#### Project-Specific Configuration
- **Project Config**: `AGENTS.md` file in the project root directory
- This file provides project-specific agent instructions and configuration.

## Implementation Requirements

### 1. PiAgent Class Implementation
Create `src/core/agents/pi.ts`:

```typescript
export class PiAgent extends BaseAgent {
  readonly id = 'pi';
  readonly name = 'Pi';

  getSkillsPath(): string {
    // Returns ~/.pi/agent/skills/
    return join(this.homeDir, '.pi', 'agent', 'skills');
  }

  async updateProjectConfiguration(skills: string[], projectRoot: string): Promise<void> {
    // Generate AGENTS.md in the project root with activated skill references
  }
}
```

### 2. Global Skills Activation
- **Target**: `~/.pi/agent/skills/` directory
- **Strategy**: Symlink skill files from the central ai-skills directory into `~/.pi/agent/skills/`
- The base class `activateSkills` method handles symlink creation, so `getSkillsPath()` returning the correct path should be sufficient.

### 3. Project-Specific Activation
- **Target**: `AGENTS.md` file in the project root
- **Strategy**: Generate or update the `AGENTS.md` file with references to the activated skills
- Must not overwrite user-authored content if already present

### 4. Agent Registration
- Import `PiAgent` in `src/core/agents.ts`
- Add `new PiAgent(home)` to the agents array in the `AgentManager` constructor

### 5. Detection
- Check for `~/.pi/` directory presence to determine if Pi agent is installed

## Success Criteria
- [ ] Pi agent detected via `ai-skills init`
- [ ] Skills symlinked to `~/.pi/agent/skills/`
- [ ] `AGENTS.md` generated in project root during activation
- [ ] Integration with existing activation workflow works end-to-end
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 `PiAgent` class implemented in `src/core/agents/pi.ts` extending `BaseAgent`
- [ ] #2 `getSkillsPath()` returns `~/.pi/agent/skills/` correctly
- [ ] #3 Global skill files are symlinked into `~/.pi/agent/skills/` directory
- [ ] #4 `updateProjectConfiguration()` generates a project-level `AGENTS.md` file
- [ ] #5 Existing user content in `AGENTS.md` is preserved (no destructive overwrites)
- [ ] #6 Agent registered in `AgentManager` in `src/core/agents.ts`
- [ ] #7 Agent detection works via `isInstalled()` checking for `~/.pi/` directory
- [ ] #8 Integration with the existing `ai-skills activate` workflow verified
- [ ] #9 Unit tests added for PiAgent class
- [ ] #10 README.md updated with Pi in supported agents table
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
### Architecture Notes
- Pi follows a similar pattern to other agents in the project (e.g., Claude, Gemini, Codex).
- The global skills path `~/.pi/agent/skills/` means `getSkillsPath()` should return `join(homeDir, '.pi', 'agent', 'skills')`.
- The `AGENTS.md` project config file is analogous to how Claude uses `CLAUDE.md` or Gemini uses project-specific settings.
- The base `activateSkills()` method from `BaseAgent` should handle symlink creation automatically once the correct skills path is returned.
- `updateProjectConfiguration()` needs a custom implementation to write/update `AGENTS.md` in the project root.
<!-- SECTION:NOTES:END -->
