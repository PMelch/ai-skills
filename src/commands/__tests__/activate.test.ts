import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { activate } from '../activate.js';
import * as inquirer from '@inquirer/prompts';
import { ConfigManager } from '../../core/config.js';
import { AgentManager } from '../../core/agents.js';
import { SkillManager } from '../../core/skills.js';

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

describe('Activate Command', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        
        // Connect mocks to classes
        (ConfigManager as unknown as jest.Mock).mockImplementation(() => mockConfigManager);
        (AgentManager as unknown as jest.Mock).mockImplementation(() => mockAgentManager);
        (SkillManager as unknown as jest.Mock).mockImplementation(() => mockSkillManager);

        // Reset default mock returns
        mockConfigManager.getConfiguredAgents.mockResolvedValue([{ id: 'agent1', name: 'Agent 1' }]);
        mockAgentManager.detectAgents.mockResolvedValue([{ id: 'agent1', name: 'Agent 1' }]);

        // Mock checkbox responses
        (inquirer.checkbox as any).mockResolvedValue(['skill-1']); // Default response
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

    it('should accept --skills and --agents flags and skip interactive prompts', async () => {
        await activate({ skills: ['skill-1'], agents: ['agent1'] });

        // Should NOT call inquirer when both flags are provided
        expect(inquirer.checkbox).not.toHaveBeenCalled();
        
        // Should save config with provided values
        expect(mockSkillManager.saveProjectConfig).toHaveBeenCalledWith(['skill-1'], ['agent1']);
        expect(mockAgentManager.activateSkills).toHaveBeenCalledWith('agent1', ['skill-1']);
    });

    it('should accept --skills flag only and prompt for agents', async () => {
        (inquirer.checkbox as any).mockResolvedValue(['agent1']);

        await activate({ skills: ['skill-1', 'skill-2'] });

        // Should call inquirer once for agents only
        expect(inquirer.checkbox).toHaveBeenCalledTimes(1);
        expect(inquirer.checkbox).toHaveBeenCalledWith(expect.objectContaining({
            message: 'Activate for which agents:'
        }));
        
        expect(mockSkillManager.saveProjectConfig).toHaveBeenCalledWith(['skill-1', 'skill-2'], ['agent1']);
    });

    it('should accept --agents flag only and prompt for skills', async () => {
        (inquirer.checkbox as any).mockResolvedValue(['skill-1']);

        await activate({ agents: ['agent1'] });

        // Should call inquirer once for skills only
        expect(inquirer.checkbox).toHaveBeenCalledTimes(1);
        expect(inquirer.checkbox).toHaveBeenCalledWith(expect.objectContaining({
            message: 'Select skills to activate:'
        }));
        
        expect(mockSkillManager.saveProjectConfig).toHaveBeenCalledWith(['skill-1'], ['agent1']);
    });

    it('should validate skill names when provided via --skills flag', async () => {
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        const processExitSpy = jest.spyOn(process, 'exit').mockImplementation(((code?: number) => {
            throw new Error('process.exit');
        }) as any);

        await expect(activate({ skills: ['invalid-skill'] })).rejects.toThrow('process.exit');

        expect(consoleErrorSpy).toHaveBeenCalled();
        
        consoleErrorSpy.mockRestore();
        processExitSpy.mockRestore();
    });

    it('should validate agent names when provided via --agents flag', async () => {
        mockConfigManager.getConfiguredAgents.mockResolvedValue([]);
        mockAgentManager.detectAgents.mockResolvedValue([{ id: 'agent1', name: 'Agent 1' }]);
        
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        const processExitSpy = jest.spyOn(process, 'exit').mockImplementation(((code?: number) => {
            throw new Error('process.exit');
        }) as any);

        await expect(activate({ agents: ['invalid-agent'] })).rejects.toThrow('process.exit');

        expect(consoleErrorSpy).toHaveBeenCalled();
        
        consoleErrorSpy.mockRestore();
        processExitSpy.mockRestore();
    });
});