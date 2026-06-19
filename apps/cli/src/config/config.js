"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConfig = getConfig;
exports.setConfig = setConfig;
exports.getToken = getToken;
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const os_1 = __importDefault(require("os"));
const CONFIG_DIR = path_1.default.join(os_1.default.homedir(), '.skillhub');
const CONFIG_FILE = path_1.default.join(CONFIG_DIR, 'config.json');
const DEFAULT_CONFIG = {
    apiUrl: process.env.SKILLHUB_API_URL || 'https://skillhub.proclaw.cc',
    defaultNamespace: 'personal',
};
function getConfig() {
    try {
        if (fs_extra_1.default.existsSync(CONFIG_FILE)) {
            const configData = fs_extra_1.default.readFileSync(CONFIG_FILE, 'utf-8');
            const userConfig = JSON.parse(configData);
            return { ...DEFAULT_CONFIG, ...userConfig };
        }
    }
    catch (error) {
        console.error('Warning: Failed to read config file, using defaults');
    }
    return DEFAULT_CONFIG;
}
function setConfig(key, value) {
    // Ensure config directory exists
    if (!fs_extra_1.default.existsSync(CONFIG_DIR)) {
        fs_extra_1.default.mkdirSync(CONFIG_DIR, { recursive: true });
    }
    const currentConfig = getConfig();
    const updatedConfig = { ...currentConfig, [key]: value };
    fs_extra_1.default.writeFileSync(CONFIG_FILE, JSON.stringify(updatedConfig, null, 2), 'utf-8');
    return updatedConfig;
}
function getToken() {
    const config = getConfig();
    return config.token || process.env.SKILLHUB_TOKEN;
}
//# sourceMappingURL=config.js.map