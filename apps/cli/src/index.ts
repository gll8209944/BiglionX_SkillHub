#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { version } from '../package.json';
import { publishCommand } from './commands/publish.js';
import { installCommand } from './commands/install.js';
import { searchCommand } from './commands/search.js';
import { configCommand } from './commands/config.js';

const program = new Command();

program
  .name('skillhub')
  .description(chalk.blue('Skill Hub CLI - Manage AI Agent Skills'))
  .version(version);

// Register commands
publishCommand(program);
installCommand(program);
searchCommand(program);
configCommand(program);

// Handle unknown commands
program.on('command:*', () => {
  console.error(chalk.red(`Invalid command: ${program.args.join(' ')}`));
  console.log(chalk.yellow('See --help for a list of available commands.'));
  process.exit(1);
});

// Handle errors
program.exitOverride();

try {
  program.parse(process.argv);
  
  // Show help if no command provided
  if (!process.argv.slice(2).length) {
    program.outputHelp();
  }
} catch (error: any) {
  if (error.code !== 'commander.helpDisplayed') {
    console.error(chalk.red('Error:', error.message));
    process.exit(1);
  }
}

