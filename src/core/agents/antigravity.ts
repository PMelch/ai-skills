import { join } from 'path';
import { promises as fs } from 'fs';
import { BaseAgent } from './base.js';

export class AntigravityAgent extends BaseAgent {
  readonly id = 'antigravity';
  readonly name = 'Antigravity';

  getSkillsPath(): string {
    return join(this.homeDir, '.antigravity', 'skills');
  }

  async updateProjectConfiguration(skills: string[], projectRoot: string = process.cwd()): Promise<void> {
    const rulesDir = join(projectRoot, '.agent', 'rules');
    const agentSkillsDir = this.getSkillsPath();

    // Ensure .agent/rules directory exists
    await fs.mkdir(rulesDir, { recursive: true });

    // 1. Clean up old symlinks (remove deactivated skills)
    try {
      const entries = await fs.readdir(rulesDir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isSymbolicLink()) {
          const fullPath = join(rulesDir, entry.name);
          try {
            const target = await fs.readlink(fullPath);
            // Check if target points to our skills directory
            // We verify if it contains the agent skills path substring
            if (target.includes(join('.antigravity', 'skills'))) {
              if (!skills.includes(entry.name)) {
                await fs.unlink(fullPath);
              }
            }
          } catch {
            // Ignore readlink errors
          }
        }
      }
    } catch {
      // Ignore readdir errors (if dir was just created it's empty, but mkdir recursive handles existence)
    }

    // 2. Create/Update symlinks for active skills
    for (const skill of skills) {
      const source = join(agentSkillsDir, skill);
      const dest = join(rulesDir, skill);
      
      try {
        // Check if destination exists
        const stat = await fs.lstat(dest).catch(() => null);
        
        if (stat) {
          if (stat.isSymbolicLink()) {
            const currentTarget = await fs.readlink(dest);
            if (currentTarget !== source) {
              await fs.unlink(dest);
              await fs.symlink(source, dest, 'dir');
            }
          } else {
            // It's a real file/dir, don't touch it to be safe.
            continue;
          }
        } else {
            // Doesn't exist, create it
            await fs.symlink(source, dest, 'dir');
        }
      } catch (error) {
        throw error;
      }
    }
  }
}
