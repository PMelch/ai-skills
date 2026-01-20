# ai-skills

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
npx ai-skills init
npx ai-skills activate
```

### Global Installation

```bash
npm install -g ai-skills
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

Use this command after:
- Adding new skill folders to `~/.config/ai-skills/`
- Removing skill folders from `~/.config/ai-skills/`
- Setting up a new machine or agent

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

## Directory Structure

```
~/.config/ai-skills/          # Central skill storage
  ├── skill-1/
  ├── skill-2/
  └── skill-3/

~/.claude/skills/             # Claude skills (symlinked)
  ├── skill-1 -> ~/.config/ai-skills/skill-1
  └── skill-2 -> ~/.config/ai-skills/skill-2

~/.gemini/skills/             # Gemini skills (symlinked)
  └── skill-3 -> ~/.config/ai-skills/skill-3
```

## Supported Agents

- **Claude** (`~/.claude/skills`)
- **Gemini** (`~/.gemini/skills`)

More agents can be easily added!

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
