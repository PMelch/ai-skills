# Adding New Agents

This guide explains how to extend the ai-skills system to support new AI agents.

## Overview

The ai-skills system uses an object-oriented plugin architecture where each agent extends a base class and implements agent-specific behavior. Adding a new agent typically requires:

1. Creating a new agent class
2. Registering the agent in the AgentManager
3. (Optional) Implementing project-level configuration

## Step-by-Step Guide

### 1. Create Agent Class

Create a new file in `src/core/agents/` (e.g., `myagent.ts`):

```typescript
import { join } from 'path';
import { BaseAgent } from './base.js';

export class MyAgent extends BaseAgent {
  readonly id = 'myagent';      // Unique identifier (lowercase, no spaces)
  readonly name = 'MyAgent';     // Display name

  getSkillsPath(): string {
    // Return the path where skills should be symlinked
    // Convention: ~/.{agent-name}/skills
    return join(this.homeDir, '.myagent', 'skills');
  }
}
```

### 2. Register Agent

Add your agent to the `AgentManager` constructor in `src/core/agents.ts`:

```typescript
import { MyAgent } from './agents/myagent.js';

export class AgentManager {
  constructor() {
    this.agents = new Map();
    const home = homedir();
    
    const agents = [
      new ClaudeAgent(home),
      new GeminiAgent(home),
      new CodexAgent(home),
      new CopilotAgent(home),
      new MyAgent(home),  // Add your agent here
    ];

    agents.forEach(agent => this.agents.set(agent.id, agent));
  }
  // ...
}
```

### 3. (Optional) Implement Project Configuration

If your agent requires project-specific configuration (like Copilot's `.github/copilot-instructions.md` or Claude's `.claude/CLAUDE.md`), override the `updateProjectConfiguration` method:

```typescript
import { promises as fs } from 'fs';
import { join } from 'path';
import { BaseAgent } from './base.js';

const SKILLS_START = '<!-- SKILLS_START -->';
const SKILLS_END = '<!-- SKILLS_END -->';

export class MyAgent extends BaseAgent {
  readonly id = 'myagent';
  readonly name = 'MyAgent';

  getSkillsPath(): string {
    return join(this.homeDir, '.myagent', 'skills');
  }

  async updateProjectConfiguration(
    skills: string[], 
    projectRoot: string = process.cwd()
  ): Promise<void> {
    const configPath = join(projectRoot, '.myagent', 'config.md');
    const configDir = join(projectRoot, '.myagent');

    // Ensure config directory exists
    await fs.mkdir(configDir, { recursive: true });

    let content = '';
    let hasExistingFile = false;

    // Try to read existing file
    try {
      content = await fs.readFile(configPath, 'utf-8');
      hasExistingFile = true;
    } catch {
      // File doesn't exist, create new
      content = \`# MyAgent Configuration\n\n\${SKILLS_START}\n\${SKILLS_END}\n\`;
    }

    // Generate skills activation block
    const activationBlock = skills.length > 0
      ? \`When working in this repo, always enable these skills:\n\${skills.map(s => \`- @\${s}\`).join('\n')}\n\`
      : '# No skills currently activated\n';

    // Update or insert skills block
    if (hasExistingFile && content.includes(SKILLS_START)) {
      const before = content.substring(0, content.indexOf(SKILLS_START) + SKILLS_START.length);
      const after = content.substring(content.indexOf(SKILLS_END));
      content = \`\${before}\n\${activationBlock}\${after}\`;
    } else {
      content = \`# MyAgent Configuration\n\n\${SKILLS_START}\n\${activationBlock}\${SKILLS_END}\n\`;
    }

    // Write updated content
    await fs.writeFile(configPath, content, 'utf-8');
  }
}
```

#### Best Practices for Project Configuration

1. **Use Guard Comments**: Wrap skill activation blocks with HTML-style comments (e.g., `<!-- SKILLS_START -->` and `<!-- SKILLS_END -->`) to enable programmatic updates without destroying user customizations
2. **Preserve User Content**: Only update content within guard comments, preserve everything else
3. **Handle Initial Setup**: Create sensible defaults when the config file doesn't exist
4. **Use Markdown Format**: Most agents expect markdown-formatted instructions
5. **Clear Empty State**: When no skills are active, provide clear messaging

### 4. Test Your Agent

Create tests in `src/core/agents/__tests__/myagent.test.ts`:

```typescript
import { MyAgent } from '../myagent.js';
import { promises as fs } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

describe('MyAgent', () => {
  let myAgent: MyAgent;
  let tempDir: string;
  let homeDir: string;
  let projectDir: string;

  beforeEach(async () => {
    tempDir = join(tmpdir(), \`ai-skills-myagent-test-\${Date.now()}\`);
    homeDir = join(tempDir, 'home');
    projectDir = join(tempDir, 'project');
    
    await fs.mkdir(homeDir, { recursive: true });
    await fs.mkdir(projectDir, { recursive: true });
    
    myAgent = new MyAgent(homeDir);
  });

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  it('should have correct id and name', () => {
    expect(myAgent.id).toBe('myagent');
    expect(myAgent.name).toBe('MyAgent');
  });

  it('should return correct skills path', () => {
    const expectedPath = join(homeDir, '.myagent', 'skills');
    expect(myAgent.getSkillsPath()).toBe(expectedPath);
  });

  // Add more tests for updateProjectConfiguration if implemented
});
```

