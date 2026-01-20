#!/usr/bin/env node
import { Command } from 'commander';
import { init } from './commands/init.js';
import { activate } from './commands/activate.js';
import { sync } from './commands/sync.js';

const program = new Command();

program
  .name('ai-skills')
  .description('Manage AI agent skills centrally')
  .version('0.1.0');

program
  .command('init')
  .description('Setup central skill configuration in ~/.config/ai-skills')
  .option('--agents <agents...>', 'Agents to configure (comma-separated or multiple flags)')
  .action((options) => init(options));

program
  .command('activate')
  .description('Select and activate skills for current project')
  .option('--skills <skills...>', 'Skills to activate (comma-separated or multiple flags)')
  .option('--agents <agents...>', 'Agents to target (comma-separated or multiple flags)')
  .action((options) => activate(options));

program
  .command('sync')
  .description('Sync skills from ~/.config/ai-skills to configured agents')
  .action(sync);

program.parse();
