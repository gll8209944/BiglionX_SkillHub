import { SkillsMPSkill } from '../crawlers/SkillsMPConnector';
import { ClassificationResult } from '../utils/SmartClassifier';

/**
 * SkillHub Skill 数据结构（部分字段，用于创建/更新）
 */
export interface SkillHubSkillData {
  // 基本信息
  name: string;
  slug: string;
  description?: string;
  version?: string;
  
  // 来源信息
  source: string;
  sourceId: string;
  sourceUrl?: string;
  
  // 作者信息
  authorName?: string;
  authorUrl?: string;
  
  // 分类和标签
  category: string | ClassificationResult; // 支持字符串或完整分类结果
  subcategory?: string; // 子分类
  confidence?: number; // 分类置信度
  tags?: string[];
  languages?: string[];
  
  // 质量指标
  qualityScore?: number;
  downloadCount?: number;
  starCount?: number;
  
  // 技术信息
  permissions?: Record<string, unknown>;
  dependencies?: Record<string, string>;
  compatibility?: Record<string, unknown>;
  
  // 文件信息
  packageUrl?: string;
  documentationUrl?: string;
  repositoryUrl?: string;
  
  // 时间戳
  updatedAt?: Date;
}

/**
 * SkillsMP 到 SkillHub 的数据转换器
 * 
 * 负责将 SkillsMP 的数据格式转换为 SkillHub 的标准格式
 */
export class SkillsMPTransformer {
  /**
   * 将单个 SkillsMP Skill 转换为 SkillHub 格式
   */
  transform(skill: SkillsMPSkill): SkillHubSkillData {
    return {
      // 基本信息
      name: skill.name,
      slug: this.generateSlug(skill.name),
      description: skill.description,
      version: skill.version,
      
      // 来源信息
      source: 'skillsmp',
      sourceId: skill.id,
      sourceUrl: skill.documentation_url || skill.repository_url,
      
      // 作者信息
      authorName: skill.author,
      authorUrl: `https://github.com/${skill.author}`,
      
      // 分类和标签
      category: skill.category,
      tags: skill.tags || this.extractTagsFromDescription(skill.description),
      languages: skill.languages,
      
      // 质量指标
      qualityScore: this.calculateQualityScore(skill),
      downloadCount: skill.downloads,
      starCount: skill.stars,
      
      // 技术信息
      permissions: skill.permissions,
      dependencies: skill.dependencies,
      
      // 文件链接
      packageUrl: skill.repository_url,
      documentationUrl: skill.documentation_url,
      repositoryUrl: skill.repository_url,
      
      // 时间戳
      updatedAt: new Date(skill.updated_at),
    };
  }

  /**
   * 批量转换 Skills
   */
  transformBatch(skills: SkillsMPSkill[]): SkillHubSkillData[] {
    return skills.map(skill => this.transform(skill));
  }

  /**
   * 生成 URL 友好的 slug
   */
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 255); // 限制长度
  }

  /**
   * 从描述中提取标签
   */
  private extractTagsFromDescription(description: string): string[] {
    if (!description) return [];
    
    const tags: string[] = [];
    const lowerDesc = description.toLowerCase();
    
    // 常见技能类型关键词
    const keywordMap: Record<string, string[]> = {
      'ai': ['ai', 'artificial intelligence'],
      'automation': ['automation', 'automate'],
      'workflow': ['workflow', 'workflows'],
      'integration': ['integration', 'integrate'],
      'search': ['search', 'finding'],
      'analysis': ['analysis', 'analyze'],
      'management': ['management', 'manage'],
      'communication': ['communication', 'chat', 'message'],
      'productivity': ['productivity', 'efficient'],
      'development': ['development', 'coding', 'programming'],
    };
    
    for (const [category, keywords] of Object.entries(keywordMap)) {
      if (keywords.some(keyword => lowerDesc.includes(keyword))) {
        tags.push(category);
      }
    }
    
    return tags.slice(0, 10); // 最多10个标签
  }

  /**
   * 计算质量评分（0-100）
   * 
   * 基于以下因素：
   - Stars 数量 (40%)
   - Downloads 数量 (30%)
   - 最近更新时间 (20%)
   - 描述完整性 (10%)
   */
  private calculateQualityScore(skill: SkillsMPSkill): number {
    let score = 0;
    
    // Stars 评分 (0-40分)
    const starsScore = Math.min(skill.stars / 100, 1) * 40;
    score += starsScore;
    
    // Downloads 评分 (0-30分)
    const downloadsScore = Math.min(skill.downloads / 1000, 1) * 30;
    score += downloadsScore;
    
    // 活跃度评分 (0-20分)
    const updateDate = new Date(skill.updated_at);
    const daysSinceUpdate = (Date.now() - updateDate.getTime()) / (1000 * 60 * 60 * 24);
    const activityScore = Math.max(0, 1 - daysSinceUpdate / 365) * 20; // 1年内更新得满分
    score += activityScore;
    
    // 描述完整性 (0-10分)
    const descriptionScore = skill.description && skill.description.length > 50 ? 10 : 5;
    score += descriptionScore;
    
    return Math.round(score);
  }

  /**
   * 验证转换后的数据
   */
  validate(skillData: SkillHubSkillData): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!skillData.name || skillData.name.trim().length === 0) {
      errors.push('Name is required');
    }
    
    if (!skillData.slug || skillData.slug.trim().length === 0) {
      errors.push('Slug is required');
    }
    
    if (!skillData.sourceId) {
      errors.push('Source ID is required');
    }
    
    // 如果描述过长，自动截断而不是报错
    if (skillData.description && skillData.description.length > 5000) {
      console.warn(`⚠️  Description too long for ${skillData.name}, truncating from ${skillData.description.length} to 5000 characters`);
      skillData.description = skillData.description.substring(0, 4997) + '...';
    }
    
    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * 批量验证
   */
  validateBatch(skillsData: SkillHubSkillData[]): { 
    valid: SkillHubSkillData[]; 
    invalid: { data: SkillHubSkillData; errors: string[] }[] 
  } {
    const valid: SkillHubSkillData[] = [];
    const invalid: { data: SkillHubSkillData; errors: string[] }[] = [];
    
    for (const skillData of skillsData) {
      const validation = this.validate(skillData);
      if (validation.valid) {
        valid.push(skillData);
      } else {
        invalid.push({ data: skillData, errors: validation.errors });
      }
    }
    
    return { valid, invalid };
  }
}
