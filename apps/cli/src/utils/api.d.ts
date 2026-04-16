export interface SkillSearchResult {
    name: string;
    version: string;
    namespace: string;
    description?: string;
    downloads?: number;
    rating?: number;
    tags?: string[];
}
export interface SkillUploadResult {
    skillName: string;
    version: string;
    url: string;
}
export interface SkillInstallResult {
    skillName: string;
    version: string;
    installPath: string;
}
export declare function searchSkills(query: string, options: {
    tag?: string;
    namespace?: string;
    sort?: string;
    apiUrl: string;
}): Promise<SkillSearchResult[]>;
export declare function uploadSkill(skillPath: string, namespace: string): Promise<SkillUploadResult>;
export declare function installSkillPackage(skillName: string, version: string, apiUrl: string): Promise<SkillInstallResult>;
//# sourceMappingURL=api.d.ts.map