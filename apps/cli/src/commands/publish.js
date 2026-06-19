"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.publishCommand = publishCommand;
const commander_1 = require("commander");
const chalk_1 = __importDefault(require("chalk"));
const ora_1 = __importDefault(require("ora"));
const inquirer_1 = __importDefault(require("inquirer"));
const validator_1 = require("../utils/validator");
const api_1 = require("../utils/api");
function publishCommand(program) {
    program
        .command('publish [path]')
        .description('Publish a skill to Skill Hub')
        .option('-n, --namespace <namespace>', 'Namespace for the skill')
        .option('--dry-run', 'Validate without publishing')
        .action(async (path, options) => {
        try {
            const skillPath = path || process.cwd();
            console.log(chalk_1.default.blue('\n📦 Skill Hub - Publish Skill\n'));
            // Validate skill manifest
            const spinner = (0, ora_1.default)('Validating skill manifest...').start();
            const validationResult = await (0, validator_1.validateSkillManifest)(skillPath);
            if (!validationResult.valid) {
                spinner.fail('Validation failed');
                console.error(chalk_1.default.red('\nValidation errors:'));
                validationResult.errors.forEach(err => {
                    console.error(chalk_1.default.red(`  - ${err}`));
                });
                process.exit(1);
            }
            spinner.succeed('Skill manifest is valid');
            if (options.dryRun) {
                console.log(chalk_1.default.green('\n✅ Dry run completed successfully!'));
                console.log(chalk_1.default.yellow('Use without --dry-run to actually publish.'));
                return;
            }
            // Ask for namespace if not provided
            let namespace = options.namespace;
            if (!namespace) {
                const answers = await inquirer_1.default.prompt([
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
            const uploadSpinner = (0, ora_1.default)('Uploading skill...').start();
            try {
                const result = await (0, api_1.uploadSkill)(skillPath, namespace);
                uploadSpinner.succeed('Skill uploaded successfully!');
                console.log(chalk_1.default.green('\n🎉 Skill published successfully!'));
                console.log(chalk_1.default.blue(`   Name: ${result.skillName}`));
                console.log(chalk_1.default.blue(`   Version: ${result.version}`));
                console.log(chalk_1.default.blue(`   URL: ${result.url}`));
            }
            catch (error) {
                uploadSpinner.fail('Upload failed');
                console.error(chalk_1.default.red(`\nError: ${error.message}`));
                process.exit(1);
            }
        }
        catch (error) {
            console.error(chalk_1.default.red(`\nError: ${error.message}`));
            process.exit(1);
        }
    });
}
//# sourceMappingURL=publish.js.map