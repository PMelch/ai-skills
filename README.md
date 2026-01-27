# @pmelch/ai-skills

A CLI tool to manage AI agent skills centrally from `~/.config/ai-skills` with automatic syncing to agent-specific folders.

## Features

- 🎯 **Central Management**: Store all your AI skills in one place (`~/.config/ai-skills`)
- 🔗 **Automatic Syncing**: Symlinks skills to agent folders (Claude, Gemini, etc.)
- 🚀 **Project-Specific**: Activate different skills per project
- 🎨 **Rich CLI**: Beautiful terminal interface with colors and interactive prompts
- 📦 **Easy Distribution**: Use via `npx` without installation

## Installation

### Via npx (No installation required)

```bash
npx @pmelch/ai-skills init
npx @pmelch/ai-skills activate
```

### Global Installation

```bash
npm install -g @pmelch/ai-skills
ai-skills init
ai-skills activate
```

## Usage

### Initialize

Setup the central configuration folder and link to agent directories:

```bash
ai-skills init
```

This will:
1. Create `~/.config/ai-skills/` directory
2. Detect available AI agents (Claude, Gemini)
3. Create symlinks from agent folders to the central directory

**Options:**
- `--agents <agents...>` - Specify agents to configure. Supports multiple space-separated or comma-separated values (e.g., `--agents claude gemini` or `--agents claude,gemini`).

### Sync Skills

Sync newly added skills and remove orphaned symlinks:

```bash
ai-skills sync
```

This will:
1. Scan `~/.config/ai-skills/` for all skill folders
2. Create symlinks for new skills in all configured agent directories
3. Remove symlinks to skills that no longer exist
4. Show summary of changes

### Activate Skills

Select which skills to use in your current project:

```bash
ai-skills activate
```

This will:
1. Show all available skills from `~/.config/ai-skills/`
2. Let you select which skills to activate
3. Choose which agents to configure
4. Save configuration in `.ai-skills.json`
5. Update agent-specific configuration files (e.g., `.copilot/instructions.md`, `.claude/CLAUDE.md`)

**Options:**
- `--skills <skills...>` - Specify skills to activate without prompts. Supports space-separated or comma-separated values (e.g., `--skills skill-1 skill-2` or `--skills skill-1,skill-2`).
- `--agents <agents...>` - Specify agents to target without prompts. Supports space-separated or comma-separated values (e.g., `--agents copilot claude` or `--agents copilot,claude`).

**Examples:**
```bash
# Interactive mode (prompts for selection)
ai-skills activate

# Activate specific skills for all configured agents
ai-skills activate --skills tdd-protocol security-auditor

# Comma-separated format
ai-skills activate --skills tdd-protocol,security-auditor --agents copilot
```

## Supported Agents

| Agent | Global Skill Config (Symlink Dir) | Project Activation (Edited File) |
|-------|-----------------------------------|----------------------------------|
| **Claude** | `~/.claude/skills` | `.claude/CLAUDE.md` | 
| **Copilot** | `~/.copilot/skills` | `.github/copilot-instructions.md` |
| **Codex** | `~/.codex/skills` | `.codex/config.toml` |
| **Gemini** | `~/.gemini/skills` | `.gemini/settings.json` |

More agents can be easily added! See [Adding New Agents](docs/adding-new-agents.md) for details.

## Troubleshooting

### Permission Issues
If you encounter permission errors (EACCES) when creating symlinks:
1. Check the permissions of your configuration directory: `ls -la ~/.config/ai-skills`
2. Ensure you have write access to the agent directories (e.g., `~/.claude/skills`)

### Missing Skills in Agents
If skills are not showing up in your agent:
1. Run `ai-skills sync` to refresh symlinks
2. Check if the skill exists in `~/.config/ai-skills`
3. Verify the agent configuration directory exists

### "Agent not found"
If `ai-skills init` doesn't detect your agent:
1. Manually create the agent's configuration directory (e.g., `mkdir -p ~/.claude`)
2. Run `ai-skills init` again

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Run locally
npm start

# Watch mode
npm run dev
```

## Technology Stack

- **TypeScript**: Type-safe code
- **Node.js**: Cross-platform runtime
- **Commander**: CLI framework
- **Inquirer**: Interactive prompts
- **Chalk**: Terminal colors
- **Ora**: Loading spinners

## License

MIT
