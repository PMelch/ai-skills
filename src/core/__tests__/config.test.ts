import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { promises as fs } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import * as os from 'os';

// Mock os.homedir BEFORE importing ConfigManager
jest.mock('os', () => ({
  ...jest.requireActual('os') as any,
  homedir: jest.fn()
}));

import { ConfigManager } from '../config.js';

describe('ConfigManager', () => {
  let tempDir: string;
  let configManager: ConfigManager;

  beforeEach(async () => {
    // Create temporary directory for testing
    tempDir = join(tmpdir(), `ai-skills-test-${Date.now()}`);
    await fs.mkdir(tempDir, { recursive: true });

    // Mock homedir to return tempDir
    (os.homedir as jest.Mock).mockReturnValue(tempDir);

    configManager = new ConfigManager();
  });

  afterEach(async () => {
    // Clean up temp directory
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  describe('isInitialized', () => {
    it('should return true when config exists', async () => {
      await configManager.initialize(['claude']);
      const initialized = await configManager.isInitialized();
      expect(initialized).toBe(true);
    });
  });

  describe('initialize', () => {
    it('should create config directory', async () => {
      await configManager.initialize(['claude']);
      
      const configDir = configManager.getConfigDir();
      const stats = await fs.stat(configDir);
      expect(stats.isDirectory()).toBe(true);
    });

    it('should create config file with correct structure', async () => {
      const agents = ['claude', 'gemini'];
      await configManager.initialize(agents);

      const config = await configManager.getConfig();
      expect(config.version).toBe('0.1.0');
      expect(config.agents).toEqual(agents);
      expect(config.createdAt).toBeDefined();
      expect(config.updatedAt).toBeDefined();
    });

    it('should handle multiple agents', async () => {
      await configManager.initialize(['claude', 'gemini']);
      
      const config = await configManager.getConfig();
      expect(config.agents.length).toBeGreaterThanOrEqual(2);
      expect(config.agents).toContain('claude');
      expect(config.agents).toContain('gemini');
    });
  });

  describe('getConfig', () => {
    it('should retrieve saved configuration', async () => {
      await configManager.initialize(['claude']);
      
      const config = await configManager.getConfig();
      expect(config).toBeDefined();
      expect(config.agents).toEqual(['claude']);
    });
  });

  describe('updateConfig', () => {
    it('should update agents list', async () => {
      await configManager.initialize(['claude']);
      
      await configManager.updateConfig({ agents: ['claude', 'gemini'] });
      
      const config = await configManager.getConfig();
      expect(config.agents).toEqual(['claude', 'gemini']);
    });

    it('should update updatedAt timestamp', async () => {
      await configManager.initialize(['claude']);
      const originalConfig = await configManager.getConfig();
      
      // Wait a bit to ensure timestamp changes
      await new Promise(resolve => setTimeout(resolve, 10));
      
      await configManager.updateConfig({ agents: ['claude', 'gemini'] });
      
      const updatedConfig = await configManager.getConfig();
      const originalTime = new Date(originalConfig.updatedAt).getTime();
      const updatedTime = new Date(updatedConfig.updatedAt).getTime();
      expect(updatedTime).toBeGreaterThan(originalTime);
    });

    it('should preserve other fields when updating', async () => {
      await configManager.initialize(['claude']);
      const originalConfig = await configManager.getConfig();
      
      await configManager.updateConfig({ agents: ['gemini'] });
      
      const updatedConfig = await configManager.getConfig();
      expect(updatedConfig.version).toBe(originalConfig.version);
      // createdAt timestamp should be similar (within 1 second)
      const originalTime = new Date(originalConfig.createdAt).getTime();
      const updatedCreatedAtTime = new Date(updatedConfig.createdAt).getTime();
      expect(Math.abs(updatedCreatedAtTime - originalTime)).toBeLessThan(1000);
    });
  });

  describe('getConfiguredAgents', () => {
    it('should return agent info for configured agents', async () => {
      await configManager.initialize(['claude']);
      
      const agents = await configManager.getConfiguredAgents();
      expect(agents).toHaveLength(1);
      expect(agents[0]).toMatchObject({
        id: 'claude',
        name: 'Claude',
      });
    });

    it('should handle multiple agents', async () => {
      // Ensure clean config
      const configDir = configManager.getConfigDir();
      try {
        await fs.rm(configDir, { recursive: true, force: true });
      } catch {
        // Ignore
      }
      
      await configManager.initialize(['claude', 'gemini']);
      
      const agents = await configManager.getConfiguredAgents();
      expect(agents.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('getConfigDir', () => {
    it('should return correct config directory path', () => {
      const configDir = configManager.getConfigDir();
      expect(configDir).toContain('.config');
      expect(configDir).toContain('ai-skills');
    });
  });
});
