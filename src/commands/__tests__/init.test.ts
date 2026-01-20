import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { init } from '../init.js';
import * as inquirer from '@inquirer/prompts';
import { ConfigManager } from '../../core/config.js';
import { AgentManager } from '../../core/agents.js';

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

// Mock implementations
const mockConfigManager = {
    initialize: jest.fn<(agents: string[]) => Promise<void>>().mockResolvedValue(undefined),
    getConfigDir: jest.fn<() => string>().mockReturnValue('/mock/config/dir'),
};

const allAgents = [
    { id: 'claude', name: 'Claude', skillsPath: '/mock/claude' },
    { id: 'gemini', name: 'Gemini', skillsPath: '/mock/gemini' },
    { id: 'codex', name: 'Codex', skillsPath: '/mock/codex' },
    { id: 'copilot', name: 'Copilot', skillsPath: '/mock/copilot' }
];

const mockAgentManager = {
    detectAgents: jest.fn<() => Promise<any[]>>().mockResolvedValue([]),
    createSymlinks: jest.fn<(id: string) => Promise<void>>().mockResolvedValue(undefined),
    getSupportedAgents: jest.fn<() => any[]>().mockReturnValue(allAgents)
};

describe('Init Command', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        
        // Connect mocks to classes
        (ConfigManager as unknown as jest.Mock).mockImplementation(() => mockConfigManager);
        (AgentManager as unknown as jest.Mock).mockImplementation(() => mockAgentManager);

        // Reset default mock returns
        mockAgentManager.detectAgents.mockResolvedValue([]);
        mockAgentManager.getSupportedAgents.mockReturnValue(allAgents);
        
        // Mock checkbox responses
        (inquirer.checkbox as any).mockResolvedValue(['claude']); 
    });

    it('should list all supported agents', async () => {
        await init();

        expect(inquirer.checkbox).toHaveBeenCalledWith(expect.objectContaining({
            choices: expect.arrayContaining([
                expect.objectContaining({ value: 'claude' }),
                expect.objectContaining({ value: 'gemini' }),
                expect.objectContaining({ value: 'codex' }),
                expect.objectContaining({ value: 'copilot' })
            ])
        }));
    });

    it('should pre-select detected agents', async () => {
        mockAgentManager.detectAgents.mockResolvedValue([
            { id: 'claude', name: 'Claude' }
        ]);

        await init();

        expect(inquirer.checkbox).toHaveBeenCalledWith(expect.objectContaining({
            choices: expect.arrayContaining([
                expect.objectContaining({ value: 'claude', checked: true }),
                expect.objectContaining({ value: 'gemini', checked: false }) // Should not be checked
            ])
        }));
    });

    it('should allow selecting undetected agents and create symlinks for them', async () => {
        // Detect only Claude
        mockAgentManager.detectAgents.mockResolvedValue([
            { id: 'claude', name: 'Claude' }
        ]);

        // User selects Claude AND Codex (Codex is undetected)
        (inquirer.checkbox as any).mockResolvedValue(['claude', 'codex']);

        await init();

        expect(mockConfigManager.initialize).toHaveBeenCalledWith(['claude', 'codex']);
        expect(mockAgentManager.createSymlinks).toHaveBeenCalledWith('claude');
        expect(mockAgentManager.createSymlinks).toHaveBeenCalledWith('codex');
    });

    it('should handle no detected agents but allow manual selection', async () => {
        mockAgentManager.detectAgents.mockResolvedValue([]);
        
        // User selects Codex
        (inquirer.checkbox as any).mockResolvedValue(['codex']);

        await init();

        expect(mockConfigManager.initialize).toHaveBeenCalledWith(['codex']);
        expect(mockAgentManager.createSymlinks).toHaveBeenCalledWith('codex');
    });

    it('should accept --agents flag and skip interactive prompt', async () => {
        // User provides agents via CLI flag
        await init({ agents: ['claude', 'codex'] });

        // Should NOT call inquirer when agents are provided
        expect(inquirer.checkbox).not.toHaveBeenCalled();
        
        // Should initialize with provided agents
        expect(mockConfigManager.initialize).toHaveBeenCalledWith(['claude', 'codex']);
        expect(mockAgentManager.createSymlinks).toHaveBeenCalledWith('claude');
        expect(mockAgentManager.createSymlinks).toHaveBeenCalledWith('codex');
    });

    it('should validate agent names when provided via --agents flag', async () => {
        // Mock console.error to suppress output
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        const processExitSpy = jest.spyOn(process, 'exit').mockImplementation(((code?: number) => {
            throw new Error('process.exit');
        }) as any);

        await expect(init({ agents: ['invalid-agent'] })).rejects.toThrow('process.exit');

        expect(consoleErrorSpy).toHaveBeenCalled();
        expect(processExitSpy).toHaveBeenCalledWith(1);

        consoleErrorSpy.mockRestore();
        processExitSpy.mockRestore();
    });

    it('should accept comma-separated agents string', async () => {
        await init({ agents: ['claude,codex'] });

        expect(mockConfigManager.initialize).toHaveBeenCalledWith(['claude', 'codex']);
    });
});
