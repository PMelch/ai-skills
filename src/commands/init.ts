import { checkbox } from '@inquirer/prompts';
import chalk from 'chalk';
import ora from 'ora';
import { ConfigManager } from '../core/config.js';
import { AgentManager } from '../core/agents.js';

export async function init(): Promise<void> {
  console.log(chalk.bold.cyan('\n🚀 AI Skills Setup\n'));

  const spinner = ora('Checking system...').start();
  
  try {
    const configManager = new ConfigManager();
    const agentManager = new AgentManager();
    
    // Detect available agents
    const availableAgents = await agentManager.detectAgents();
    spinner.succeed('System check complete');
    
    if (availableAgents.length === 0) {
      console.log(chalk.yellow('\n⚠️  No AI agent folders detected'));
      console.log(chalk.dim('Expected locations:'));
      console.log(chalk.dim('  - ~/.claude/skills'));
      console.log(chalk.dim('  - ~/.gemini/skills'));
      return;
    }
    
    // Prompt user to select agents
    const selectedAgents = await checkbox({
      message: 'Select agents to configure:',
      choices: availableAgents.map(agent => ({
        name: agent.name,
        value: agent.id,
        checked: true
      }))
    });
    
    if (selectedAgents.length === 0) {
      console.log(chalk.yellow('\n⚠️  No agents selected. Exiting.'));
      return;
    }
    
    // Setup configuration
    spinner.start('Creating central configuration folder...');
    await configManager.initialize(selectedAgents);
    spinner.succeed('Created ~/.config/ai-skills');
    
    // Create symlinks
    spinner.start('Setting up symlinks...');
    for (const agentId of selectedAgents) {
      await agentManager.createSymlinks(agentId);
    }
    spinner.succeed('Symlinks created successfully');
    
    console.log(chalk.green('\n✅ Setup complete!'));
    console.log(chalk.dim('\nNext steps:'));
    console.log(chalk.dim('  1. Add skill folders to ~/.config/ai-skills/'));
    console.log(chalk.dim('  2. Run "ai-skills activate" in your project folder'));
    
  } catch (error) {
    spinner.fail('Setup failed');
    console.error(chalk.red('\n❌ Error:'), error instanceof Error ? error.message : error);
    process.exit(1);
  }
}
