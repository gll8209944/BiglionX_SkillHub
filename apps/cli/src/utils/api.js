"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchSkills = searchSkills;
exports.uploadSkill = uploadSkill;
exports.installSkillPackage = installSkillPackage;
const axios_1 = __importDefault(require("axios"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const config_1 = require("../config/config");
async function searchSkills(query, options) {
    try {
        const params = { q: query };
        if (options.tag)
            params.tag = options.tag;
        if (options.namespace)
            params.namespace = options.namespace;
        if (options.sort)
            params.sort = options.sort;
        const response = await axios_1.default.get(`${options.apiUrl}/api/skills/search`, {
            params,
        });
        return response.data.skills || [];
    }
    catch (error) {
        throw new Error(`Search failed: ${error.response?.data?.message || error.message}`);
    }
}
async function uploadSkill(skillPath, namespace) {
    const token = (0, config_1.getToken)();
    if (!token) {
        throw new Error('Authentication token not found. Please run `skillhub config token <your-token>`');
    }
    try {
        // Read skill manifest
        let manifestPath = path_1.default.join(skillPath, 'skill.json');
        if (!await fs_extra_1.default.pathExists(manifestPath)) {
            manifestPath = path_1.default.join(skillPath, 'package.json');
        }
        if (!await fs_extra_1.default.pathExists(manifestPath)) {
            throw new Error('No skill.json or package.json found');
        }
        const manifestContent = await fs_extra_1.default.readFile(manifestPath, 'utf-8');
        const manifest = JSON.parse(manifestContent);
        // Create form data for upload
        const formData = new FormData();
        formData.append('namespace', namespace);
        formData.append('manifest', manifestContent);
        // Add skill files
        const files = await fs_extra_1.default.readdir(skillPath);
        for (const file of files) {
            if (file !== 'node_modules' && file !== '.git') {
                const filePath = path_1.default.join(skillPath, file);
                const stats = await fs_extra_1.default.stat(filePath);
                if (stats.isFile()) {
                    const fileContent = await fs_extra_1.default.readFile(filePath);
                    formData.append('files', new Blob([fileContent]), file);
                }
            }
        }
        // Upload to API
        const response = await axios_1.default.post(`${process.env.SKILLHUB_API_URL || 'https://skillhub.proclaw.cc'}/api/skills/upload`, formData, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'multipart/form-data',
            },
        });
        return {
            skillName: manifest.name,
            version: manifest.version,
            url: response.data.url,
        };
    }
    catch (error) {
        throw new Error(`Upload failed: ${error.response?.data?.message || error.message}`);
    }
}
async function installSkillPackage(skillName, version, apiUrl) {
    try {
        // Download skill package
        const response = await axios_1.default.get(`${apiUrl}/api/skills/${skillName}/download`, {
            params: { version },
            responseType: 'arraybuffer',
        });
        // Create installation directory
        const installDir = path_1.default.join(process.cwd(), 'skills', skillName);
        await fs_extra_1.default.ensureDir(installDir);
        // For now, just create a placeholder
        // In a real implementation, this would extract the downloaded package
        const packageJson = {
            name: skillName,
            version: version,
            description: 'Installed skill',
            installedAt: new Date().toISOString(),
        };
        await fs_extra_1.default.writeFile(path_1.default.join(installDir, 'package.json'), JSON.stringify(packageJson, null, 2));
        return {
            skillName,
            version,
            installPath: installDir,
        };
    }
    catch (error) {
        throw new Error(`Installation failed: ${error.response?.data?.message || error.message}`);
    }
}
//# sourceMappingURL=api.js.map