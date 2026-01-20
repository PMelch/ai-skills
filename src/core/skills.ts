import { promises as fs } from 'fs';
import { join } from 'path';
import { ConfigManager } from './config.js';

interface ProjectConfig {
  skills: string[];
  agents: string[];
  updatedAt: string;
}

export class SkillManager {
  private projectConfigFile: string;

  constructor() {
    this.projectConfigFile = join(process.cwd(), '.ai-skills.json');
  }

  async getAvailableSkills(): Promise<string[]> {
    const configManager = new ConfigManager();
    const centralDir = configManager.getConfigDir();

    try {
      const entries = await fs.readdir(centralDir, { withFileTypes: true });
      const skills = entries
        .filter(entry => entry.isDirectory() && !entry.name.startsWith('.'))
        .map(entry => entry.name)
        .sort();
      
      return skills;
    } catch {
      return [];
    }
  }

  async getActiveSkills(): Promise<string[]> {
    try {
      const content = await fs.readFile(this.projectConfigFile, 'utf-8');
      const config: ProjectConfig = JSON.parse(content);
      return config.skills || [];
    } catch {
      return [];
    }
  }

  async saveProjectConfig(skills: string[], agents: string[]): Promise<void> {
    const config: ProjectConfig = {
      skills,
      agents,
      updatedAt: new Date().toISOString()
    };

    await fs.writeFile(
      this.projectConfigFile,
      JSON.stringify(config, null, 2),
      'utf-8'
    );
  }
}
