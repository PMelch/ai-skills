import * as fs from 'fs/promises';
import * as path from 'path';

interface GeminiAgentConfig {
  activeSkills?: string[];
  [key: string]: any;
}

interface GeminiSettings {
  agent?: GeminiAgentConfig;
  [key: string]: any;
}

export class GeminiSettingsManager {
  private settingsPath: string;
  private geminiDir: string;

  constructor() {
    const cwd = process.cwd();
    this.geminiDir = path.join(cwd, '.gemini');
    this.settingsPath = path.join(this.geminiDir, 'settings.json');
  }

  async addActiveSkills(skillNames: string[]): Promise<void> {
    let settings: GeminiSettings = {};

    try {
      await fs.access(this.settingsPath);
      const content = await fs.readFile(this.settingsPath, 'utf-8');
      settings = JSON.parse(content);
    } catch (error: any) {
        // File doesn't exist, start with empty object
        if (error.code !== 'ENOENT') {
            throw error;
        }
    }

    if (!settings.agent) {
      settings.agent = {};
    }

    if (!settings.agent.activeSkills) {
      settings.agent.activeSkills = [];
    }

    for (const skillName of skillNames) {
      if (!settings.agent.activeSkills.includes(skillName)) {
        settings.agent.activeSkills.push(skillName);
      }
    }

    // Ensure directory exists
    try {
      await fs.access(this.geminiDir);
    } catch (error: any) {
       if (error.code === 'ENOENT') {
           await fs.mkdir(this.geminiDir, { recursive: true });
       } else {
           throw error;
       }
    }

    await fs.writeFile(this.settingsPath, JSON.stringify(settings, null, 2), 'utf-8');
  }

  async addActiveSkill(skillName: string): Promise<void> {
    return this.addActiveSkills([skillName]);
  }
}
