import { promises as fs } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

export interface Config {
  version: string;
  agents: string[];
  createdAt: string;
  updatedAt: string;
}

export class ConfigManager {
  private configDir: string;
  private configFile: string;

  constructor() {
    this.configDir = join(homedir(), '.config', 'ai-skills');
    this.configFile = join(this.configDir, 'config.json');
  }

  async isInitialized(): Promise<boolean> {
    try {
      await fs.access(this.configDir);
      await fs.access(this.configFile);
      return true;
    } catch {
      return false;
    }
  }

  async initialize(agents: string[]): Promise<void> {
    // Create config directory
    await fs.mkdir(this.configDir, { recursive: true });

    // Create config file
    const config: Config = {
      version: '0.1.0',
      agents,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await fs.writeFile(this.configFile, JSON.stringify(config, null, 2), 'utf-8');
  }

  async getConfig(): Promise<Config> {
    const content = await fs.readFile(this.configFile, 'utf-8');
    return JSON.parse(content);
  }

  async updateConfig(updates: Partial<Config>): Promise<void> {
    const config = await this.getConfig();
    const updated = {
      ...config,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    await fs.writeFile(this.configFile, JSON.stringify(updated, null, 2), 'utf-8');
  }

  async getConfiguredAgents(): Promise<import('./agents.js').AgentInfo[]> {
    const config = await this.getConfig();
    const { getAgentInfo } = await import('./agents.js');
    return config.agents.map(id => getAgentInfo(id));
  }

  getConfigDir(): string {
    return this.configDir;
  }
}
