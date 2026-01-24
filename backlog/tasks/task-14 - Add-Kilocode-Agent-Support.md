---
id: task-14
title: Add Kilocode Agent Support
status: To Do
assignee: []
created_date: '2026-01-24 10:38'
labels: []
dependencies: []
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
## Overview
Implement support for the Kilocode agent in the ai-skills CLI tool. Kilocode is an open-source AI coding agent extension for VS Code.

## Background Research
Kilocode is an extension, not a fork. It likely has configuration mechanisms similar to Cline or other agentic extensions.

### Configuration File Locations

#### Project-Specific Configuration
- **Hypothesis**: `.kilorules`? `.kilocode/config`? Or does it reuse VS Code settings?
- **Action**: Need to install and verify or search documentation for "Kilocode custom instructions" or "Kilocode rules".

#### Global Configuration
- **Hypothesis**: Extension settings or a global config file in user home.

## Implementation Requirements

### 1. Research Phase (High Priority)
- [ ] Identify Kilocode's configuration file for custom instructions.
- [ ] Determine if it supports mode-specific instructions (it has "Ask", "Architect", "Code" modes).
- [ ] Verify if it can read from a file in the project root.

### 2. KilocodeAgent Class Implementation
Create `src/core/agents/kilocode.ts`:

```typescript
export class KilocodeAgent extends BaseAgent {
  readonly id = 'kilocode';
  readonly name = 'Kilocode';
  
  getSkillsPath(): string {
     // TBD
  }
  
  async updateProjectConfiguration(skills: string[], projectRoot: string): Promise<void> {
    // TBD
  }
}
```

## Success Criteria
- [ ] Kilocode agent detected.
- [ ] Configuration mechanism identified.
- [ ] Skills successfully injected into Kilocode's context.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] Research on Kilocode config completed.
- [ ] `KilocodeAgent` class implemented.
- [ ] Project activation logic implemented.
- [ ] Tests added.
<!-- AC:END -->
<!-- SECTION:DESCRIPTION:END -->
