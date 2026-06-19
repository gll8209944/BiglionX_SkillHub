import { 
  ClawHubManifest, 
  ClawHubSkill, 
  ClawHubSearchRequest, 
  ClawHubSearchResponse,
  ClawHubDownloadResponse 
} from './types';

/**
 * ClawHub 协议适配器
 * 将 Skill Hub 的数据格式转换为 ClawHub 兼容格式
 */
export class ClawHubAdapter {
  
  /**
   * 将 Skill Hub 技能转换为 ClawHub 清单格式
   */
  static convertToClawHubManifest(skill: any): ClawHubManifest {
    return {
      name: skill.name,
      version: skill.version,
      description: skill.description,
      author: skill.author,
      license: skill.license || 'MIT',
      repository: skill.repository,
      skills: [{
        name: skill.name,
        version: skill.version,
        description: skill.description,
        entryPoint: skill.entryPoint || 'index.js',
        dependencies: skill.dependencies || {},
      }],
    };
  }

  /**
   * 转换搜索结果为 ClawHub 格式
   */
  static convertSearchResults(skills: any[], total: number): ClawHubSearchResponse {
    return {
      skills: skills.map(skill => ({
        name: skill.name,
        version: skill.version,
        namespace: skill.namespace || 'public',
        description: skill.description,
        downloads: skill.downloads || 0,
        rating: skill.rating,
        tags: skill.tags || [],
        updatedAt: skill.updatedAt || new Date().toISOString(),
      })),
      total,
    };
  }

  /**
   * 生成下载响应
   */
  static createDownloadResponse(skill: any): ClawHubDownloadResponse {
    return {
      url: `${process.env.SKILLHUB_API_URL || 'https://skillhub.proclaw.cc'}/api/skills/${skill.name}/download?version=${skill.version}`,
      checksum: skill.checksum || '',
      size: skill.size || 0,
    };
  }

  /**
   * 解析 ClawHub 搜索请求
   */
  static parseSearchRequest(query: string, params: any): ClawHubSearchRequest {
    return {
      query,
      namespace: params.namespace,
      tag: params.tag,
      limit: parseInt(params.limit) || 20,
      offset: parseInt(params.offset) || 0,
    };
  }
}
