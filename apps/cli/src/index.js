#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const chalk_1 = __importDefault(require("chalk"));
const package_json_1 = require("../package.json");
const publish_1 = require("./commands/publish");
const install_1 = require("./commands/install");
const search_1 = require("./commands/search");
const config_1 = require("./commands/config");
const program = new commander_1.Command();
program
    .name('skillhub')
    .description(chalk_1.default.blue('Skill Hub CLI - Manage AI Agent Skills'))
    .version(package_json_1.version);
// Register commands
(0, publish_1.publishCommand)(program);
(0, install_1.installCommand)(program);
(0, search_1.searchCommand)(program);
(0, config_1.configCommand)(program);
// Handle unknown commands
program.on('command:*', () => {
    console.error(chalk_1.default.red(`Invalid command: ${program.args.join(' ')}`));
    console.log(chalk_1.default.yellow('See --help for a list of available commands.'));
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
}
catch (error) {
    if (error.code !== 'commander.helpDisplayed') {
        console.error(chalk_1.default.red('Error:', error.message));
        process.exit(1);
    }
}
//# sourceMappingURL=index.js.map