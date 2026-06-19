"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.configCommand = configCommand;
const commander_1 = require("commander");
const chalk_1 = __importDefault(require("chalk"));
const inquirer_1 = __importDefault(require("inquirer"));
const config_1 = require("../config/config");
function configCommand(program) {
    program
        .command('config [key] [value]')
        .description('Manage CLI configuration')
        .action(async (key, value) => {
        try {
            console.log(chalk_1.default.blue('\n⚙️  Skill Hub - Configuration\n'));
            const config = (0, config_1.getConfig)();
            // If no key provided, show all config
            if (!key) {
                console.log(chalk_1.default.blue('Current Configuration:\n'));
                console.log(chalk_1.default.cyan('  API URL:'), config.apiUrl);
                console.log(chalk_1.default.cyan('  Token:'), config.token ? '********' : 'Not set');
                console.log(chalk_1.default.cyan('  Default Namespace:'), config.defaultNamespace || 'personal');
                console.log('');
                return;
            }
            // If key provided but no value, show that key
            if (key && !value) {
                const configValue = config[key];
                if (configValue !== undefined) {
                    console.log(chalk_1.default.cyan(`${key}:`), configValue);
                }
                else {
                    console.log(chalk_1.default.yellow(`${key}: Not set`));
                }
                return;
            }
            // Set the configuration value
            if (key && value) {
                const updatedConfig = (0, config_1.setConfig)(key, value);
                console.log(chalk_1.default.green(`\n✅ Configuration updated!`));
                console.log(chalk_1.default.cyan(`${key}:`), updatedConfig[key]);
                return;
            }
        }
        catch (error) {
            console.error(chalk_1.default.red(`\nError: ${error.message}`));
            process.exit(1);
        }
    });
}
//# sourceMappingURL=config.js.map