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

import { CopilotAgent } from '../copilot.js';

describe('CopilotAgent', () => {
  let tempDir: string;
  let copilotAgent: CopilotAgent;
  let homeDir: string;
  let projectDir: string;

  beforeEach(async () => {
    // Create temporary directory for testing
    tempDir = join(tmpdir(), `ai-skills-copilot-test-${Date.now()}`);
    await fs.mkdir(tempDir, { recursive: true });

    homeDir = join(tempDir, 'home');
    projectDir = join(tempDir, 'project');
    
    await fs.mkdir(homeDir, { recursive: true });
    await fs.mkdir(projectDir, { recursive: true });

    // Mock homedir to return our temp home
    (os.homedir as jest.Mock).mockReturnValue(homeDir);

    copilotAgent = new CopilotAgent(homeDir);
  });

  afterEach(async () => {
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  describe('updateProjectConfiguration', () => {
    it('should create .github/copilot-instructions.md if it does not exist', async () => {
      const skills = ['skill-a', 'skill-b'];
      
      await copilotAgent.updateProjectConfiguration(skills, projectDir);
      
      const configPath = join(projectDir, '.github', 'copilot-instructions.md');
      const content = await fs.readFile(configPath, 'utf-8');
      
      expect(content).toContain('# Copilot Instructions');
      expect(content).toContain('<!-- SKILLS_ACTIVATION_START -->');
      expect(content).toContain('<!-- SKILLS_ACTIVATION_END -->');
      expect(content).toContain('- @skill-a');
      expect(content).toContain('- @skill-b');
      expect(content).toContain('When working in this repo, always enable these skills:');
    });

    it('should update existing file without losing other content', async () => {
      const configPath = join(projectDir, '.github', 'copilot-instructions.md');
      await fs.mkdir(join(projectDir, '.github'), { recursive: true });
      
      const initialContent = `# Copilot Instructions

This is some custom content that should be preserved.

## Custom Section
More content here.
`;
      await fs.writeFile(configPath, initialContent);
      
      const skills = ['skill-a'];
      await copilotAgent.updateProjectConfiguration(skills, projectDir);
      
      const content = await fs.readFile(configPath, 'utf-8');
      
      expect(content).toContain('This is some custom content that should be preserved.');
      expect(content).toContain('## Custom Section');
      expect(content).toContain('More content here.');
      expect(content).toContain('<!-- SKILLS_ACTIVATION_START -->');
      expect(content).toContain('- @skill-a');
    });

    it('should replace existing skills block when updating', async () => {
      const configPath = join(projectDir, '.github', 'copilot-instructions.md');
      await fs.mkdir(join(projectDir, '.github'), { recursive: true });
      
      const initialContent = `# Copilot Instructions

<!-- SKILLS_ACTIVATION_START -->
When working in this repo, always enable these skills:
- @old-skill-1
- @old-skill-2
<!-- SKILLS_ACTIVATION_END -->
`;
      await fs.writeFile(configPath, initialContent);
      
      const skills = ['new-skill-1', 'new-skill-2'];
      await copilotAgent.updateProjectConfiguration(skills, projectDir);
      
      const content = await fs.readFile(configPath, 'utf-8');
      
      expect(content).toContain('- @new-skill-1');
      expect(content).toContain('- @new-skill-2');
      expect(content).not.toContain('- @old-skill-1');
      expect(content).not.toContain('- @old-skill-2');
      
      // Should only have one pair of guard comments
      const startCount = (content.match(/<!-- SKILLS_ACTIVATION_START -->/g) || []).length;
      const endCount = (content.match(/<!-- SKILLS_ACTIVATION_END -->/g) || []).length;
      expect(startCount).toBe(1);
      expect(endCount).toBe(1);
    });

    it('should handle multiple consecutive updates correctly', async () => {
      const configPath = join(projectDir, '.github', 'copilot-instructions.md');
      
      // First activation
      await copilotAgent.updateProjectConfiguration(['skill-a'], projectDir);
      let content = await fs.readFile(configPath, 'utf-8');
      expect(content).toContain('- @skill-a');
      expect(content).not.toContain('- @skill-b');
      
      // Second activation with different skills
      await copilotAgent.updateProjectConfiguration(['skill-b', 'skill-c'], projectDir);
      content = await fs.readFile(configPath, 'utf-8');
      expect(content).toContain('- @skill-b');
      expect(content).toContain('- @skill-c');
      expect(content).not.toContain('- @skill-a');
      
      // Third activation with empty skills
      await copilotAgent.updateProjectConfiguration([], projectDir);
      content = await fs.readFile(configPath, 'utf-8');
      expect(content).toContain('<!-- No skills activated -->');
      expect(content).not.toContain('- @skill-b');
      expect(content).not.toContain('- @skill-c');
      
      // Should still only have one pair of guard comments
      const startCount = (content.match(/<!-- SKILLS_ACTIVATION_START -->/g) || []).length;
      const endCount = (content.match(/<!-- SKILLS_ACTIVATION_END -->/g) || []).length;
      expect(startCount).toBe(1);
      expect(endCount).toBe(1);
    });

    it('should handle empty skills list', async () => {
      const skills: string[] = [];
      
      await copilotAgent.updateProjectConfiguration(skills, projectDir);
      
      const configPath = join(projectDir, '.github', 'copilot-instructions.md');
      const content = await fs.readFile(configPath, 'utf-8');
      
      expect(content).toContain('<!-- SKILLS_ACTIVATION_START -->');
      expect(content).toContain('<!-- No skills activated -->');
      expect(content).toContain('<!-- SKILLS_ACTIVATION_END -->');
    });

    it('should preserve content before and after skills block', async () => {
      const configPath = join(projectDir, '.github', 'copilot-instructions.md');
      await fs.mkdir(join(projectDir, '.github'), { recursive: true });
      
      const initialContent = `# Copilot Instructions

Content before the skills block.

<!-- SKILLS_ACTIVATION_START -->
When working in this repo, always enable these skills:
- @old-skill
<!-- SKILLS_ACTIVATION_END -->

Content after the skills block.
`;
      await fs.writeFile(configPath, initialContent);
      
      const skills = ['new-skill'];
      await copilotAgent.updateProjectConfiguration(skills, projectDir);
      
      const content = await fs.readFile(configPath, 'utf-8');
      
      expect(content).toContain('Content before the skills block.');
      expect(content).toContain('Content after the skills block.');
      expect(content).toContain('- @new-skill');
      expect(content).not.toContain('- @old-skill');
    });

    it('should create .github directory if it does not exist', async () => {
      const githubDir = join(projectDir, '.github');
      
      // Verify directory doesn't exist
      await expect(fs.access(githubDir)).rejects.toThrow();
      
      await copilotAgent.updateProjectConfiguration(['skill-a'], projectDir);
      
      // Verify directory was created
      const stats = await fs.stat(githubDir);
      expect(stats.isDirectory()).toBe(true);
    });

    it('should handle malformed existing file (missing end guard)', async () => {
      const configPath = join(projectDir, '.github', 'copilot-instructions.md');
      await fs.mkdir(join(projectDir, '.github'), { recursive: true });
      
      // File with start guard but no end guard
      const initialContent = `# Copilot Instructions

<!-- SKILLS_ACTIVATION_START -->
When working in this repo, always enable these skills:
- @old-skill

Some other content without proper closing.
`;
      await fs.writeFile(configPath, initialContent);
      
      const skills = ['new-skill'];
      await copilotAgent.updateProjectConfiguration(skills, projectDir);
      
      const content = await fs.readFile(configPath, 'utf-8');
      
      // Should add new block at the end since existing one is malformed
      expect(content).toContain('- @new-skill');
      expect(content).toContain('<!-- SKILLS_ACTIVATION_END -->');
    });
  });
});
