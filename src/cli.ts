#!/usr/bin/env node
import { Command } from 'commander';
import { createRequire } from 'module';
import { init } from './commands/init.js';
import { activate } from './commands/activate.js';
import { sync } from './commands/sync.js';

const require = createRequire(import.meta.url);
const pkg = require('../package.json');

const program = new Command();

program
  .name('ai-skills')
  .description('Manage AI agent skills centrally')
  .version(pkg.version);

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

program
  .command('version')
  .description('Show current version')
  .action(() => {
    console.log(pkg.version);
  });

program.parse();
