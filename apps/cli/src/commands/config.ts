import { Command } from 'commander';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { getConfig, setConfig, Config } from '../config/config';

export function configCommand(program: Command) {
  program
    .command('config [key] [value]')
    .description('Manage CLI configuration')
    .action(async (key: string | undefined, value: string | undefined) => {
      try {
        console.log(chalk.blue('\n⚙️  Skill Hub - Configuration\n'));
        
        const config = getConfig();
        
        // If no key provided, show all config
        if (!key) {
          console.log(chalk.blue('Current Configuration:\n'));
          console.log(chalk.cyan('  API URL:'), config.apiUrl);
          console.log(chalk.cyan('  Token:'), config.token ? '********' : 'Not set');
          console.log(chalk.cyan('  Default Namespace:'), config.defaultNamespace || 'personal');
          console.log('');
          return;
        }
        
        // If key provided but no value, show that key
        if (key && !value) {
          const configValue = (config as any)[key];
          if (configValue !== undefined) {
            console.log(chalk.cyan(`${key}:`), configValue);
          } else {
            console.log(chalk.yellow(`${key}: Not set`));
          }
          return;
        }
        
        // Set the configuration value
        if (key && value) {
          const updatedConfig = setConfig(key as keyof Config, value);
          console.log(chalk.green(`\n✅ Configuration updated!`));
          console.log(chalk.cyan(`${key}:`), (updatedConfig as any)[key]);
          return;
        }
      } catch (error: any) {
        console.error(chalk.red(`\nError: ${error.message}`));
        process.exit(1);
      }
    });
}
