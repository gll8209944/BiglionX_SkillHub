export interface Config {
    apiUrl: string;
    token?: string;
    defaultNamespace: string;
}
export declare function getConfig(): Config;
export declare function setConfig(key: keyof Config, value: string): Config;
export declare function getToken(): string | undefined;
//# sourceMappingURL=config.d.ts.map