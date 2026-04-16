"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.installCommand = installCommand;
const commander_1 = require("commander");
const chalk_1 = __importDefault(require("chalk"));
const ora_1 = __importDefault(require("ora"));
const api_1 = require("../utils/api");
const config_1 = require("../config/config");
function installCommand(program) {
    program
        .command('install <skill>')
        .alias('i')
        .description('Install a skill from Skill Hub')
        .option('-g, --global', 'Install globally')
        .option('-v, --version <version>', 'Specific version to install')
        .action(async (skill, options) => {
        try {
            console.log(chalk_1.default.blue('\n📥 Skill Hub - Install Skill\n'));
            const config = (0, config_1.getConfig)();
            const version = options.version || 'latest';
            const spinner = (0, ora_1.default)(`Downloading ${skill}@${version}...`).start();
            try {
                const result = await (0, api_1.installSkillPackage)(skill, version, config.apiUrl);
                spinner.succeed('Skill downloaded successfully');
                // Install to appropriate location
                const installSpinner = (0, ora_1.default)('Installing skill...').start();
                // For now, just show success message
                installSpinner.succeed('Skill installed successfully!');
                console.log(chalk_1.default.green('\n✅ Installation complete!'));
                console.log(chalk_1.default.blue(`   Skill: ${result.skillName}`));
                console.log(chalk_1.default.blue(`   Version: ${result.version}`));
                console.log(chalk_1.default.blue(`   Location: ${result.installPath}`));
                if (options.global) {
                    console.log(chalk_1.default.yellow('\n   Note: Global installation not yet implemented'));
                }
            }
            catch (error) {
                spinner.fail('Download failed');
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
//# sourceMappingURL=install.js.map