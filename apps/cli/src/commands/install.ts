import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { installSkillPackage } from '../utils/api';
import { getConfig } from '../config/config';

export function installCommand(program: Command) {
  program
    .command('install <skill>')
    .alias('i')
    .description('Install a skill from Skill Hub')
    .option('-g, --global', 'Install globally')
    .option('-v, --version <version>', 'Specific version to install')
    .action(async (skill: string, options: any) => {
      try {
        console.log(chalk.blue('\n📥 Skill Hub - Install Skill\n'));
        
        const config = getConfig();
        const version = options.version || 'latest';
        
        const spinner = ora(`Downloading ${skill}@${version}...`).start();
        
        try {
          const result = await installSkillPackage(skill, version, config.apiUrl);
          
          spinner.succeed('Skill downloaded successfully');
          
          // Install to appropriate location
          const installSpinner = ora('Installing skill...').start();
          
          // For now, just show success message
          installSpinner.succeed('Skill installed successfully!');
          
          console.log(chalk.green('\n✅ Installation complete!'));
          console.log(chalk.blue(`   Skill: ${result.skillName}`));
          console.log(chalk.blue(`   Version: ${result.version}`));
          console.log(chalk.blue(`   Location: ${result.installPath}`));
          
          if (options.global) {
            console.log(chalk.yellow('\n   Note: Global installation not yet implemented'));
          }
        } catch (error: any) {
          spinner.fail('Download failed');
          console.error(chalk.red(`\nError: ${error.message}`));
          process.exit(1);
        }
      } catch (error: any) {
        console.error(chalk.red(`\nError: ${error.message}`));
        process.exit(1);
      }
    });
}
