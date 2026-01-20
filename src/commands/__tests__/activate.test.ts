import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { activate } from '../activate.js';
import * as inquirer from '@inquirer/prompts';
import { ConfigManager } from '../../core/config.js';
import { AgentManager } from '../../core/agents.js';
import { SkillManager } from '../../core/skills.js';
import { GeminiSettingsManager } from '../../core/gemini.js';

// Mocks
jest.mock('chalk', () => ({
    bold: { cyan: jest.fn((str) => str) },
    yellow: jest.fn((str) => str),
    green: jest.fn((str) => str),
    dim: jest.fn((str) => str),
    red: jest.fn((str) => str),
}));

jest.mock('ora', () => {
    return () => ({
        start: jest.fn().mockReturnThis(),
        fail: jest.fn().mockReturnThis(),
        succeed: jest.fn().mockReturnThis(),
    });
});

jest.mock('@inquirer/prompts', () => ({
    checkbox: jest.fn(),
}));

jest.mock('../../core/config.js', () => ({ ConfigManager: jest.fn() }));
jest.mock('../../core/agents.js', () => ({ AgentManager: jest.fn() }));
jest.mock('../../core/skills.js', () => ({ SkillManager: jest.fn() }));
jest.mock('../../core/gemini.js', () => ({ GeminiSettingsManager: jest.fn() }));

// Mock implementations
const mockConfigManager = {
    isInitialized: jest.fn<() => Promise<boolean>>().mockResolvedValue(true),
    getConfiguredAgents: jest.fn<() => Promise<any[]>>().mockResolvedValue([{ id: 'agent1', name: 'Agent 1' }]),
    updateConfig: jest.fn<(updates: any) => Promise<void>>().mockResolvedValue(undefined),
};
const mockAgentManager = {
    activateSkills: jest.fn<(id: string, skills: string[]) => Promise<void>>().mockResolvedValue(undefined),
    detectAgents: jest.fn<() => Promise<any[]>>().mockResolvedValue([{ id: 'agent1', name: 'Agent 1' }]),
};
const mockSkillManager = {
    getAvailableSkills: jest.fn<() => Promise<string[]>>().mockResolvedValue(['skill-1', 'skill-2']),
    getActiveSkills: jest.fn<() => Promise<string[]>>().mockResolvedValue([]),
    saveProjectConfig: jest.fn<(skills: string[], agents: string[]) => Promise<void>>().mockResolvedValue(undefined),
};
const mockGeminiManager = {
    addActiveSkill: jest.fn<(skill: string) => Promise<void>>().mockResolvedValue(undefined),
    addActiveSkills: jest.fn<(skills: string[]) => Promise<void>>().mockResolvedValue(undefined),
};

describe('Activate Command', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        
        // Connect mocks to classes
        (ConfigManager as unknown as jest.Mock).mockImplementation(() => mockConfigManager);
        (AgentManager as unknown as jest.Mock).mockImplementation(() => mockAgentManager);
        (SkillManager as unknown as jest.Mock).mockImplementation(() => mockSkillManager);
        (GeminiSettingsManager as unknown as jest.Mock).mockImplementation(() => mockGeminiManager);

        // Reset default mock returns
        mockConfigManager.getConfiguredAgents.mockResolvedValue([{ id: 'agent1', name: 'Agent 1' }]);
        mockAgentManager.detectAgents.mockResolvedValue([{ id: 'agent1', name: 'Agent 1' }]);

        // Mock checkbox responses
        (inquirer.checkbox as any).mockResolvedValue(['skill-1']); // Default response
    });

    it('should save selected skills to .gemini/settings.json', async () => {
        (inquirer.checkbox as any)
            .mockResolvedValueOnce(['skill-1']) // skills
            .mockResolvedValueOnce(['agent1']); // agents

        await activate();

        expect(GeminiSettingsManager).toHaveBeenCalled();
        expect(mockGeminiManager.addActiveSkills).toHaveBeenCalledWith(['skill-1']);
    });

    it('should include detected but unconfigured agents in selection and update config', async () => {
        // Setup: Config has Agent 1, Detect has Agent 1 AND Agent 2
        mockConfigManager.getConfiguredAgents.mockResolvedValue([{ id: 'agent1', name: 'Agent 1' }]);
        mockAgentManager.detectAgents.mockResolvedValue([
            { id: 'agent1', name: 'Agent 1' },
            { id: 'agent2', name: 'Agent 2' }
        ]);

        // Mock user selecting BOTH agents
        (inquirer.checkbox as any)
            .mockResolvedValueOnce(['skill-1']) // skills
            .mockResolvedValueOnce(['agent1', 'agent2']); // agents

        await activate();

        // Verify inquirer was called with both agents
        expect(inquirer.checkbox).toHaveBeenNthCalledWith(2, expect.objectContaining({
            choices: expect.arrayContaining([
                expect.objectContaining({ value: 'agent1' }),
                expect.objectContaining({ value: 'agent2' })
            ])
        }));

        // Verify config was updated with new list
        expect(mockConfigManager.updateConfig).toHaveBeenCalledWith({
            agents: expect.arrayContaining(['agent1', 'agent2'])
        });
        
        // Verify activateSkills called for both
        expect(mockAgentManager.activateSkills).toHaveBeenCalledWith('agent1', ['skill-1']);
        expect(mockAgentManager.activateSkills).toHaveBeenCalledWith('agent2', ['skill-1']);
    });
});