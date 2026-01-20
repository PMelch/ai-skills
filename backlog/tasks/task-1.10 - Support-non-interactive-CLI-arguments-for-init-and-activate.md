---
id: task-1.10
title: Support non-interactive CLI arguments for init and activate
status: Done
assignee: []
created_date: '2026-01-20 19:25'
updated_date: '2026-01-20 19:47'
labels: []
dependencies: []
parent_task_id: task-1
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Currently, `init` and `activate` commands rely on interactive prompts (inquirer). This makes automated testing and scripting difficult. We need to add support for passing these selections via command-line arguments.

For `init`:
- Allow specifying agents to configure (e.g., `ai-skills init --agents codex,copilot`).

For `activate`:
- Allow specifying skills to activate (e.g., `ai-skills activate --skills tdd-protocol`).
- Allow specifying agents to target (e.g., `ai-skills activate --agents codex`).
- Ideally support activating *all* available skills or agents with a flag if appropriate, or default to current behavior if mixed.

Implementation details:
- Parse args using the existing CLI framework (likely `commander` or just checking `process.argv` if custom, but checking `cli.ts` might reveal usage).
- Pass these options down to the command functions.
- Add conditional logic to skip prompts if options are present.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 `init` command accepts `--agents` flag (comma-separated list or multiple flags).
- [x] #2 `activate` command accepts `--skills` and `--agents` flags.
- [x] #3 If required flags are provided, interactive prompts are skipped.
- [x] #4 Validation ensures provided agents and skills exist/are valid.
- [x] #5 Tests added to verify non-interactive execution for both commands.
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
## Implementation Summary

Implemented non-interactive CLI arguments for both `init` and `activate` commands following strict TDD protocol.

### Changes Made:

1. **CLI Arguments** (cli.ts):
   - Added `--agents <agents...>` option to `init` command
   - Added `--skills <skills...>` and `--agents <agents...>` options to `activate` command
   - Both support comma-separated values and multiple flags

2. **Init Command** (init.ts):
   - Added `InitOptions` interface with optional `agents` parameter
   - Implemented conditional logic to skip interactive prompts when agents provided via CLI
   - Added validation for agent names against supported agents list
   - Extracts helper function `parseCommaSeparated()` for parsing input

3. **Activate Command** (activate.ts):
   - Added `ActivateOptions` interface with optional `skills` and `agents` parameters
   - Implemented conditional logic to skip prompts when flags provided
   - Added validation for both skill and agent names
   - Shared helper function `parseCommaSeparated()` for parsing input

4. **Tests**:
   - Added 7 new test cases covering all acceptance criteria
   - Tests verify non-interactive execution, validation, and error handling
   - All 59 tests pass (13 for init/activate commands)

### Usage Examples:
```bash
# Init with specific agents
ai-skills init --agents codex,copilot
ai-skills init --agents codex --agents copilot

# Activate with skills and agents
ai-skills activate --skills tdd-protocol --agents codex
ai-skills activate --skills skill1,skill2 --agents agent1,agent2

# Partial non-interactive (prompts for missing values)
ai-skills activate --skills tdd-protocol  # Still prompts for agents
ai-skills activate --agents codex         # Still prompts for skills
```
<!-- SECTION:NOTES:END -->
