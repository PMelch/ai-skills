import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { promises as fs } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { SkillManager } from '../skills.js';
import { ConfigManager } from '../config.js';

describe('SkillManager', () => {
  let tempDir: string;
  let tempProjectDir: string;
  let skillManager: SkillManager;
  let originalHome: string | undefined;
  let originalCwd: string;

  beforeEach(async () => {
    // Create temporary directories for testing
    tempDir = join(tmpdir(), `ai-skills-test-${Date.now()}`);
    tempProjectDir = join(tempDir, 'project');
    await fs.mkdir(tempProjectDir, { recursive: true });

    // Mock HOME directory
    originalHome = process.env.HOME;
    process.env.HOME = tempDir;

    // Change to temp project directory
    originalCwd = process.cwd();
    process.chdir(tempProjectDir);

    // Initialize config
    const configManager = new ConfigManager();
    await configManager.initialize(['claude']);

    skillManager = new SkillManager();
  });

  afterEach(async () => {
    // Restore original directory
    process.chdir(originalCwd);

    // Restore HOME
    if (originalHome) {
      process.env.HOME = originalHome;
    }

    // Clean up temp directory
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  describe('getAvailableSkills', () => {
    it('should list all skill folders', async () => {
      const configManager = new ConfigManager();
      const centralDir = configManager.getConfigDir();

      // Create test skill folders
      await fs.mkdir(join(centralDir, 'test-skill-1'), { recursive: true });
      await fs.mkdir(join(centralDir, 'test-skill-2'), { recursive: true });

      const skills = await skillManager.getAvailableSkills();
      expect(skills.filter(s => s.startsWith('test-skill'))).toHaveLength(2);
      expect(skills).toContain('test-skill-1');
      expect(skills).toContain('test-skill-2');
    });

    it('should ignore hidden folders', async () => {
      const configManager = new ConfigManager();
      const centralDir = configManager.getConfigDir();

      await fs.mkdir(join(centralDir, 'test-visible'), { recursive: true });
      await fs.mkdir(join(centralDir, '.test-hidden'), { recursive: true });

      const skills = await skillManager.getAvailableSkills();
      expect(skills).toContain('test-visible');
      expect(skills).not.toContain('.test-hidden');
    });

    it('should return sorted list', async () => {
      const configManager = new ConfigManager();
      const centralDir = configManager.getConfigDir();

      await fs.mkdir(join(centralDir, 'test-aa-zebra'), { recursive: true });
      await fs.mkdir(join(centralDir, 'test-aa-alpha'), { recursive: true });
      await fs.mkdir(join(centralDir, 'test-aa-beta'), { recursive: true });

      const skills = await skillManager.getAvailableSkills();
      const testSkills = skills.filter(s => s.startsWith('test-aa-'));
      expect(testSkills).toEqual(['test-aa-alpha', 'test-aa-beta', 'test-aa-zebra']);
    });
  });

  describe('getActiveSkills', () => {
    it('should return empty array when no config exists', async () => {
      const skills = await skillManager.getActiveSkills();
      expect(skills).toEqual([]);
    });

    it('should return skills from project config', async () => {
      await skillManager.saveProjectConfig(['skill-1', 'skill-2'], ['claude']);
      
      const skills = await skillManager.getActiveSkills();
      expect(skills).toEqual(['skill-1', 'skill-2']);
    });
  });

  describe('saveProjectConfig', () => {
    it('should create project config file', async () => {
      const configPath = join(process.cwd(), '.ai-skills.json');
      
      // Ensure file doesn't exist
      try {
        await fs.unlink(configPath);
      } catch {
        // Ignore if doesn't exist
      }
      
      await skillManager.saveProjectConfig(['skill-1'], ['claude']);
      
      const stats = await fs.stat(configPath);
      expect(stats.isFile()).toBe(true);
      
      // Clean up
      try {
        await fs.unlink(configPath);
      } catch {
        // Ignore cleanup errors
      }
    });

    it('should save correct structure', async () => {
      const skills = ['skill-1', 'skill-2'];
      const agents = ['claude', 'gemini'];
      const configPath = join(process.cwd(), '.ai-skills.json');
      
      await skillManager.saveProjectConfig(skills, agents);
      
      const content = await fs.readFile(configPath, 'utf-8');
      const config = JSON.parse(content);
      
      expect(config.skills).toEqual(skills);
      expect(config.agents).toEqual(agents);
      expect(config.updatedAt).toBeDefined();
      
      // Clean up
      try {
        await fs.unlink(configPath);
      } catch {
        // Ignore cleanup errors
      }
    });

    it('should handle empty skills array', async () => {
      const configPath = join(process.cwd(), '.ai-skills.json');
      
      await skillManager.saveProjectConfig([], ['claude']);
      
      const skills = await skillManager.getActiveSkills();
      expect(skills).toEqual([]);
      
      // Clean up
      try {
        await fs.unlink(configPath);
      } catch {
        // Ignore cleanup errors
      }
    });

    it('should overwrite existing config', async () => {
      const configPath = join(process.cwd(), '.ai-skills.json');
      
      await skillManager.saveProjectConfig(['skill-1'], ['claude']);
      await skillManager.saveProjectConfig(['skill-2'], ['gemini']);
      
      const skills = await skillManager.getActiveSkills();
      expect(skills).toEqual(['skill-2']);
      
      // Clean up
      try {
        await fs.unlink(configPath);
      } catch {
        // Ignore cleanup errors
      }
    });
  });
});
