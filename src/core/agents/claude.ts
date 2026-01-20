import { join } from 'path';
import { BaseAgent } from './base.js';

export class ClaudeAgent extends BaseAgent {
  readonly id = 'claude';
  readonly name = 'Claude';

  getSkillsPath(): string {
    return join(this.homeDir, '.claude', 'skills');
  }
}
