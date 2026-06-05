import { join } from 'path';
import { promises as fs } from 'fs';
import { BaseAgent } from './base.js';
import { ConfigManager } from '../config.js';

const MANAGED_START_PREFIX = '<!-- AI_SKILLS_CURSOR_MANAGED:';
const MANAGED_END = '<!-- AI_SKILLS_CURSOR_MANAGED_END -->';

export class CursorAgent extends BaseAgent {
  readonly id = 'cursor';
  readonly name = 'Cursor';

  getSkillsPath(): string {
    return join(this.homeDir, '.cursor', 'skills');
  }

  async updateProjectConfiguration(skills: string[], projectRoot: string = process.cwd()): Promise<void> {
    const rulesDir = join(projectRoot, '.cursor', 'rules');

    await fs.mkdir(rulesDir, { recursive: true });
    await this.removeDeactivatedManagedRules(rulesDir, new Set(skills));

    for (const skill of skills) {
      const sourceContent = await this.readSkillInstructions(skill);
      if (sourceContent === undefined) {
        continue;
      }

      const targetPath = join(rulesDir, `${skill}.mdc`);
      const content = this.generateCursorRule(skill, sourceContent);

      if (!await this.canWriteManagedRule(targetPath)) {
        continue;
      }

      await fs.writeFile(targetPath, content, 'utf-8');
    }
  }

  private async removeDeactivatedManagedRules(rulesDir: string, activeSkills: Set<string>): Promise<void> {
    let entries;
    try {
      entries = await fs.readdir(rulesDir, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      if (!entry.name.endsWith('.mdc') || (!entry.isFile() && !entry.isSymbolicLink())) {
        continue;
      }

      const rulePath = join(rulesDir, entry.name);
      const managedSkill = await this.readManagedSkillName(rulePath);

      if (managedSkill && !activeSkills.has(managedSkill)) {
        await fs.unlink(rulePath);
      }
    }
  }

  private async canWriteManagedRule(targetPath: string): Promise<boolean> {
    try {
      const existing = await fs.readFile(targetPath, 'utf-8');
      return this.extractManagedSkillName(existing) !== undefined;
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        return true;
      }
      throw error;
    }
  }

  private async readManagedSkillName(rulePath: string): Promise<string | undefined> {
    try {
      const content = await fs.readFile(rulePath, 'utf-8');
      return this.extractManagedSkillName(content);
    } catch {
      return undefined;
    }
  }

  private extractManagedSkillName(content: string): string | undefined {
    const markerIndex = content.indexOf(MANAGED_START_PREFIX);
    if (markerIndex === -1) {
      return undefined;
    }

    const markerEnd = content.indexOf('-->', markerIndex);
    if (markerEnd === -1) {
      return undefined;
    }

    return content
      .substring(markerIndex + MANAGED_START_PREFIX.length, markerEnd)
      .trim();
  }

  private async readSkillInstructions(skill: string): Promise<string | undefined> {
    for (const sourceRoot of this.getSourceRoots()) {
      const content = await this.readSkillInstructionsFromRoot(sourceRoot, skill);
      if (content !== undefined) {
        return content;
      }
    }

    return undefined;
  }

  private getSourceRoots(): string[] {
    const centralSkillsDir = new ConfigManager().getConfigDir();
    const cursorSkillsDir = this.getSkillsPath();

    return centralSkillsDir === cursorSkillsDir
      ? [centralSkillsDir]
      : [centralSkillsDir, cursorSkillsDir];
  }

  private async readSkillInstructionsFromRoot(sourceRoot: string, skill: string): Promise<string | undefined> {
    const skillPath = join(sourceRoot, skill);

    let stats;
    try {
      stats = await fs.stat(skillPath);
    } catch {
      return undefined;
    }

    if (stats.isFile()) {
      return fs.readFile(skillPath, 'utf-8');
    }

    if (!stats.isDirectory()) {
      return undefined;
    }

    const candidates = [
      'SKILL.md',
      `${skill}.md`,
      `${skill}.mdc`,
      'README.md'
    ];

    for (const candidate of candidates) {
      const content = await this.readOptionalFile(join(skillPath, candidate));
      if (content !== undefined) {
        return content;
      }
    }

    const entries = await fs.readdir(skillPath, { withFileTypes: true });
    const markdownEntry = entries
      .filter(entry => entry.isFile() && (entry.name.endsWith('.md') || entry.name.endsWith('.mdc')))
      .map(entry => entry.name)
      .sort()[0];

    if (!markdownEntry) {
      return undefined;
    }

    return fs.readFile(join(skillPath, markdownEntry), 'utf-8');
  }

  private async readOptionalFile(path: string): Promise<string | undefined> {
    try {
      return await fs.readFile(path, 'utf-8');
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        return undefined;
      }
      throw error;
    }
  }

  private generateCursorRule(skill: string, sourceContent: string): string {
    const body = this.stripFrontmatter(sourceContent).trim();
    const ruleBody = body.length > 0 ? body : `# ${skill}`;

    return `---\ndescription: "Managed ai-skills rule for ${this.escapeYamlString(skill)}"\nalwaysApply: true\n---\n${MANAGED_START_PREFIX} ${skill} -->\n${ruleBody}\n${MANAGED_END}\n`;
  }

  private stripFrontmatter(content: string): string {
    if (!content.startsWith('---')) {
      return content;
    }

    const lines = content.split(/\r?\n/);
    for (let i = 1; i < lines.length; i++) {
      if (lines[i] === '---') {
        return lines.slice(i + 1).join('\n');
      }
    }

    return content;
  }

  private escapeYamlString(value: string): string {
    return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  }
}
