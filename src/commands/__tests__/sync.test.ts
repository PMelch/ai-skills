import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { sync } from '../sync.js';
import { ConfigManager } from '../../core/config.js';
import { promises as fs } from 'fs';
import { getAgentInfo } from '../../core/agents.js';

// Mocks
jest.mock('fs', () => ({
  promises: {
    readdir: jest.fn(),
    mkdir: jest.fn(),
    lstat: jest.fn(),
    readlink: jest.fn(),
    unlink: jest.fn(),
    symlink: jest.fn(),
    access: jest.fn(),
  }
}));

jest.mock('../../core/config.js');
jest.mock('../../core/agents.js', () => ({
  AgentManager: jest.fn(),
  getAgentInfo: jest.fn(),
}));

jest.mock('ora', () => () => ({
  start: jest.fn().mockReturnThis(),
  fail: jest.fn().mockReturnThis(),
  succeed: jest.fn().mockReturnThis(),
}));

jest.mock('chalk', () => ({
  bold: { cyan: (s: string) => s },
  yellow: (s: string) => s,
  green: (s: string) => s,
  dim: (s: string) => s,
  red: (s: string) => s,
}));

// Helper types
interface Dirent {
  name: string;
  isDirectory: () => boolean;
  isSymbolicLink: () => boolean;
}

const createDirent = (name: string, isDir = false, isSym = false): Dirent => ({
  name,
  isDirectory: () => isDir,
  isSymbolicLink: () => isSym,
});

describe('Sync Command', () => {
  const mockConfigManager = {
    isInitialized: jest.fn<() => Promise<boolean>>(),
    getConfiguredAgents: jest.fn<() => Promise<any[]>>(),
    getConfigDir: jest.fn<() => string>(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    (ConfigManager as unknown as jest.Mock).mockImplementation(() => mockConfigManager);
    
    // Default success path
    mockConfigManager.isInitialized.mockResolvedValue(true);
    mockConfigManager.getConfiguredAgents.mockResolvedValue([{ id: 'claude', name: 'Claude' }]);
    mockConfigManager.getConfigDir.mockReturnValue('/central/skills');
    
    (getAgentInfo as jest.Mock).mockReturnValue({
      skillsPath: '/agent/skills',
    });

    (fs.readdir as unknown as any).mockResolvedValue([]);
    (fs.mkdir as unknown as any).mockResolvedValue(undefined);
  });

  it('should fail if not initialized', async () => {
    mockConfigManager.isInitialized.mockResolvedValue(false);
    
    await sync();
    
    expect(mockConfigManager.isInitialized).toHaveBeenCalled();
    expect(fs.readdir).not.toHaveBeenCalled();
  });

  it('should warn if no agents configured', async () => {
    mockConfigManager.getConfiguredAgents.mockResolvedValue([]);
    
    await sync();
    
    expect(fs.readdir).not.toHaveBeenCalled();
  });

  it('should create new symlinks for added skills', async () => {
    // Central skills
    (fs.readdir as unknown as any).mockImplementation(async (path: string) => {
      if (path === '/central/skills') {
        return [createDirent('skill-1', true)];
      }
      if (path === '/agent/skills') {
        return [];
      }
      return [];
    });

    // Mock lstat to fail (simulate symlink doesn't exist)
    (fs.lstat as unknown as any).mockRejectedValue(new Error('ENOENT'));

    await sync();

    expect(fs.symlink).toHaveBeenCalledWith(
      '/central/skills/skill-1',
      '/agent/skills/skill-1',
      'dir'
    );
  });

  it('should remove orphaned symlinks', async () => {
    // Central skills (empty)
    (fs.readdir as unknown as any).mockImplementation(async (path: string) => {
      if (path === '/central/skills') {
        return [];
      }
      if (path === '/agent/skills') {
        return [createDirent('skill-1', false, true)]; // is symlink
      }
      return [];
    });

    // Mock lstat to succeed and identify as symlink
    (fs.lstat as unknown as any).mockResolvedValue({
      isSymbolicLink: () => true
    });

    // Mock readlink to point to central dir
    (fs.readlink as unknown as any).mockResolvedValue('/central/skills/skill-1');

    await sync();

    expect(fs.unlink).toHaveBeenCalledWith('/agent/skills/skill-1');
  });

  it('should keep valid symlinks', async () => {
    // Central skills has skill-1
    (fs.readdir as unknown as any).mockImplementation(async (path: string) => {
      if (path === '/central/skills') {
        return [createDirent('skill-1', true)];
      }
      if (path === '/agent/skills') {
        return [createDirent('skill-1', false, true)];
      }
      return [];
    });

    (fs.lstat as unknown as any).mockResolvedValue({
      isSymbolicLink: () => true
    });

    (fs.readlink as unknown as any).mockResolvedValue('/central/skills/skill-1');
    (fs.access as unknown as any).mockResolvedValue(undefined); // Target exists

    await sync();

    expect(fs.unlink).not.toHaveBeenCalled();
    expect(fs.symlink).not.toHaveBeenCalled();
  });
});