### 5. Update Documentation

Update the README.md to include your new agent:

```markdown
## Supported Agents

- **Claude** (\`~/.claude/skills\`, config: \`.claude/CLAUDE.md\`)
- **Copilot** (\`~/.copilot/skills\`, config: \`.github/copilot-instructions.md\`)
- **Codex** (\`~/.codex/skills\`)
- **Gemini** (\`~/.gemini/skills\`)
- **MyAgent** (\`~/.myagent/skills\`, config: \`.myagent/config.md\`)
```

## Architecture Details

### BaseAgent Class

The \`BaseAgent\` class provides:

- **Agent Detection**: \`isInstalled()\` checks if the agent's parent directory exists
- **Symlink Management**: \`activateSkills()\` creates/removes symlinks to the central skills directory
- **Project Config Hook**: \`updateProjectConfiguration()\` allows agents to update project-level configs

### Key Methods

```typescript
abstract class BaseAgent {
  // Required: Return unique agent identifier
  abstract readonly id: string;
  
  // Required: Return human-readable name
  abstract readonly name: string;
  
  // Required: Return where skills should be symlinked
  abstract getSkillsPath(): string;
  
  // Optional: Return agent info for display
  getInfo(): AgentInfo;
  
  // Optional: Check if agent is installed
  async isInstalled(): Promise<boolean>;
  
  // Inherited: Manage skill symlinks
  async activateSkills(skills: string[], centralSkillsDir: string): Promise<void>;
  
  // Optional: Update project-level configuration
  async updateProjectConfiguration(skills: string[], projectRoot: string): Promise<void>;
}
```

### Agent Detection Logic

The system detects agents by checking if their parent directory exists (e.g., \`~/.myagent\` for MyAgent). This is implemented in \`BaseAgent.isInstalled()\`:

```typescript
async isInstalled(): Promise<boolean> {
  try {
    const parentDir = dirname(this.getSkillsPath());
    await fs.access(parentDir);
    return true;
  } catch {
    return false;
  }
}
```

You can override this method if your agent requires custom detection logic.

## Examples

### Simple Agent (No Project Config)

```typescript
// Codex agent - just symlinks, no project config
export class CodexAgent extends BaseAgent {
  readonly id = 'codex';
  readonly name = 'Codex';

  getSkillsPath(): string {
    return join(this.homeDir, '.codex', 'skills');
  }
}
```

### Agent with JSON Config

```typescript
// Gemini agent - uses JSON settings
export class GeminiAgent extends BaseAgent {
  readonly id = 'gemini';
  readonly name = 'Gemini';

  getSkillsPath(): string {
    return join(this.homeDir, '.gemini', 'skills');
  }

  async updateProjectConfiguration(skills: string[], projectRoot: string): Promise<void> {
    const settingsManager = new GeminiSettingsManager(projectRoot);
    await settingsManager.addActiveSkills(skills);
  }
}
```

### Agent with Markdown Config and Guard Comments

```typescript
// See ClaudeAgent or CopilotAgent implementation for full examples
export class CopilotAgent extends BaseAgent {
  readonly id = 'copilot';
  readonly name = 'Copilot';

  getSkillsPath(): string {
    return join(this.homeDir, '.copilot', 'skills');
  }

  async updateProjectConfiguration(skills: string[], projectRoot: string): Promise<void> {
    // Updates .github/copilot-instructions.md with guard comments
    // See src/core/agents/copilot.ts for full implementation
  }
}
```

## Testing

Run tests for your agent:

```bash
npm test -- myagent.test.ts
```

Test the full integration:

```bash
# Build the project
npm run build

# Test init
npm start init --agents myagent

# Test activation
npm start activate --skills test-skill --agents myagent
```

## Troubleshooting

### Agent Not Detected

- Ensure the agent's parent directory exists (e.g., \`~/.myagent\`)
- Override \`isInstalled()\` if custom detection logic is needed

### Symlinks Not Created

- Verify \`getSkillsPath()\` returns the correct path
- Check that the skills directory is created (happens automatically in \`activateSkills()\`)
- Ensure central skills exist in \`~/.config/ai-skills/\`

### Project Config Not Updated

- Verify \`updateProjectConfiguration()\` is implemented
- Check file permissions in the project directory
- Add debug logging to trace execution

## Contributing

When adding a new agent to the ai-skills repository:

1. Follow the steps above
2. Add comprehensive tests
3. Update README.md
4. Add examples to this guide
5. Submit a pull request with clear documentation

## Summary

Adding a new agent requires:

- ✅ Create agent class extending \`BaseAgent\`
- ✅ Implement \`id\`, \`name\`, and \`getSkillsPath()\`
- ✅ Register in \`AgentManager\`
- ✅ (Optional) Override \`updateProjectConfiguration()\` for project-level config
- ✅ Add tests
- ✅ Update documentation

The plugin architecture makes it straightforward to add new agents while maintaining consistency across the system.
