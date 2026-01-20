import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { promises as fs } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { AgentManager, getAgentInfo } from '../agents.js';
import { ConfigManager } from '../config.js';

describe('AgentManager', () => {
  let tempDir: string;
  let agentManager: AgentManager;
  let originalHome: string | undefined;

  beforeEach(async () => {
    // Create temporary directory for testing
    tempDir = join(tmpdir(), `ai-skills-test-${Date.now()}`);
    await fs.mkdir(tempDir, { recursive: true });

    // Mock HOME directory
    originalHome = process.env.HOME;
    process.env.HOME = tempDir;

    agentManager = new AgentManager();
  });

  afterEach(async () => {
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

  describe('getAgentInfo', () => {
    it('should return Claude agent info', () => {
      const agent = getAgentInfo('claude');
      expect(agent).toMatchObject({
        id: 'claude',
        name: 'Claude',
        icon: '🤖',
      });
      expect(agent.skillsPath).toContain('.claude');
      expect(agent.skillsPath).toContain('skills');
    });

    it('should return Gemini agent info', () => {
      const agent = getAgentInfo('gemini');
      expect(agent).toMatchObject({
        id: 'gemini',
        name: 'Gemini',
        icon: '✨',
      });
      expect(agent.skillsPath).toContain('.gemini');
      expect(agent.skillsPath).toContain('skills');
    });

    it('should throw error for unknown agent', () => {
      expect(() => getAgentInfo('unknown')).toThrow('Unknown agent: unknown');
    });
  });

  describe('detectAgents', () => {
    it('should detect Claude when directory exists', async () => {
      await fs.mkdir(join(tempDir, '.claude'), { recursive: true });
      
      const agents = await agentManager.detectAgents();
      const claudeAgent = agents.find(a => a.id === 'claude');
      expect(claudeAgent).toBeDefined();
      expect(claudeAgent?.id).toBe('claude');
    });

    it('should detect Gemini when directory exists', async () => {
      await fs.mkdir(join(tempDir, '.gemini'), { recursive: true });
      
      const agents = await agentManager.detectAgents();
      const geminiAgent = agents.find(a => a.id === 'gemini');
      expect(geminiAgent).toBeDefined();
      expect(geminiAgent?.id).toBe('gemini');
    });

    it('should detect multiple agents', async () => {
      await fs.mkdir(join(tempDir, '.claude'), { recursive: true });
      await fs.mkdir(join(tempDir, '.gemini'), { recursive: true });
      
      const agents = await agentManager.detectAgents();
      const testAgents = agents.filter(a => a.id === 'claude' || a.id === 'gemini');
      expect(testAgents.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('createSymlinks', () => {
    beforeEach(async () => {
      // Initialize config and create test skills
      const configManager = new ConfigManager();
      await configManager.initialize(['claude']);
      
      const centralDir = configManager.getConfigDir();
      await fs.mkdir(join(centralDir, 'skill-1'), { recursive: true });
      await fs.mkdir(join(centralDir, 'skill-2'), { recursive: true });
    });

    it('should create agent skills directory if not exists', async () => {
      await agentManager.createSymlinks('claude');
      
      const agentInfo = getAgentInfo('claude');
      const stats = await fs.stat(agentInfo.skillsPath);
      expect(stats.isDirectory()).toBe(true);
    });

    it('should create symlinks for all skills', async () => {
      await agentManager.createSymlinks('claude');
      
      const agentInfo = getAgentInfo('claude');
      const skill1Path = join(agentInfo.skillsPath, 'skill-1');
      const skill2Path = join(agentInfo.skillsPath, 'skill-2');
      
      const stats1 = await fs.lstat(skill1Path);
      const stats2 = await fs.lstat(skill2Path);
      
      expect(stats1.isSymbolicLink()).toBe(true);
      expect(stats2.isSymbolicLink()).toBe(true);
    });

    it('should recreate symlink if it already exists', async () => {
      await agentManager.createSymlinks('claude');
      
      // Run again
      await agentManager.createSymlinks('claude');
      
      const agentInfo = getAgentInfo('claude');
      const skill1Path = join(agentInfo.skillsPath, 'skill-1');
      const stats = await fs.lstat(skill1Path);
      
      expect(stats.isSymbolicLink()).toBe(true);
    });
  });

  describe('activateSkills', () => {
    beforeEach(async () => {
      // Initialize config and create test skills
      const configManager = new ConfigManager();
      await configManager.initialize(['claude']);
      
      const centralDir = configManager.getConfigDir();
      await fs.mkdir(join(centralDir, 'skill-1'), { recursive: true });
      await fs.mkdir(join(centralDir, 'skill-2'), { recursive: true });
      await fs.mkdir(join(centralDir, 'skill-3'), { recursive: true });
    });

    it('should create symlinks for selected skills', async () => {
      await agentManager.activateSkills('claude', ['skill-1', 'skill-2']);
      
      const agentInfo = getAgentInfo('claude');
      const skill1Path = join(agentInfo.skillsPath, 'skill-1');
      const skill2Path = join(agentInfo.skillsPath, 'skill-2');
      
      const stats1 = await fs.lstat(skill1Path);
      const stats2 = await fs.lstat(skill2Path);
      
      expect(stats1.isSymbolicLink()).toBe(true);
      expect(stats2.isSymbolicLink()).toBe(true);
    });

    it('should remove symlinks for unselected skills', async () => {
      // First activate all skills
      await agentManager.activateSkills('claude', ['skill-1', 'skill-2', 'skill-3']);
      
      // Then deactivate skill-3
      await agentManager.activateSkills('claude', ['skill-1', 'skill-2']);
      
      const agentInfo = getAgentInfo('claude');
      const skill3Path = join(agentInfo.skillsPath, 'skill-3');
      
      await expect(fs.access(skill3Path)).rejects.toThrow();
    });

    it('should handle empty skills array', async () => {
      // First create some symlinks
      await agentManager.activateSkills('claude', ['skill-1', 'skill-2']);
      
      // Then deactivate all
      await agentManager.activateSkills('claude', []);
      
      const agentInfo = getAgentInfo('claude');
      const entries = await fs.readdir(agentInfo.skillsPath);
      
      // Filter only our test entries (exclude real skills)
      const testEntries = entries.filter(e => e.startsWith('skill-'));
      expect(testEntries).toEqual([]);
    });

    it('should create directory if it does not exist', async () => {
      const agentInfo = getAgentInfo('claude');
      
      // Ensure directory doesn't exist
      try {
        await fs.rm(agentInfo.skillsPath, { recursive: true });
      } catch {
        // Ignore if doesn't exist
      }
      
      await agentManager.activateSkills('claude', ['skill-1']);
      
      const stats = await fs.stat(agentInfo.skillsPath);
      expect(stats.isDirectory()).toBe(true);
    });
  });
});
