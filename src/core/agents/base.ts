import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { createSymlink } from '../utils.js';

export interface AgentInfo {
  id: string;
  name: string;
  skillsPath: string;
}

export abstract class BaseAgent {
  abstract readonly id: string;
  abstract readonly name: string;

  constructor(protected homeDir: string) {}

  abstract getSkillsPath(): string;

  getInfo(): AgentInfo {
    return {
      id: this.id,
      name: this.name,
      skillsPath: this.getSkillsPath()
    };
  }

  async isInstalled(): Promise<boolean> {
    try {
      // Check if parent directory exists (e.g., ~/.claude)
      const parentDir = dirname(this.getSkillsPath());
      await fs.access(parentDir);
      return true;
    } catch {
      return false;
    }
  }

  async activateSkills(skills: string[], centralSkillsDir: string): Promise<void> {
    const skillsPath = this.getSkillsPath();
    
    // Ensure agent skills directory exists
    await fs.mkdir(skillsPath, { recursive: true });

    // Get all existing symlinks in agent directory
    try {
      const entries = await fs.readdir(skillsPath, { withFileTypes: true });
      
      for (const entry of entries) {
        const targetPath = join(skillsPath, entry.name);
        
        try {
          const stats = await fs.lstat(targetPath);
          
          // If it's a symlink pointing to our central dir
          if (stats.isSymbolicLink()) {
            const linkTarget = await fs.readlink(targetPath);
            
            // If skill is not in selected list, remove symlink
            // We check if it starts with centralDir to only remove OUR symlinks
            if (!skills.includes(entry.name) && linkTarget.startsWith(centralSkillsDir)) {
              await fs.unlink(targetPath);
            }
          }
        } catch {
          // Skip if we can't read this entry
        }
      }
    } catch {
      // Should not happen as we created it
    }

    // Create symlinks for selected skills
    for (const skill of skills) {
      const sourcePath = join(centralSkillsDir, skill);
      const targetPath = join(skillsPath, skill);

      try {
        // Check if already exists
        await fs.access(targetPath);
        
        // If it exists, check if it's a symlink and remove it to recreate (ensure it points to right place)
        try {
            const stats = await fs.lstat(targetPath);
            if (stats.isSymbolicLink()) {
                 await fs.unlink(targetPath);
            } else {
                // It's a real file/dir, skip to avoid overwriting user data
                continue; 
            }
        } catch {
            // Ignore
        }
      } catch {
        // Doesn't exist, proceed
      }

      // Create symlink
      try {
        await createSymlink(sourcePath, targetPath);
      } catch (error) {
        // ignore
      }
    }
  }

  async updateProjectConfiguration(skills: string[], projectRoot: string = process.cwd()): Promise<void> {
    // Default implementation does nothing
  }
}
