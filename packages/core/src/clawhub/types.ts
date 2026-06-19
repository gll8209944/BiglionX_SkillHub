// ClawHub 协议类型定义

export interface ClawHubManifest {
  name: string;
  version: string;
  description?: string;
  author?: string;
  license?: string;
  repository?: string;
  skills?: ClawHubSkill[];
}

export interface ClawHubSkill {
  name: string;
  version: string;
  description?: string;
  entryPoint?: string;
  dependencies?: Record<string, string>;
}

export interface ClawHubSearchRequest {
  query: string;
  namespace?: string;
  tag?: string;
  limit?: number;
  offset?: number;
}

export interface ClawHubSearchResponse {
  skills: ClawHubSkillInfo[];
  total: number;
}

export interface ClawHubSkillInfo {
  name: string;
  version: string;
  namespace: string;
  description?: string;
  downloads: number;
  rating?: number;
  tags?: string[];
  updatedAt: string;
}

export interface ClawHubDownloadResponse {
  url: string;
  checksum: string;
  size: number;
}
