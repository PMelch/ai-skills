
import { jest, describe, beforeEach, it, expect } from '@jest/globals';
import { GeminiSettingsManager } from '../gemini.js';
import * as fs from 'fs/promises';
import * as path from 'path';

jest.mock('fs/promises', () => ({
    access: jest.fn(),
    readFile: jest.fn(),
    writeFile: jest.fn(),
    mkdir: jest.fn(),
}));

describe('GeminiSettingsManager', () => {
  const mockCwd = '/mock/cwd';
  const settingsPath = path.join(mockCwd, '.gemini/settings.json');
  let manager: GeminiSettingsManager;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(process, 'cwd').mockReturnValue(mockCwd);
    manager = new GeminiSettingsManager();
  });

  it('should create .gemini/settings.json with activeSkills if file does not exist', async () => {
    // Mock access to throw (file not found)
    (fs.access as jest.MockedFunction<typeof fs.access>).mockRejectedValue(Object.assign(new Error('ENOENT'), { code: 'ENOENT' }));
    (fs.readFile as jest.MockedFunction<typeof fs.readFile>).mockRejectedValue(Object.assign(new Error('ENOENT'), { code: 'ENOENT' }));

    await manager.addActiveSkill('skill-1');

    expect(fs.mkdir).toHaveBeenCalledWith(path.join(mockCwd, '.gemini'), { recursive: true });
    expect(fs.writeFile).toHaveBeenCalledWith(
      settingsPath,
      JSON.stringify({ agent: { activeSkills: ['skill-1'] } }, null, 2),
      'utf-8'
    );
  });

  it('should update existing .gemini/settings.json adding new skill', async () => {
    // Mock access to succeed
    (fs.access as jest.MockedFunction<typeof fs.access>).mockResolvedValue(undefined);
    // Mock readFile to return existing config
    (fs.readFile as jest.MockedFunction<typeof fs.readFile>).mockResolvedValue(JSON.stringify({
      agent: { activeSkills: ['existing-skill'] },
      other: 'setting'
    }));

    await manager.addActiveSkill('new-skill');

    expect(fs.writeFile).toHaveBeenCalledWith(
      settingsPath,
      JSON.stringify({
        agent: { activeSkills: ['existing-skill', 'new-skill'] },
        other: 'setting'
      }, null, 2),
      'utf-8'
    );
  });

  it('should not add duplicate skills', async () => {
    (fs.access as jest.MockedFunction<typeof fs.access>).mockResolvedValue(undefined);
    (fs.readFile as jest.MockedFunction<typeof fs.readFile>).mockResolvedValue(JSON.stringify({
      agent: { activeSkills: ['skill-1'] }
    }));

    await manager.addActiveSkill('skill-1');

    expect(fs.writeFile).toHaveBeenCalledWith(
      settingsPath,
      JSON.stringify({
        agent: { activeSkills: ['skill-1'] }
      }, null, 2),
      'utf-8'
    );
  });

  it('should initialize activeSkills array if agent object exists but activeSkills is missing', async () => {
    (fs.access as jest.MockedFunction<typeof fs.access>).mockResolvedValue(undefined);
    (fs.readFile as jest.MockedFunction<typeof fs.readFile>).mockResolvedValue(JSON.stringify({
      agent: { otherConfig: true }
    }));

    await manager.addActiveSkill('skill-1');

    expect(fs.writeFile).toHaveBeenCalledWith(
      settingsPath,
      JSON.stringify({
        agent: { otherConfig: true, activeSkills: ['skill-1'] }
      }, null, 2),
      'utf-8'
    );
  });

  it('should add multiple unique skills', async () => {
    (fs.access as jest.MockedFunction<typeof fs.access>).mockResolvedValue(undefined);
    (fs.readFile as jest.MockedFunction<typeof fs.readFile>).mockResolvedValue(JSON.stringify({
      agent: { activeSkills: ['existing'] }
    }));

    await manager.addActiveSkills(['new1', 'new2', 'existing']);

    expect(fs.writeFile).toHaveBeenCalledWith(
      settingsPath,
      JSON.stringify({
        agent: { activeSkills: ['existing', 'new1', 'new2'] }
      }, null, 2),
      'utf-8'
    );
  });
});
