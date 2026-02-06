---
id: TASK-20
title: Handle unknown agents gracefully during config parsing
status: Done
assignee:
  - claude
created_date: '2026-02-06 19:26'
updated_date: '2026-02-06 19:31'
labels: []
dependencies: []
references:
  - src/core/agents.ts
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
When running 'ai-skills activate' with a config that references an agent not yet implemented (e.g., 'antigravity'), the CLI crashes with 'Error: Unknown agent: antigravity'. Instead, unrecognized agents in the config should be skipped gracefully with a warning message, allowing activation to proceed for the agents that are supported. The error originates in src/core/agents.ts:35 where getAgentById() throws on unknown IDs. The config may reference agents from TASK-12 (Antigravity), TASK-10 (Cursor), etc. that are not yet implemented.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 When config references an unknown/unimplemented agent, activation does not crash
- [x] #2 A clear warning is displayed listing which agents were skipped and why
- [x] #3 Activation proceeds successfully for all recognized/supported agents
- [x] #4 Unit tests cover the unknown agent scenario in config parsing
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Add tryGetAgent(id) to AgentManager that returns undefined instead of throwing
2. Add tryGetAgentInfo(id) export helper
3. Update ConfigManager.getConfiguredAgents() to skip unknown agents, return { agents, skippedAgentIds }
4. Update activate.ts to display warnings for skipped agents
5. Write failing tests first (TDD), then implement
<!-- SECTION:PLAN:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
## Summary
- Added `tryGetAgent(id)` method to `AgentManager` that returns `undefined` instead of throwing for unknown agents
- Added `tryGetAgentInfo(id)` export helper for the same purpose
- Changed `ConfigManager.getConfiguredAgents()` return type from `AgentInfo[]` to `{ agents: AgentInfo[], skippedAgentIds: string[] }` — unknown agents are now filtered out and reported
- Updated `activate.ts` and `sync.ts` to destructure the new return shape and display a yellow warning when agents are skipped
- Updated all test mocks in activate and sync test files to use the new return shape
- Added 5 new tests: `tryGetAgent` (known/unknown), `tryGetAgentInfo` (known/unknown), and 3 config tests for unknown agent handling (mixed, all-known, all-unknown)
- All 13 test suites, 107 tests pass. Clean build.
<!-- SECTION:FINAL_SUMMARY:END -->
