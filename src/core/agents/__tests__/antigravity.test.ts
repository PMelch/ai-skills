import { join } from 'path';
import { promises as fs } from 'fs';
import { AntigravityAgent } from '../antigravity.js';

// Mock fs
jest.mock('fs', () => ({
  promises: {
    mkdir: jest.fn(),
    readdir: jest.fn(),
    lstat: jest.fn(),
    readlink: jest.fn(),
    unlink: jest.fn(),
    symlink: jest.fn(),
    access: jest.fn(),
    readFile: jest.fn(),
    writeFile: jest.fn(),
  }
}));

describe('AntigravityAgent', () => {
  let agent: AntigravityAgent;
  const mockHomeDir = '/home/user';
  const mockProjectRoot = '/project/root';

  beforeEach(() => {
    agent = new AntigravityAgent(mockHomeDir);
    jest.clearAllMocks();
  });

  describe('metadata', () => {
    it('should have correct id and name', () => {
      expect(agent.id).toBe('antigravity');
      expect(agent.name).toBe('Antigravity');
    });
  });

  describe('getSkillsPath', () => {
    it('should return correct skills path', () => {
      expect(agent.getSkillsPath()).toBe(join(mockHomeDir, '.antigravity', 'skills'));
    });
  });

  describe('updateProjectConfiguration', () => {
    it('should create .agent/rules directory', async () => {
      (fs.readdir as jest.Mock).mockResolvedValue([]);
      
      await agent.updateProjectConfiguration([], mockProjectRoot);

      expect(fs.mkdir).toHaveBeenCalledWith(
        join(mockProjectRoot, '.agent', 'rules'),
        { recursive: true }
      );
    });

    it('should create symlinks for new skills', async () => {
      const skills = ['skill-1', 'skill-2'];
      (fs.readdir as jest.Mock).mockResolvedValue([]);
      (fs.lstat as jest.Mock).mockRejectedValue(new Error('ENOENT')); // File doesn't exist

      await agent.updateProjectConfiguration(skills, mockProjectRoot);

      const rulesDir = join(mockProjectRoot, '.agent', 'rules');
      const skillsDir = join(mockHomeDir, '.antigravity', 'skills');

      expect(fs.symlink).toHaveBeenCalledTimes(2);
      expect(fs.symlink).toHaveBeenCalledWith(
        join(skillsDir, 'skill-1'),
        join(rulesDir, 'skill-1'),
        'dir'
      );
      expect(fs.symlink).toHaveBeenCalledWith(
        join(skillsDir, 'skill-2'),
        join(rulesDir, 'skill-2'),
        'dir'
      );
    });

    it('should remove symlinks for deactivated skills', async () => {
      const activeSkills = ['skill-1'];
      // Mock existing directory entries
      const mockEntries = [
        { name: 'skill-1', isSymbolicLink: () => true },
        { name: 'skill-2', isSymbolicLink: () => true }, // Should be removed
        { name: 'not-a-symlink', isSymbolicLink: () => false }
      ];
      
      (fs.readdir as jest.Mock).mockResolvedValue(mockEntries);
      
      // Mock readlink to verify it's our symlink
      (fs.readlink as jest.Mock).mockImplementation((path) => {
          if (path.includes('skill-1')) {
               return Promise.resolve(join(mockHomeDir, '.antigravity', 'skills', 'skill-1'));
          }
          if (path.includes('skill-2')) {
               return Promise.resolve(join(mockHomeDir, '.antigravity', 'skills', 'skill-2'));
          }
          return Promise.resolve('');
      });

      await agent.updateProjectConfiguration(activeSkills, mockProjectRoot);

      const rulesDir = join(mockProjectRoot, '.agent', 'rules');
      
      // Should remove skill-2
      expect(fs.unlink).toHaveBeenCalledWith(join(rulesDir, 'skill-2'));
      
      // Should NOT remove skill-1 or not-a-symlink
      expect(fs.unlink).not.toHaveBeenCalledWith(join(rulesDir, 'skill-1'));
      expect(fs.unlink).not.toHaveBeenCalledWith(join(rulesDir, 'not-a-symlink'));
    });
  });
});
