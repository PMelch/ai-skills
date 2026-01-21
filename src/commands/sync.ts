import chalk from 'chalk';
import ora from 'ora';
import { promises as fs } from 'fs';
import { join } from 'path';
import { ConfigManager } from '../core/config.js';
import { getAgentInfo } from '../core/agents.js';
import { createSymlink } from '../core/utils.js';

export async function sync(): Promise<void> {
  console.log(chalk.bold.cyan('\n🔄 Syncing AI Skills\n'));

  const spinner = ora('Loading configuration...').start();
  
  try {
    const configManager = new ConfigManager();

    // Check if initialized
    if (!await configManager.isInitialized()) {
      spinner.fail('Not initialized');
      console.log(chalk.yellow('\n⚠️  Please run "ai-skills init" first'));
      return;
    }
    
    // Get configured agents
    const configuredAgents = await configManager.getConfiguredAgents();
    spinner.succeed('Configuration loaded');
    
    if (configuredAgents.length === 0) {
      console.log(chalk.yellow('\n⚠️  No agents configured'));
      return;
    }
    
    // Get all skill folders from central directory
    const centralDir = configManager.getConfigDir();
    const entries = await fs.readdir(centralDir, { withFileTypes: true });
    const skillFolders = entries
      .filter(entry => entry.isDirectory() && !entry.name.startsWith('.'))
      .map(entry => entry.name);
    
    let totalCreated = 0;
    let totalRemoved = 0;
    
    // Process each configured agent
    for (const agent of configuredAgents) {
      spinner.start(`Syncing ${agent.name}...`);
      const agentInfo = getAgentInfo(agent.id);
      
      try {
        // Ensure agent skills directory exists
        await fs.mkdir(agentInfo.skillsPath, { recursive: true });
        
        // Get existing entries in agent directory
        const agentEntries = await fs.readdir(agentInfo.skillsPath, { withFileTypes: true });
        
        // Track what needs to be created and removed
        const created: string[] = [];
        const removed: string[] = [];
        
        // Check existing symlinks - remove orphaned ones
        for (const entry of agentEntries) {
          const targetPath = join(agentInfo.skillsPath, entry.name);
          
          try {
            const stats = await fs.lstat(targetPath);
            
            if (stats.isSymbolicLink()) {
              const linkTarget = await fs.readlink(targetPath);
              
              // Check if symlink points to central directory
              if (linkTarget.startsWith(centralDir)) {
                const skillName = entry.name;
                
                // Check if the skill still exists in central directory
                if (!skillFolders.includes(skillName)) {
                  await fs.unlink(targetPath);
                  removed.push(skillName);
                                  } else {
                                  // Verify symlink target exists
                                  try {
                                    await fs.access(linkTarget);
                                  } catch {
                                    // Target doesn't exist, recreate symlink
                                    await fs.unlink(targetPath);
                                    const sourcePath = join(centralDir, skillName);
                                    await createSymlink(sourcePath, targetPath);
                                  }
                                }              }
            }
          } catch (error) {
            // Skip entries we can't process
          }
        }
        
        // Create symlinks for new skills
        for (const skillName of skillFolders) {
          const sourcePath = join(centralDir, skillName);
          const targetPath = join(agentInfo.skillsPath, skillName);
          
          try {
            // Check if symlink already exists
            await fs.lstat(targetPath);
            // Exists, skip
          } catch {
            // Doesn't exist, create it
            try {
              await createSymlink(sourcePath, targetPath);
              created.push(skillName);
            } catch (error) {
              // Log but continue
              console.log(chalk.dim(`\n  ⚠️  Could not create symlink for ${skillName}: ${error instanceof Error ? error.message : 'Unknown error'}`));
            }
          }
        }
        
        totalCreated += created.length;
        totalRemoved += removed.length;
        
        // Build result message
        const changes: string[] = [];
        if (created.length > 0) {
          changes.push(`+${created.length} added`);
        }
        if (removed.length > 0) {
          changes.push(`-${removed.length} removed`);
        }
        
        if (changes.length > 0) {
          spinner.succeed(`${agent.name}: ${changes.join(', ')}`);
        } else {
          spinner.succeed(`${agent.name}: up to date`);
        }
        
        // Show details if there were changes
        if (created.length > 0) {
          console.log(chalk.dim(`  Added: ${created.join(', ')}`));
        }
        if (removed.length > 0) {
          console.log(chalk.dim(`  Removed: ${removed.join(', ')}`));
        }
        
      } catch (error) {
        spinner.fail(`${agent.name}: failed`);
        console.error(chalk.dim(`  Error: ${error instanceof Error ? error.message : 'Unknown error'}`));
      }
    }
    
    console.log(chalk.green('\n✅ Sync complete!'));
    
    if (totalCreated === 0 && totalRemoved === 0) {
      console.log(chalk.dim('All agents are up to date'));
    } else {
      const summary: string[] = [];
      if (totalCreated > 0) summary.push(`${totalCreated} skill(s) added`);
      if (totalRemoved > 0) summary.push(`${totalRemoved} orphaned symlink(s) removed`);
      console.log(chalk.dim(summary.join(', ')));
    }
    
  } catch (error) {
    spinner.fail('Sync failed');
    console.error(chalk.red('\n❌ Error:'), error instanceof Error ? error.message : error);
    process.exit(1);
  }
}
