import { join } from 'path';
import { BaseAgent } from './base.js';

export class CodexAgent extends BaseAgent {
  readonly id = 'codex';
  readonly name = 'Codex';

  getSkillsPath(): string {
    return join(this.homeDir, '.codex', 'skills');
  }
}
