import { prisma } from '../../lib/prisma';
import type { Prisma } from '@prisma/client';

/**
 * 数据源类型
 */
export type DataSourceType = 'github' | 'skillsmp' | 'gitlab' | 'custom';

/**
 * 爬虫配置接口
 */
export interface CrawlerConfigData {
  // 数据源配置
  dataSources: {
    github: {
      enabled: boolean;
      token?: string;
      searchQueries: string[];
      minStars: number;
      maxResults: number;
    };
    skillsmp: {
      enabled: boolean;
      apiKey?: string;
      baseUrl: string;
    };
    gitlab: {
      enabled: boolean;
      token?: string;
      baseUrl: string;
    };
    custom: {
      enabled: boolean;
      repositories: string[];
    };
  };

  // 采集策略
  strategy: {
    isSpecializedSearch: boolean; // 是否专项搜索
    batchSize: number; // 每次采集数量
    concurrentLimit: number; // 并发限制
    qualityThreshold: number; // 质量阈值 (0-100)
    languages: string[]; // 目标编程语言
    categories: string[]; // 目标分类
  };

  // 调度配置
  schedule: {
    enabled: boolean;
    cronExpression: string; // cron 表达式
    timezone: string;
    lastRunAt?: Date;
    nextRunAt?: Date;
  };

  // 过滤规则
  filters: {
    excludeArchived: boolean;
    minLastUpdate: string; // 最小更新时间 (ISO 8601)
    requireSkillMd: boolean; // 是否需要 SKILL.md 文件
    minDescriptionLength: number;
  };
}

/**
 * 默认配置
 */
const DEFAULT_CONFIG: CrawlerConfigData = {
  dataSources: {
    github: {
      enabled: true,
      searchQueries: [
        'skill.md',
        'agent skill',
        'ai tool',
        'llm framework',
        'autonomous agent',
        'chatbot',
        'langchain',
        'openai',
        'gpt',
        'rag',
        'claude',
        'copilot',
        'ai assistant',
        'mcp',
        'cursor',
        'windsurf',
        'cline',
      ],
      minStars: 30,
      maxResults: 50,
    },
    skillsmp: {
      enabled: false,
      baseUrl: 'https://api.skillsmp.com',
    },
    gitlab: {
      enabled: false,
      baseUrl: 'https://gitlab.com',
    },
    custom: {
      enabled: false,
      repositories: [],
    },
  },
  strategy: {
    isSpecializedSearch: false,
    batchSize: 20,
    concurrentLimit: 5,
    qualityThreshold: 60,
    languages: ['TypeScript', 'JavaScript', 'Python'],
    categories: ['ai_agent', 'llm_tools', 'automation'],
  },
  schedule: {
    enabled: false,
    cronExpression: '0 3 * * *', // 每天凌晨 3 点
    timezone: 'Asia/Shanghai',
  },
  filters: {
    excludeArchived: true,
    minLastUpdate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(), // 90天内更新
    requireSkillMd: true,
    minDescriptionLength: 50,
  },
};

/**
 * 爬虫配置服务
 */
export class CrawlerConfigService {
  /**
   * 获取当前配置
   */
  async getConfig(): Promise<CrawlerConfigData> {
    try {
      const config = await prisma.crawlerConfig.findUnique({
        where: { configKey: 'crawler_settings' },
      });

      if (!config) {
        // 如果不存在，创建默认配置
        await this.saveConfig(DEFAULT_CONFIG);
        return DEFAULT_CONFIG;
      }

      return config.configValue as unknown as CrawlerConfigData;
    } catch (error) {
      console.warn('⚠️ Database not available, using default configuration:', error);
      return DEFAULT_CONFIG;
    }
  }

  /**
   * 保存配置
   */
  async saveConfig(config: CrawlerConfigData): Promise<void> {
    await prisma.crawlerConfig.upsert({
      where: { configKey: 'crawler_settings' },
      update: {
        configValue: config as unknown as Prisma.InputJsonValue,
        updatedAt: new Date(),
      },
      create: {
        configKey: 'crawler_settings',
        configValue: config as unknown as Prisma.InputJsonValue,
        description: '爬虫系统配置',
        isActive: true,
      },
    });
  }

  /**
   * 更新部分配置
   */
  async updateConfig(partialConfig: Partial<CrawlerConfigData>): Promise<CrawlerConfigData> {
    const currentConfig = await this.getConfig();
    const updatedConfig = { ...currentConfig, ...partialConfig };
    await this.saveConfig(updatedConfig);
    return updatedConfig;
  }

  /**
   * 重置为默认配置
   */
  async resetToDefault(): Promise<CrawlerConfigData> {
    await this.saveConfig(DEFAULT_CONFIG);
    return DEFAULT_CONFIG;
  }

  /**
   * 启用/禁用定时任务
   */
  async toggleSchedule(enabled: boolean): Promise<CrawlerConfigData> {
    const config = await this.getConfig();
    config.schedule.enabled = enabled;
    await this.saveConfig(config);
    return config;
  }

  /**
   * 添加自定义仓库
   */
  async addCustomRepository(repoUrl: string): Promise<CrawlerConfigData> {
    const config = await this.getConfig();
    
    if (!config.dataSources.custom.repositories.includes(repoUrl)) {
      config.dataSources.custom.repositories.push(repoUrl);
      await this.saveConfig(config);
    }
    
    return config;
  }

  /**
   * 移除自定义仓库
   */
  async removeCustomRepository(repoUrl: string): Promise<CrawlerConfigData> {
    const config = await this.getConfig();
    config.dataSources.custom.repositories = config.dataSources.custom.repositories.filter(
      url => url !== repoUrl
    );
    await this.saveConfig(config);
    return config;
  }

  /**
   * 添加搜索查询
   */
  async addSearchQuery(query: string): Promise<CrawlerConfigData> {
    const config = await this.getConfig();
    
    if (!config.dataSources.github.searchQueries.includes(query)) {
      config.dataSources.github.searchQueries.push(query);
      await this.saveConfig(config);
    }
    
    return config;
  }

  /**
   * 移除搜索查询
   */
  async removeSearchQuery(query: string): Promise<CrawlerConfigData> {
    const config = await this.getConfig();
    config.dataSources.github.searchQueries = config.dataSources.github.searchQueries.filter(
      q => q !== query
    );
    await this.saveConfig(config);
    return config;
  }

  /**
   * 获取启用的数据源列表
   */
  async getEnabledDataSources(): Promise<DataSourceType[]> {
    const config = await this.getConfig();
    const enabled: DataSourceType[] = [];
    
    if (config.dataSources.github.enabled) enabled.push('github');
    if (config.dataSources.skillsmp.enabled) enabled.push('skillsmp');
    if (config.dataSources.gitlab.enabled) enabled.push('gitlab');
    if (config.dataSources.custom.enabled) enabled.push('custom');
    
    return enabled;
  }
}

// 单例实例
let instance: CrawlerConfigService | null = null;

export function getCrawlerConfigService(): CrawlerConfigService {
  if (!instance) {
    instance = new CrawlerConfigService();
  }
  return instance;
}
