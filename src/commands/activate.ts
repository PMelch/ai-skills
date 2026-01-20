import { checkbox } from '@inquirer/prompts';
import chalk from 'chalk';
import ora from 'ora';
import { ConfigManager } from '../core/config.js';
import { AgentManager } from '../core/agents.js';
import { SkillManager } from '../core/skills.js';

interface ActivateOptions {
  skills?: string[];
  agents?: string[];
}

function parseCommaSeparated(values: string[]): string[] {
  return values.flatMap(v => v.split(',').map(s => s.trim())).filter(Boolean);
}

export async function activate(options?: ActivateOptions): Promise<void> {
  console.log(chalk.bold.cyan('\n🎯 Activate AI Skills\n'));

  const spinner = ora('Loading configuration...').start();
  
  try {
    const configManager = new ConfigManager();
    const agentManager = new AgentManager();
    const skillManager = new SkillManager();
    
    // Check if initialized
    if (!await configManager.isInitialized()) {
      spinner.fail('Not initialized');
      console.log(chalk.yellow('\n⚠️  Please run "ai-skills init" first'));
      return;
    }
    
    // Get available skills
    const availableSkills = await skillManager.getAvailableSkills();
    spinner.succeed('Configuration loaded');
    
    if (availableSkills.length === 0) {
      console.log(chalk.yellow('\n⚠️  No skills found in ~/.config/ai-skills/'));
      console.log(chalk.dim('Add skill folders to ~/.config/ai-skills/ first'));
      return;
    }
    
    // Load existing project config
    const currentSkills = await skillManager.getActiveSkills();
    
    let selectedSkills: string[];
    
    // Check if skills were provided via CLI
    if (options?.skills && options.skills.length > 0) {
      selectedSkills = parseCommaSeparated(options.skills);
      
      // Validate provided skills
      const invalidSkills = selectedSkills.filter(skill => !availableSkills.includes(skill));
      
      if (invalidSkills.length > 0) {
        spinner.fail('Invalid skills provided');
        console.error(chalk.red(`\n❌ Invalid skill(s): ${invalidSkills.join(', ')}`));
        console.log(chalk.dim(`Available skills: ${availableSkills.join(', ')}`));
        process.exit(1);
      }
    } else {
      // Prompt for skill selection
      selectedSkills = await checkbox({
        message: 'Select skills to activate:',
        choices: availableSkills.map(skill => ({
          name: skill,
          value: skill,
          checked: currentSkills.includes(skill)
        }))
      });
    }
    
    // Get configured agents
    const configuredAgents = await configManager.getConfiguredAgents();
    const detectedAgents = await agentManager.detectAgents();
    
    // Merge agents
    const allAgentsMap = new Map();
    configuredAgents.forEach(a => allAgentsMap.set(a.id, a));
    detectedAgents.forEach(a => allAgentsMap.set(a.id, a));
    const allAgents = Array.from(allAgentsMap.values());
    
    let selectedAgents: string[];
    
    // Check if agents were provided via CLI
    if (options?.agents && options.agents.length > 0) {
      selectedAgents = parseCommaSeparated(options.agents);
      
      // Validate provided agents
      const allAgentIds = allAgents.map(a => a.id);
      const invalidAgents = selectedAgents.filter(id => !allAgentIds.includes(id));
      
      if (invalidAgents.length > 0) {
        spinner.fail('Invalid agents provided');
        console.error(chalk.red(`\n❌ Invalid agent(s): ${invalidAgents.join(', ')}`));
        console.log(chalk.dim(`Available agents: ${allAgentIds.join(', ')}`));
        process.exit(1);
      }
    } else {
      // Select which agents to activate for
      selectedAgents = await checkbox({
        message: 'Activate for which agents:',
        choices: allAgents.map(agent => ({
          name: agent.name,
          value: agent.id,
          checked: true
        }))
      });
    }
    
    if (selectedAgents.length === 0) {
      console.log(chalk.yellow('\n⚠️  No agents selected. Exiting.'));
      return;
    }

    // Update global config with newly selected agents
    const uniqueAgents = Array.from(new Set([
        ...configuredAgents.map(a => a.id), 
        ...selectedAgents
    ]));
    await configManager.updateConfig({ agents: uniqueAgents });
    
    // Save project configuration
    spinner.start('Saving project configuration...');
    await skillManager.saveProjectConfig(selectedSkills, selectedAgents);
    
    spinner.succeed('Project configuration saved');
    
    // Apply to agents
    spinner.start('Configuring agents...');
    for (const agentId of selectedAgents) {
      await agentManager.activateSkills(agentId, selectedSkills);
    }
    spinner.succeed('Agent configuration complete');
    
    console.log(chalk.green('\n✅ Skills activated!'));
    if (selectedSkills.length > 0) {
      console.log(chalk.dim('\nActivated skills:'));
      selectedSkills.forEach(skill => console.log(chalk.dim(`  • ${skill}`)));
    } else {
      console.log(chalk.dim('\nAll skills deactivated'));
    }
    
  } catch (error) {
    spinner.fail('Activation failed');
    console.error(chalk.red('\n❌ Error:'), error instanceof Error ? error.message : error);
    process.exit(1);
  }
}
