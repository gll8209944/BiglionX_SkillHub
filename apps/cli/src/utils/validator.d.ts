export interface ValidationResult {
    valid: boolean;
    errors: string[];
}
export declare function validateSkillManifest(skillPath: string): Promise<ValidationResult>;
//# sourceMappingURL=validator.d.ts.map