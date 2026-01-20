import { checkbox } from '@inquirer/prompts';
import chalk from 'chalk';
import ora from 'ora';
import { ConfigManager } from '../core/config.js';
import { AgentManager } from '../core/agents.js';
import { SkillManager } from '../core/skills.js';

export async function activate(): Promise<void> {
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
    
    // Prompt for skill selection
    const selectedSkills = await checkbox({
      message: 'Select skills to activate:',
      choices: availableSkills.map(skill => ({
        name: skill,
        value: skill,
        checked: currentSkills.includes(skill)
      }))
    });
    
    // Get configured agents
    const configuredAgents = await configManager.getConfiguredAgents();
    
    // Select which agents to activate for
    const selectedAgents = await checkbox({
      message: 'Activate for which agents:',
      choices: configuredAgents.map(agent => ({
        name: `${agent.icon} ${agent.name}`,
        value: agent.id,
        checked: true
      }))
    });
    
    if (selectedAgents.length === 0) {
      console.log(chalk.yellow('\n⚠️  No agents selected. Exiting.'));
      return;
    }
    
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
