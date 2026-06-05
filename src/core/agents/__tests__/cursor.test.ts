import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { promises as fs } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import * as os from 'os';

jest.mock('os', () => ({
  ...jest.requireActual('os') as any,
  homedir: jest.fn()
}));

import { CursorAgent } from '../cursor.js';

describe('CursorAgent', () => {
  let tempDir: string;
  let cursorAgent: CursorAgent;
  let homeDir: string;
  let projectDir: string;
  let cursorSkillsDir: string;

  beforeEach(async () => {
    tempDir = join(tmpdir(), `ai-skills-cursor-test-${Date.now()}`);
    await fs.mkdir(tempDir, { recursive: true });

    homeDir = join(tempDir, 'home');
    projectDir = join(tempDir, 'project');
    cursorSkillsDir = join(homeDir, '.cursor', 'skills');

    await fs.mkdir(cursorSkillsDir, { recursive: true });
    await fs.mkdir(projectDir, { recursive: true });

    (os.homedir as jest.Mock).mockReturnValue(homeDir);

    cursorAgent = new CursorAgent(homeDir);
  });

  afterEach(async () => {
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  describe('basic properties', () => {
    it('should have id "cursor"', () => {
      expect(cursorAgent.id).toBe('cursor');
    });

    it('should have name "Cursor"', () => {
      expect(cursorAgent.name).toBe('Cursor');
    });
  });

  describe('getSkillsPath', () => {
    it('should return ~/.cursor/skills', () => {
      expect(cursorAgent.getSkillsPath()).toBe(join(homeDir, '.cursor', 'skills'));
    });
  });

  describe('isInstalled', () => {
    it('should return true when ~/.cursor directory exists', async () => {
      expect(await cursorAgent.isInstalled()).toBe(true);
    });

    it('should return false when ~/.cursor directory does not exist', async () => {
      await fs.rm(join(homeDir, '.cursor'), { recursive: true, force: true });

      expect(await cursorAgent.isInstalled()).toBe(false);
    });
  });

  describe('updateProjectConfiguration', () => {
    it('should copy active skill instructions into .cursor/rules as managed .mdc files', async () => {
      await writeSkill('skill-a', '# Skill A\n\nUse strict TypeScript.');
      await writeSkill('skill-b', '# Skill B\n\nPrefer focused tests.');

      await cursorAgent.updateProjectConfiguration(['skill-a', 'skill-b'], projectDir);

      const rulesDir = join(projectDir, '.cursor', 'rules');
      const skillAPath = join(rulesDir, 'skill-a.mdc');
      const skillBPath = join(rulesDir, 'skill-b.mdc');
      const skillAContent = await fs.readFile(skillAPath, 'utf-8');
      const skillBContent = await fs.readFile(skillBPath, 'utf-8');
      const skillAStats = await fs.lstat(skillAPath);

      expect(skillAStats.isSymbolicLink()).toBe(false);
      expect(skillAContent).toContain('alwaysApply: true');
      expect(skillAContent).toContain('<!-- AI_SKILLS_CURSOR_MANAGED: skill-a -->');
      expect(skillAContent).toContain('# Skill A');
      expect(skillAContent).toContain('Use strict TypeScript.');
      expect(skillBContent).toContain('<!-- AI_SKILLS_CURSOR_MANAGED: skill-b -->');
      expect(skillBContent).toContain('Prefer focused tests.');
    });

    it('should read active skills from the central config directory before cursor symlinks exist', async () => {
      const centralSkillDir = join(homeDir, '.config', 'ai-skills', 'skill-a');
      await fs.mkdir(centralSkillDir, { recursive: true });
      await fs.writeFile(join(centralSkillDir, 'SKILL.md'), '# Central Skill A\n');

      await cursorAgent.updateProjectConfiguration(['skill-a'], projectDir);

      const content = await fs.readFile(join(projectDir, '.cursor', 'rules', 'skill-a.mdc'), 'utf-8');

      expect(content).toContain('# Central Skill A');
    });

    it('should update managed .mdc files when source skill content changes', async () => {
      await writeSkill('skill-a', '# Skill A\n\nOld content.');
      await cursorAgent.updateProjectConfiguration(['skill-a'], projectDir);

      await writeSkill('skill-a', '# Skill A\n\nNew content.');
      await cursorAgent.updateProjectConfiguration(['skill-a'], projectDir);

      const content = await fs.readFile(join(projectDir, '.cursor', 'rules', 'skill-a.mdc'), 'utf-8');

      expect(content).toContain('New content.');
      expect(content).not.toContain('Old content.');
    });

    it('should remove deactivated managed rules without deleting user rules', async () => {
      await writeSkill('skill-a', '# Skill A\n\nActive content.');
      await writeSkill('skill-b', '# Skill B\n\nInactive content.');
      await cursorAgent.updateProjectConfiguration(['skill-a', 'skill-b'], projectDir);

      const rulesDir = join(projectDir, '.cursor', 'rules');
      await fs.writeFile(join(rulesDir, 'custom.mdc'), '# User owned Cursor rule\n');

      await cursorAgent.updateProjectConfiguration(['skill-a'], projectDir);

      await expect(fs.access(join(rulesDir, 'skill-b.mdc'))).rejects.toThrow();
      await expect(fs.access(join(rulesDir, 'skill-a.mdc'))).resolves.toBeUndefined();
      await expect(fs.access(join(rulesDir, 'custom.mdc'))).resolves.toBeUndefined();
    });

    it('should not overwrite an existing user-owned rule with the same name', async () => {
      await writeSkill('skill-a', '# Skill A\n\nManaged content.');

      const rulesDir = join(projectDir, '.cursor', 'rules');
      await fs.mkdir(rulesDir, { recursive: true });
      await fs.writeFile(join(rulesDir, 'skill-a.mdc'), '# User owned skill-a rule\n');

      await cursorAgent.updateProjectConfiguration(['skill-a'], projectDir);

      const content = await fs.readFile(join(rulesDir, 'skill-a.mdc'), 'utf-8');

      expect(content).toBe('# User owned skill-a rule\n');
    });

    it('should support skill folders whose primary instructions are named after the skill', async () => {
      await fs.mkdir(join(cursorSkillsDir, 'skill-a'), { recursive: true });
      await fs.writeFile(join(cursorSkillsDir, 'skill-a', 'skill-a.md'), '# Skill A named file\n');

      await cursorAgent.updateProjectConfiguration(['skill-a'], projectDir);

      const content = await fs.readFile(join(projectDir, '.cursor', 'rules', 'skill-a.mdc'), 'utf-8');

      expect(content).toContain('# Skill A named file');
    });
  });

  async function writeSkill(name: string, content: string): Promise<void> {
    const skillDir = join(cursorSkillsDir, name);
    await fs.mkdir(skillDir, { recursive: true });
    await fs.writeFile(join(skillDir, 'SKILL.md'), content);
  }
});
