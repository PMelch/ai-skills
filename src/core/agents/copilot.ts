import { join } from 'path';
import { promises as fs } from 'fs';
import { BaseAgent } from './base.js';

const SKILLS_ACTIVATION_START = '<!-- SKILLS_ACTIVATION_START -->';
const SKILLS_ACTIVATION_END = '<!-- SKILLS_ACTIVATION_END -->';

export class CopilotAgent extends BaseAgent {
  readonly id = 'copilot';
  readonly name = 'Copilot';

  getSkillsPath(): string {
    return join(this.homeDir, '.copilot', 'skills');
  }

  async updateProjectConfiguration(skills: string[], projectRoot: string = process.cwd()): Promise<void> {
    const copilotInstructionsPath = join(projectRoot, '.github', 'copilot-instructions.md');
    const githubDir = join(projectRoot, '.github');

    // Ensure .github directory exists
    await fs.mkdir(githubDir, { recursive: true });

    let content = '';
    let hasExistingFile = false;

    // Try to read existing file
    try {
      content = await fs.readFile(copilotInstructionsPath, 'utf-8');
      hasExistingFile = true;
    } catch {
      // File doesn't exist, create new content
      content = '# Copilot Instructions\n\n';
    }

    // Generate the skills activation block
    const skillsBlock = this.generateSkillsActivationBlock(skills);

    // Check if there's already a skills activation block
    const startIndex = content.indexOf(SKILLS_ACTIVATION_START);
    const endIndex = content.indexOf(SKILLS_ACTIVATION_END);

    if (startIndex !== -1 && endIndex !== -1) {
      // Replace existing block
      const before = content.substring(0, startIndex);
      const after = content.substring(endIndex + SKILLS_ACTIVATION_END.length);
      content = before + skillsBlock + after;
    } else {
      // Add new block at the end
      if (!content.endsWith('\n\n')) {
        content += '\n\n';
      }
      content += skillsBlock;
    }

    // Write the updated content
    await fs.writeFile(copilotInstructionsPath, content, 'utf-8');
  }

  private generateSkillsActivationBlock(skills: string[]): string {
    if (skills.length === 0) {
      return `${SKILLS_ACTIVATION_START}\n<!-- No skills activated -->\n${SKILLS_ACTIVATION_END}\n`;
    }

    const skillsList = skills.map(skill => `- @${skill}`).join('\n');
    return `${SKILLS_ACTIVATION_START}\nWhen working in this repo, always enable these skills:\n${skillsList}\n${SKILLS_ACTIVATION_END}\n`;
  }
}
