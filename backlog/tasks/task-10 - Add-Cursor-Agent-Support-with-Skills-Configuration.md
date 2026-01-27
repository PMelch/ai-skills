---
id: task-10
title: Add Cursor Agent Support with Skills Configuration
status: To Do
assignee: []
created_date: '2026-01-21 15:58'
updated_date: '2026-01-27 11:41'
labels:
  - enhancement
  - agent-support
  - research-needed
dependencies: []
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
## Overview
Implement support for Cursor AI editor in the ai-skills CLI tool to enable centralized skill management with Cursor's `.cursorrules` configuration system.

## Background Research
Cursor AI is a VSCode-based AI-powered code editor that uses `.cursorrules` files to define custom AI behavior and instructions.

### Configuration File Locations

#### Project-Specific Configuration (VERIFIED)
- **Location**: `.cursorrules` file in the project root directory
- **Format**: Plain text file containing AI instructions/rules
- **Purpose**: Project-specific AI behavior customization
- **Reference**: https://github.com/PatrickJS/awesome-cursorrules

#### Global/User-Level Configuration (NEEDS VERIFICATION)
- **Potential locations to research**:
  1. `~/.cursor/` directory (similar to other editors)
  2. User settings within Cursor application settings
  3. VSCode-compatible settings directory (as Cursor is built on VSCode)
- **Action Required**: Test and verify the actual global configuration mechanism

### How .cursorrules Works
Based on https://github.com/PatrickJS/awesome-cursorrules:
1. Place `.cursorrules` file in project root
2. Cursor AI automatically detects and applies rules
3. Rules are plain text instructions that guide AI behavior
4. No special syntax required - just natural language instructions

## Implementation Requirements

### 1. Research Phase (CRITICAL)
**Must verify before implementation**:
- [ ] Test Cursor installation locations on macOS, Linux, Windows
- [ ] Verify if Cursor supports user-level/global configuration files
- [ ] Determine if Cursor can reference external files or only reads `.cursorrules`
- [ ] Test if symlinks work with `.cursorrules` (can we symlink to central skills?)
- [ ] Investigate if Cursor supports multiple rule files or includes

### 2. CursorAgent Class Implementation
Create `src/core/agents/cursor.ts` following pattern of existing agents:

```typescript
export class CursorAgent extends BaseAgent {
  readonly id = 'cursor';
  readonly name = 'Cursor';
  
  getSkillsPath(): string {
    // Determine central skills location for Cursor
    // Potentially: ~/.cursor/skills or follow same pattern
  }
  
  async updateProjectConfiguration(skills: string[], projectRoot: string): Promise<void> {
    // Update .cursorrules file in project root
    // Generate skill activation block similar to other agents
  }
}
```

### 3. Project-Specific Activation
- **Target file**: `.cursorrules` in project root
- **Format**: Similar to Copilot's approach with marker comments
- **Pattern**:
  ```
  <!-- SKILLS_ACTIVATION_START -->
  # Active Skills
  - skill-1
  - skill-2
  <!-- SKILLS_ACTIVATION_END -->
  ```

### 4. Global Skills Storage
- **Option A**: Use central `~/.config/ai-skills/` (same as other agents)
- **Option B**: Cursor-specific `~/.cursor/skills/` with symlinks from central
- **Recommended**: Follow existing pattern - symlink from `~/.config/ai-skills/` to `~/.cursor/skills/`

## Key Questions to Answer
1. **Global config location**: Where does Cursor look for user-level configurations?
2. **File inclusion**: Can `.cursorrules` include/reference other files?
3. **Symlink support**: Does Cursor follow symlinks when reading `.cursorrules`?
4. **Multiple files**: Can we have `.cursorrules` + `.cursor/CURSOR.md` or is it only `.cursorrules`?
5. **Installation detection**: How to detect if Cursor is installed? (Check for app bundle on macOS, exe on Windows, etc.)

## Testing Plan
1. Install Cursor AI locally
2. Create test `.cursorrules` with various content
3. Test symlink behavior with `.cursorrules`
4. Verify skill activation works correctly
5. Test on multiple platforms if possible

## References
- **Awesome Cursor Rules**: https://github.com/PatrickJS/awesome-cursorrules
- **Cursor Website**: https://cursor.com
- **Cursor Docs**: https://docs.cursor.com
- **Example .cursorrules repo**: https://github.com/PatrickJS/awesome-cursorrules (hundreds of real-world examples)
- **Cursor GitHub**: https://github.com/getcursor/cursor

## Success Criteria
- [ ] Cursor agent can be detected via `ai-skills init`
- [ ] Skills can be symlinked to appropriate Cursor location
- [ ] `ai-skills activate` updates `.cursorrules` in project root
- [ ] Skills are properly loaded and recognized by Cursor AI
- [ ] Documentation updated with Cursor support
- [ ] Tests added for Cursor agent
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Research completed and documented: verified global config location, symlink support, and file inclusion behavior
- [ ] #2 CursorAgent class implemented in src/core/agents/cursor.ts following existing agent patterns
- [ ] #3 Cursor agent registered in AgentManager (src/core/agents.ts)
- [ ] #4 Project-specific .cursorrules file generation working with skill activation blocks
- [ ] #5 Integration tests passing for cursor agent
- [ ] #6 README.md updated with Cursor agent in supported agents list
- [ ] #7 Manual testing completed: install Cursor, run ai-skills commands, verify skills are activated
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
## Document Findings (CombineSkilsAndRules.md)

**CRITICAL UPDATE**: The document provides specific guidance for Cursor:

- **Architecture**: Monolithic/Directory Scanner
- **Config Path**: `.cursor/rules/` (NOT just `.cursorrules` in root)
- **Symlink Status**: **BROKEN/UNSUPPORTED** - Cursor fails to traverse symlinks in `.cursor/rules/`
- **Integration Strategy**: **Managed Synchronization (Copy)**
- **File Extension**: `.mdc` (must rename `.md` to `.mdc` during copy)
- **Frontmatter**: Ignored (context only)

### Implementation Approach
1. Copy files from global source to project `.cursor/rules/`
2. Calculate checksum of source and target to detect changes
3. Rename `skill.md` to `skill.mdc` during copy
4. Implement sync mechanism (file watcher or on-demand sync command)

### Key Changes from Original Research
- Focus on `.cursor/rules/` directory, not just `.cursorrules` file
- **Do NOT use symlinks** - they are broken in Cursor
- Must implement copy/sync strategy instead
<!-- SECTION:NOTES:END -->
