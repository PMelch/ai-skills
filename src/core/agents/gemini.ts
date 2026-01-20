import { join } from 'path';
import { BaseAgent } from './base.js';
import { GeminiSettingsManager } from '../gemini.js';

export class GeminiAgent extends BaseAgent {
  readonly id = 'gemini';
  readonly name = 'Gemini';

  getSkillsPath(): string {
    return join(this.homeDir, '.gemini', 'skills');
  }

  async updateProjectConfiguration(skills: string[], projectRoot: string = process.cwd()): Promise<void> {
    const settingsManager = new GeminiSettingsManager(projectRoot);
    await settingsManager.addActiveSkills(skills);
  }
}
