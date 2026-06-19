"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateSkillManifest = validateSkillManifest;
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const zod_1 = require("zod");
// Skill manifest schema
const SkillManifestSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    version: zod_1.z.string().regex(/^\d+\.\d+\.\d+$/),
    description: zod_1.z.string().optional(),
    author: zod_1.z.string().optional(),
    namespace: zod_1.z.string().optional(),
    tags: zod_1.z.array(zod_1.z.string()).optional(),
});
async function validateSkillManifest(skillPath) {
    const errors = [];
    try {
        // Check if path exists
        if (!await fs_extra_1.default.pathExists(skillPath)) {
            return {
                valid: false,
                errors: [`Path does not exist: ${skillPath}`],
            };
        }
        // Look for skill.json or package.json
        let manifestPath = path_1.default.join(skillPath, 'skill.json');
        if (!await fs_extra_1.default.pathExists(manifestPath)) {
            manifestPath = path_1.default.join(skillPath, 'package.json');
        }
        if (!await fs_extra_1.default.pathExists(manifestPath)) {
            return {
                valid: false,
                errors: ['No skill.json or package.json found in the specified path'],
            };
        }
        // Read and parse manifest
        const manifestContent = await fs_extra_1.default.readFile(manifestPath, 'utf-8');
        let manifest;
        try {
            manifest = JSON.parse(manifestContent);
        }
        catch (parseError) {
            return {
                valid: false,
                errors: ['Invalid JSON in manifest file'],
            };
        }
        // Validate against schema
        const result = SkillManifestSchema.safeParse(manifest);
        if (!result.success) {
            result.error.issues.forEach(issue => {
                errors.push(`${issue.path.join('.')}: ${issue.message}`);
            });
        }
        return {
            valid: errors.length === 0,
            errors,
        };
    }
    catch (error) {
        return {
            valid: false,
            errors: [`Validation error: ${error.message}`],
        };
    }
}
//# sourceMappingURL=validator.js.map