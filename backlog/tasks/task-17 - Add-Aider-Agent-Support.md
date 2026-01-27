---
id: task-17
title: Add Aider Agent Support
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
Implement support for Aider terminal agent in the ai-skills CLI tool.

## Document Findings (CombineSkilsAndRules.md)

- **Architecture**: Config Injector (does NOT auto-scan filesystem)
- **Config Path**: `.aider.conf.yml`
- **Integration Strategy**: **Guarded Config Block Injection**
- **File Extension**: N/A (paths in config)
- **Frontmatter**: Ignored (context only)

### Key Characteristics
- Requires explicit file listing in configuration
- Files must be registered in `.aider.conf.yml` under `read:` key
- Does NOT follow symlinks automatically - must inject paths
- Uses "Guarded Injection" with markers for safe updates

## Implementation Requirements

### 1. AiderAgent Class Implementation
Create `src/core/agents/aider.ts`:

```typescript
export class AiderAgent extends BaseAgent {
  readonly id = 'aider';
  readonly name = 'Aider';
  
  getSkillsPath(): string {
    // Central skill location
  }
  
  async updateProjectConfiguration(skills: string[], projectRoot: string): Promise<void> {
    // Inject paths into .aider.conf.yml
  }
}
```

### 2. Guarded Config Injection
The injection must use markers to allow safe updates:

**Before:**
```yaml
model: sonnet
dark_mode: true
```

**After:**
```yaml
model: sonnet
dark_mode: true
read:
  - CONVENTIONS.md
  # >>> SKILL_BRIDGE_START >>>
  - /Users/user/.agentrules/skills/python-expert.md
  - /Users/user/.agentrules/skills/security-audit.md
  # <<< SKILL_BRIDGE_END <<<
```

### 3. Implementation Notes
- Parse YAML safely
- Locate or create `read:` key
- Remove existing block between markers
- Insert new block with absolute paths to skills
- Preserve all other configuration

## Success Criteria
- [ ] Aider agent detected
- [ ] Config injection working with guarded blocks
- [ ] Skills loaded by Aider as read-only context
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Research completed: verified .aider.conf.yml structure
- [ ] #2 AiderAgent class implemented in src/core/agents/aider.ts
- [ ] #3 Guarded config injection with SKILL_BRIDGE markers working
- [ ] #4 Existing config preserved during injection
- [ ] #5 Integration tests added
- [ ] #6 README.md updated with Aider in supported agents
<!-- AC:END -->
