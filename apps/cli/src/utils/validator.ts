import fs from 'fs-extra';
import path from 'path';
import { z } from 'zod';

// Skill manifest schema
const SkillManifestSchema = z.object({
  name: z.string().min(1),
  version: z.string().regex(/^\d+\.\d+\.\d+$/),
  description: z.string().optional(),
  author: z.string().optional(),
  namespace: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export async function validateSkillManifest(skillPath: string): Promise<ValidationResult> {
  const errors: string[] = [];
  
  try {
    // Check if path exists
    if (!await fs.pathExists(skillPath)) {
      return {
        valid: false,
        errors: [`Path does not exist: ${skillPath}`],
      };
    }
    
    // Look for skill.json or package.json
    let manifestPath = path.join(skillPath, 'skill.json');
    if (!await fs.pathExists(manifestPath)) {
      manifestPath = path.join(skillPath, 'package.json');
    }
    
    if (!await fs.pathExists(manifestPath)) {
      return {
        valid: false,
        errors: ['No skill.json or package.json found in the specified path'],
      };
    }
    
    // Read and parse manifest
    const manifestContent = await fs.readFile(manifestPath, 'utf-8');
    let manifest: any;
    
    try {
      manifest = JSON.parse(manifestContent);
    } catch (parseError) {
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
  } catch (error: any) {
    return {
      valid: false,
      errors: [`Validation error: ${error.message}`],
    };
  }
}
