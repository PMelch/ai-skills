import { promises as fs } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import { BaseAgent, AgentInfo } from './agents/base.js';
import { ClaudeAgent } from './agents/claude.js';
import { GeminiAgent } from './agents/gemini.js';
import { CodexAgent } from './agents/codex.js';
import { CopilotAgent } from './agents/copilot.js';

export { AgentInfo };

export class AgentManager {
  private agents: Map<string, BaseAgent>;

  constructor() {
    this.agents = new Map();
    const home = homedir();
    
    const agents = [
      new ClaudeAgent(home),
      new GeminiAgent(home),
      new CodexAgent(home),
      new CopilotAgent(home)
    ];

    agents.forEach(agent => this.agents.set(agent.id, agent));
  }

  getAgent(id: string): BaseAgent {
    const agent = this.agents.get(id);
    if (!agent) {
      throw new Error(`Unknown agent: ${id}`);
    }
    return agent;
  }

  getSupportedAgents(): AgentInfo[] {
    return Array.from(this.agents.values()).map(a => a.getInfo());
  }

  async detectAgents(): Promise<AgentInfo[]> {
    const available: AgentInfo[] = [];
    
    for (const agent of this.agents.values()) {
      if (await agent.isInstalled()) {
        available.push(agent.getInfo());
      }
    }

    return available;
  }

  async createSymlinks(agentId: string): Promise<void> {
    const agent = this.getAgent(agentId);
    const { ConfigManager } = await import('./config.js');
    const configManager = new ConfigManager();
    const centralDir = configManager.getConfigDir();

    // Get all skill folders in central directory to simulate "sync all"
    let allSkills: string[] = [];
    try {
        const entries = await fs.readdir(centralDir, { withFileTypes: true });
        allSkills = entries
        .filter(entry => entry.isDirectory() && !entry.name.startsWith('.'))
        .map(e => e.name);
    } catch {
        // No skills yet
    }

    await agent.activateSkills(allSkills, centralDir);
  }

  async activateSkills(agentId: string, skills: string[]): Promise<void> {
    const agent = this.getAgent(agentId);
    const { ConfigManager } = await import('./config.js');
    const configManager = new ConfigManager();
    const centralDir = configManager.getConfigDir();

    await agent.activateSkills(skills, centralDir);
    await agent.updateProjectConfiguration(skills, process.cwd());
  }
}

// Helper for backward compatibility or direct usage if needed
export function getAgentInfo(id: string): AgentInfo {
  const manager = new AgentManager();
  return manager.getAgent(id).getInfo();
}