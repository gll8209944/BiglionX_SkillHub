import fs from 'fs-extra';
import path from 'path';
import os from 'os';

export interface Config {
  apiUrl: string;
  token?: string;
  defaultNamespace: string;
}

const CONFIG_DIR = path.join(os.homedir(), '.skillhub');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

const DEFAULT_CONFIG: Config = {
  apiUrl: process.env.SKILLHUB_API_URL || 'https://skillhub.proclaw.cc',
  defaultNamespace: 'personal',
};

export function getConfig(): Config {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const configData = fs.readFileSync(CONFIG_FILE, 'utf-8');
      const userConfig = JSON.parse(configData);
      return { ...DEFAULT_CONFIG, ...userConfig };
    }
  } catch (error) {
    console.error('Warning: Failed to read config file, using defaults');
  }
  
  return DEFAULT_CONFIG;
}

export function setConfig(key: keyof Config, value: string): Config {
  // Ensure config directory exists
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
  }
  
  const currentConfig = getConfig();
  const updatedConfig = { ...currentConfig, [key]: value };
  
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(updatedConfig, null, 2), 'utf-8');
  
  return updatedConfig;
}

export function getToken(): string | undefined {
  const config = getConfig();
  return config.token || process.env.SKILLHUB_TOKEN;
}
