import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { promises as fs } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import * as os from 'os';

// Mock os.homedir BEFORE importing anything that uses it
jest.mock('os', () => ({
  ...jest.requireActual('os') as any,
  homedir: jest.fn()
}));

import { PiAgent } from '../pi.js';

describe('PiAgent', () => {
  let tempDir: string;
  let piAgent: PiAgent;
  let homeDir: string;
  let projectDir: string;

  beforeEach(async () => {
    tempDir = join(tmpdir(), `ai-skills-pi-test-${Date.now()}`);
    await fs.mkdir(tempDir, { recursive: true });

    homeDir = join(tempDir, 'home');
    projectDir = join(tempDir, 'project');

    await fs.mkdir(homeDir, { recursive: true });
    await fs.mkdir(projectDir, { recursive: true });

    (os.homedir as jest.Mock).mockReturnValue(homeDir);

    piAgent = new PiAgent(homeDir);
  });

  afterEach(async () => {
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  describe('basic properties', () => {
    it('should have id "pi"', () => {
      expect(piAgent.id).toBe('pi');
    });

    it('should have name "Pi"', () => {
      expect(piAgent.name).toBe('Pi');
    });
  });

  describe('getSkillsPath', () => {
    it('should return ~/.pi/agent/skills/', () => {
      const expected = join(homeDir, '.pi', 'agent', 'skills');
      expect(piAgent.getSkillsPath()).toBe(expected);
    });
  });

  describe('isInstalled', () => {
    it('should return true when ~/.pi/ directory exists', async () => {
      await fs.mkdir(join(homeDir, '.pi'), { recursive: true });
      expect(await piAgent.isInstalled()).toBe(true);
    });

    it('should return false when ~/.pi/ directory does not exist', async () => {
      expect(await piAgent.isInstalled()).toBe(false);
    });
  });

  describe('updateProjectConfiguration', () => {
    it('should create AGENTS.md in the project root if it does not exist', async () => {
      const skills = ['skill-a', 'skill-b'];

      await piAgent.updateProjectConfiguration(skills, projectDir);

      const configPath = join(projectDir, 'AGENTS.md');
      const content = await fs.readFile(configPath, 'utf-8');

      expect(content).toContain('<!-- SKILLS_ACTIVATION_START -->');
      expect(content).toContain('<!-- SKILLS_ACTIVATION_END -->');
      expect(content).toContain('`skill-a`');
      expect(content).toContain('`skill-b`');
    });

    it('should update existing AGENTS.md without losing other content', async () => {
      const configPath = join(projectDir, 'AGENTS.md');

      const initialContent = `# Project Agents

This is custom content that should be preserved.

## Custom Section
More content here.
`;
      await fs.writeFile(configPath, initialContent);

      const skills = ['skill-a'];
      await piAgent.updateProjectConfiguration(skills, projectDir);

      const content = await fs.readFile(configPath, 'utf-8');

      expect(content).toContain('This is custom content that should be preserved.');
      expect(content).toContain('## Custom Section');
      expect(content).toContain('More content here.');
      expect(content).toContain('<!-- SKILLS_ACTIVATION_START -->');
      expect(content).toContain('`skill-a`');
    });

    it('should replace existing skills block when updating', async () => {
      const configPath = join(projectDir, 'AGENTS.md');

      const initialContent = `<!-- SKILLS_ACTIVATION_START -->
# Project Instructions
- Active global skills: \`old-skill-1\`, \`old-skill-2\`.
<!-- SKILLS_ACTIVATION_END -->
`;
      await fs.writeFile(configPath, initialContent);

      const skills = ['new-skill-1', 'new-skill-2'];
      await piAgent.updateProjectConfiguration(skills, projectDir);

      const content = await fs.readFile(configPath, 'utf-8');

      expect(content).toContain('`new-skill-1`');
      expect(content).toContain('`new-skill-2`');
      expect(content).not.toContain('`old-skill-1`');
      expect(content).not.toContain('`old-skill-2`');

      const startCount = (content.match(/<!-- SKILLS_ACTIVATION_START -->/g) || []).length;
      const endCount = (content.match(/<!-- SKILLS_ACTIVATION_END -->/g) || []).length;
      expect(startCount).toBe(1);
      expect(endCount).toBe(1);
    });

    it('should handle multiple consecutive updates correctly', async () => {
      const configPath = join(projectDir, 'AGENTS.md');

      // First activation
      await piAgent.updateProjectConfiguration(['skill-a'], projectDir);
      let content = await fs.readFile(configPath, 'utf-8');
      expect(content).toContain('`skill-a`');
      expect(content).not.toContain('`skill-b`');

      // Second activation with different skills
      await piAgent.updateProjectConfiguration(['skill-b', 'skill-c'], projectDir);
      content = await fs.readFile(configPath, 'utf-8');
      expect(content).toContain('`skill-b`');
      expect(content).toContain('`skill-c`');
      expect(content).not.toContain('`skill-a`');

      // Third activation with empty skills
      await piAgent.updateProjectConfiguration([], projectDir);
      content = await fs.readFile(configPath, 'utf-8');
      expect(content).toContain('<!-- No skills activated -->');
      expect(content).not.toContain('`skill-b`');
      expect(content).not.toContain('`skill-c`');

      const startCount = (content.match(/<!-- SKILLS_ACTIVATION_START -->/g) || []).length;
      const endCount = (content.match(/<!-- SKILLS_ACTIVATION_END -->/g) || []).length;
      expect(startCount).toBe(1);
      expect(endCount).toBe(1);
    });

    it('should handle empty skills list', async () => {
      const skills: string[] = [];

      await piAgent.updateProjectConfiguration(skills, projectDir);

      const configPath = join(projectDir, 'AGENTS.md');
      const content = await fs.readFile(configPath, 'utf-8');

      expect(content).toContain('<!-- SKILLS_ACTIVATION_START -->');
      expect(content).toContain('<!-- No skills activated -->');
      expect(content).toContain('<!-- SKILLS_ACTIVATION_END -->');
    });

    it('should preserve content before and after skills block', async () => {
      const configPath = join(projectDir, 'AGENTS.md');

      const initialContent = `# Agent Configuration

Content before the skills block.

<!-- SKILLS_ACTIVATION_START -->
# Project Instructions
- Active global skills: \`old-skill\`.
<!-- SKILLS_ACTIVATION_END -->

Content after the skills block.
`;
      await fs.writeFile(configPath, initialContent);

      const skills = ['new-skill'];
      await piAgent.updateProjectConfiguration(skills, projectDir);

      const content = await fs.readFile(configPath, 'utf-8');

      expect(content).toContain('Content before the skills block.');
      expect(content).toContain('Content after the skills block.');
      expect(content).toContain('`new-skill`');
      expect(content).not.toContain('`old-skill`');
    });

    it('should handle malformed existing file (missing end guard)', async () => {
      const configPath = join(projectDir, 'AGENTS.md');

      const initialContent = `# Agent Configuration

<!-- SKILLS_ACTIVATION_START -->
# Project Instructions
- Active global skills: \`old-skill\`.

Some other content without proper closing.
`;
      await fs.writeFile(configPath, initialContent);

      const skills = ['new-skill'];
      await piAgent.updateProjectConfiguration(skills, projectDir);

      const content = await fs.readFile(configPath, 'utf-8');

      expect(content).toContain('`new-skill`');
      expect(content).toContain('<!-- SKILLS_ACTIVATION_END -->');
    });
  });
});
