import { join, dirname } from 'path';
import { promises as fs } from 'fs';
import * as TOML from '@iarna/toml';
import { BaseAgent } from './base.js';

export class CodexAgent extends BaseAgent {
  readonly id = 'codex';
  readonly name = 'Codex';

  getSkillsPath(): string {
    return join(this.homeDir, '.codex', 'skills');
  }

  async updateProjectConfiguration(skills: string[], projectRoot: string = process.cwd()): Promise<void> {
    const configPath = join(this.homeDir, '.codex', 'config.toml');
    
    let config: any = {};
    try {
      const content = await fs.readFile(configPath, 'utf-8');
      config = TOML.parse(content);
    } catch (error: any) {
      if (error.code !== 'ENOENT') {
        throw error;
      }
      // File doesn't exist, start with empty
      config = { skills: { config: [] } };
    }

    // Initialize structure if needed
    if (!config.skills) config.skills = {};
    if (!config.skills.config) config.skills.config = [];
    
    // Ensure it's an array
    if (!Array.isArray(config.skills.config)) {
        config.skills.config = [];
    }

    for (const skill of skills) {
      const skillPath = `~/.codex/skills/${skill}`;
      const existingEntry = config.skills.config.find((entry: any) => entry.path === skillPath);

      if (existingEntry) {
        existingEntry.enabled = true;
      } else {
        config.skills.config.push({
          path: skillPath,
          enabled: true
        });
      }
    }

    // Disable unselected managed skills
    const selectedPaths = new Set(skills.map(s => `~/.codex/skills/${s}`));
    for (const entry of config.skills.config) {
        if (entry.path.startsWith('~/.codex/skills/') && !selectedPaths.has(entry.path)) {
            entry.enabled = false;
        }
    }

    // Write back
    await fs.mkdir(dirname(configPath), { recursive: true });
    await fs.writeFile(configPath, TOML.stringify(config));
  }
}
