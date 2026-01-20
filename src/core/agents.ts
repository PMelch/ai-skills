import { promises as fs } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

export interface AgentInfo {
  id: string;
  name: string;
  skillsPath: string;
}

const AGENTS: AgentInfo[] = [
  {
    id: 'claude',
    name: 'Claude',
    skillsPath: join(homedir(), '.claude', 'skills')
  },
  {
    id: 'gemini',
    name: 'Gemini',
    skillsPath: join(homedir(), '.gemini', 'skills')
  }
];

export function getAgentInfo(id: string): AgentInfo {
  const agent = AGENTS.find(a => a.id === id);
  if (!agent) {
    throw new Error(`Unknown agent: ${id}`);
  }
  return agent;
}

export class AgentManager {
  async detectAgents(): Promise<AgentInfo[]> {
    const available: AgentInfo[] = [];

    for (const agent of AGENTS) {
      try {
        // Check if parent directory exists (e.g., ~/.claude)
        const parentDir = join(agent.skillsPath, '..');
        await fs.access(parentDir);
        available.push(agent);
      } catch {
        // Agent folder doesn't exist, skip
      }
    }

    return available;
  }

  async createSymlinks(agentId: string): Promise<void> {
    const agent = getAgentInfo(agentId);
    const { ConfigManager } = await import('./config.js');
    const configManager = new ConfigManager();
    const centralDir = configManager.getConfigDir();

    // Ensure agent skills directory exists
    await fs.mkdir(agent.skillsPath, { recursive: true });

    // Get all skill folders in central directory
    const entries = await fs.readdir(centralDir, { withFileTypes: true });
    const skillFolders = entries.filter(entry => 
      entry.isDirectory() && !entry.name.startsWith('.')
    );

    for (const folder of skillFolders) {
      const sourcePath = join(centralDir, folder.name);
      const targetPath = join(agent.skillsPath, folder.name);

      try {
        // Check if symlink already exists
        const stats = await fs.lstat(targetPath);
        if (stats.isSymbolicLink()) {
          // Remove existing symlink
          await fs.unlink(targetPath);
        }
      } catch {
        // Doesn't exist, which is fine
      }

      // Create symlink
      await fs.symlink(sourcePath, targetPath, 'dir');
    }
  }

  async activateSkills(agentId: string, skills: string[]): Promise<void> {
    const agent = getAgentInfo(agentId);
    const { ConfigManager } = await import('./config.js');
    const configManager = new ConfigManager();
    const centralDir = configManager.getConfigDir();

    // Get all existing symlinks in agent directory
    try {
      const entries = await fs.readdir(agent.skillsPath, { withFileTypes: true });
      
      for (const entry of entries) {
        const targetPath = join(agent.skillsPath, entry.name);
        
        try {
          const stats = await fs.lstat(targetPath);
          
          // If it's a symlink pointing to our central dir
          if (stats.isSymbolicLink()) {
            const linkTarget = await fs.readlink(targetPath);
            
            // If skill is not in selected list, remove symlink
            if (!skills.includes(entry.name) && linkTarget.startsWith(centralDir)) {
              await fs.unlink(targetPath);
            }
          }
        } catch {
          // Skip if we can't read this entry
        }
      }
    } catch {
      // Agent directory doesn't exist, create it
      await fs.mkdir(agent.skillsPath, { recursive: true });
    }

    // Create symlinks for selected skills
    for (const skill of skills) {
      const sourcePath = join(centralDir, skill);
      const targetPath = join(agent.skillsPath, skill);

      try {
        // Check if already exists
        await fs.access(targetPath);
        // If it exists and is not what we want, remove it
        try {
          const stats = await fs.lstat(targetPath);
          if (stats.isSymbolicLink()) {
            await fs.unlink(targetPath);
          }
        } catch {
          // Continue anyway
        }
      } catch {
        // Doesn't exist, good
      }

      // Create symlink
      try {
        await fs.symlink(sourcePath, targetPath, 'dir');
      } catch (error) {
        // Might already exist, that's okay
      }
    }
  }
}
