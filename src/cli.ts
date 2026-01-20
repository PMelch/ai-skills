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
  .action(init);

program
  .command('activate')
  .description('Select and activate skills for current project')
  .action(activate);

program
  .command('sync')
  .description('Sync skills from ~/.config/ai-skills to configured agents')
  .action(sync);

program.parse();
