"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchCommand = searchCommand;
const commander_1 = require("commander");
const chalk_1 = __importDefault(require("chalk"));
const ora_1 = __importDefault(require("ora"));
const api_1 = require("../utils/api");
const config_1 = require("../config/config");
function searchCommand(program) {
    program
        .command('search <query>')
        .alias('s')
        .description('Search for skills')
        .option('--tag <tag>', 'Filter by tag')
        .option('--namespace <namespace>', 'Filter by namespace')
        .option('--sort <sort>', 'Sort by (downloads, rating, updated)', 'downloads')
        .action(async (query, options) => {
        try {
            console.log(chalk_1.default.blue('\n🔍 Skill Hub - Search Skills\n'));
            const config = (0, config_1.getConfig)();
            const spinner = (0, ora_1.default)('Searching...').start();
            try {
                const results = await (0, api_1.searchSkills)(query, {
                    tag: options.tag,
                    namespace: options.namespace,
                    sort: options.sort,
                    apiUrl: config.apiUrl,
                });
                spinner.succeed(`Found ${results.length} skill(s)`);
                if (results.length === 0) {
                    console.log(chalk_1.default.yellow('\nNo skills found.'));
                    return;
                }
                console.log(chalk_1.default.blue('\nResults:\n'));
                results.forEach((skill, index) => {
                    console.log(chalk_1.default.cyan(`${index + 1}. ${skill.name}`));
                    console.log(chalk_1.default.gray(`   Version: ${skill.version}`));
                    console.log(chalk_1.default.gray(`   Namespace: ${skill.namespace}`));
                    console.log(chalk_1.default.gray(`   Description: ${skill.description || 'N/A'}`));
                    console.log(chalk_1.default.gray(`   Downloads: ${skill.downloads || 0}`));
                    console.log(chalk_1.default.gray(`   Rating: ${skill.rating ? skill.rating.toFixed(1) : 'N/A'}`));
                    console.log(chalk_1.default.gray(`   Tags: ${(skill.tags || []).join(', ')}`));
                    console.log('');
                });
                console.log(chalk_1.default.yellow('\nTip: Use `skillhub install <skill-name>` to install a skill'));
            }
            catch (error) {
                spinner.fail('Search failed');
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
//# sourceMappingURL=search.js.map