import { join } from 'path';
import { BaseAgent } from './base.js';

export class CopilotAgent extends BaseAgent {
  readonly id = 'copilot';
  readonly name = 'Copilot';

  getSkillsPath(): string {
    return join(this.homeDir, '.copilot', 'skills');
  }
}
