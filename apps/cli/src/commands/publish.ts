import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';
import { validateSkillManifest } from '../utils/validator.js';
import { uploadSkill } from '../utils/api.js';

export function publishCommand(program: Command) {
  program
    .command('publish [path]')
    .description('Publish a skill to Skill Hub')
    .option('-n, --namespace <namespace>', 'Namespace for the skill')
    .option('--dry-run', 'Validate without publishing')
    .action(async (path: string | undefined, options: any) => {
      try {
        const skillPath = path || process.cwd();
        
        console.log(chalk.blue('\n📦 Skill Hub - Publish Skill\n'));
        
        // Validate skill manifest
        const spinner = ora('Validating skill manifest...').start();
        const validationResult = await validateSkillManifest(skillPath);
        
        if (!validationResult.valid) {
          spinner.fail('Validation failed');
          console.error(chalk.red('\nValidation errors:'));
          validationResult.errors.forEach(err => {
            console.error(chalk.red(`  - ${err}`));
          });
          process.exit(1);
        }
        
        spinner.succeed('Skill manifest is valid');
        
        if (options.dryRun) {
          console.log(chalk.green('\n✅ Dry run completed successfully!'));
          console.log(chalk.yellow('Use without --dry-run to actually publish.'));
          return;
        }
        
        // Ask for namespace if not provided
        let namespace = options.namespace;
        if (!namespace) {
          const answers = await inquirer.prompt([
            {
              type: 'input',
              name: 'namespace',
              message: 'Enter namespace:',
              default: 'personal',
            },
          ]);
          namespace = answers.namespace;
        }
        
        // Upload skill
        const uploadSpinner = ora('Uploading skill...').start();
        try {
          const result = await uploadSkill(skillPath, namespace);
          uploadSpinner.succeed('Skill uploaded successfully!');
          
          console.log(chalk.green('\n🎉 Skill published successfully!'));
          console.log(chalk.blue(`   Name: ${result.skillName}`));
          console.log(chalk.blue(`   Version: ${result.version}`));
          console.log(chalk.blue(`   URL: ${result.url}`));
        } catch (error: any) {
          uploadSpinner.fail('Upload failed');
          console.error(chalk.red(`\nError: ${error.message}`));
          process.exit(1);
        }
      } catch (error: any) {
        console.error(chalk.red(`\nError: ${error.message}`));
        process.exit(1);
      }
    });
}

