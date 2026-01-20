import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { promises as fs } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import * as os from 'os';
import * as TOML from '@iarna/toml';

// Mock os.homedir BEFORE importing anything that uses it
jest.mock('os', () => ({
  ...jest.requireActual('os') as any,
  homedir: jest.fn()
}));

import { CodexAgent } from '../codex.js';

describe('CodexAgent', () => {
  let tempDir: string;
  let codexAgent: CodexAgent;
  let homeDir: string;
  let projectDir: string;

  beforeEach(async () => {
    // Create temporary directory for testing
    tempDir = join(tmpdir(), `ai-skills-codex-test-${Date.now()}`);
    await fs.mkdir(tempDir, { recursive: true });

    homeDir = join(tempDir, 'home');
    projectDir = join(tempDir, 'project');
    
    await fs.mkdir(homeDir, { recursive: true });
    await fs.mkdir(projectDir, { recursive: true });

    // Mock homedir to return our temp home
    (os.homedir as jest.Mock).mockReturnValue(homeDir);

    codexAgent = new CodexAgent(homeDir);
  });

  afterEach(async () => {
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  describe('updateProjectConfiguration', () => {
    it('should create .codex/config.toml if it does not exist', async () => {
      const skills = ['skill-a', 'skill-b'];
      
      await codexAgent.updateProjectConfiguration(skills, projectDir);
      
      const configPath = join(homeDir, '.codex', 'config.toml');
      const content = await fs.readFile(configPath, 'utf-8');
      const parsed = TOML.parse(content) as any;
      
      expect(parsed.skills).toBeDefined();
      expect(parsed.skills.config).toHaveLength(2);
      
      const skillA = parsed.skills.config.find((s: any) => s.path.includes('skill-a'));
      expect(skillA).toBeDefined();
      expect(skillA.enabled).toBe(true);
      expect(skillA.path).toBe('~/.codex/skills/skill-a');
    });

    it('should append to existing configuration', async () => {
        const configPath = join(homeDir, '.codex', 'config.toml');
        await fs.mkdir(join(homeDir, '.codex'), { recursive: true });
        
        const initialConfig = {
            skills: {
                config: [
                    { path: '~/.codex/skills/existing-skill', enabled: true, priority: 'low' }
                ]
            }
        };
        await fs.writeFile(configPath, TOML.stringify(initialConfig));
        
        const skills = ['new-skill'];
        await codexAgent.updateProjectConfiguration(skills, projectDir);
        
        const content = await fs.readFile(configPath, 'utf-8');
        const parsed = TOML.parse(content) as any;
        
        expect(parsed.skills.config).toHaveLength(2);
        const existing = parsed.skills.config.find((s: any) => s.path.includes('existing-skill'));
        const newSkill = parsed.skills.config.find((s: any) => s.path.includes('new-skill'));
        
        expect(existing).toBeDefined();
        expect(existing.priority).toBe('low'); // Preserved
        expect(newSkill).toBeDefined();
        expect(newSkill.enabled).toBe(true);
    });

    it('should update enabled status if skill already exists', async () => {
        const configPath = join(homeDir, '.codex', 'config.toml');
        await fs.mkdir(join(homeDir, '.codex'), { recursive: true });
        
        const initialConfig = {
            skills: {
                config: [
                    { path: '~/.codex/skills/test-skill', enabled: false }
                ]
            }
        };
        await fs.writeFile(configPath, TOML.stringify(initialConfig));
        
        const skills = ['test-skill'];
        await codexAgent.updateProjectConfiguration(skills, projectDir);
        
        const content = await fs.readFile(configPath, 'utf-8');
        const parsed = TOML.parse(content) as any;
        
        expect(parsed.skills.config).toHaveLength(1);
        expect(parsed.skills.config[0].enabled).toBe(true);
    });

    it('should preserve other top-level keys', async () => {
        const configPath = join(homeDir, '.codex', 'config.toml');
        await fs.mkdir(join(homeDir, '.codex'), { recursive: true });
        
        const initialConfig = `
            other_key = "value"
            
            [[skills.config]]
            path = "~/.codex/skills/existing"
            enabled = true
        `;
        await fs.writeFile(configPath, initialConfig);
        
        const skills = ['new-skill'];
        await codexAgent.updateProjectConfiguration(skills, projectDir);
        
        const content = await fs.readFile(configPath, 'utf-8');
        const parsed = TOML.parse(content) as any;
        
        expect(parsed.other_key).toBe('value');
        expect(parsed.skills.config).toHaveLength(2);
    });

    it('should disable skills that are not in the selected list', async () => {
        const configPath = join(homeDir, '.codex', 'config.toml');
        await fs.mkdir(join(homeDir, '.codex'), { recursive: true });
        
        // Initial state: skill-a and skill-b are enabled
        const initialConfig = {
            skills: {
                config: [
                    { path: '~/.codex/skills/skill-a', enabled: true },
                    { path: '~/.codex/skills/skill-b', enabled: true }
                ]
            }
        };
        await fs.writeFile(configPath, TOML.stringify(initialConfig));
        
        // Action: Activate ONLY skill-a
        const skills = ['skill-a'];
        await codexAgent.updateProjectConfiguration(skills, projectDir);
        
        // Assertion: skill-b should be disabled
        const content = await fs.readFile(configPath, 'utf-8');
        const parsed = TOML.parse(content) as any;
        
        const skillA = parsed.skills.config.find((s: any) => s.path.includes('skill-a'));
        const skillB = parsed.skills.config.find((s: any) => s.path.includes('skill-b'));
        
        expect(skillA.enabled).toBe(true);
        expect(skillB.enabled).toBe(false); 
    });
  });
});
