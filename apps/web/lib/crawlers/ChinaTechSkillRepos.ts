/**
 * 阿里、京东、腾讯相关的高价值AI/Skill仓库列表
 * 
 * 这些仓库包含SKILL.md文件或AI Agent相关工具
 * 将被添加到SkillHub的爬取范围中
 */

export const CHINA_TECH_SKILL_REPOS = [
  // ========== 阿里巴巴 (Alibaba) ==========
  
  // 1. Spring AI Alibaba - 官方AI框架
  {
    repo: 'alibaba/spring-ai-alibaba',
    reason: 'Spring AI Alibaba官方项目，包含多个AI Agent Skills',
    priority: 'high'
  },
  
  // 2. ModelScope - 阿里魔搭社区
  {
    repo: 'modelscope/modelscope',
    reason: '阿里魔搭模型社区，包含大量AI模型和技能',
    priority: 'high'
  },
  
  // 3. Qwen-Agent - 通义千问Agent框架
  {
    repo: 'QwenLM/Qwen-Agent',
    reason: '通义千问官方Agent框架',
    priority: 'high'
  },
  
  // 4. DashScope SDK
  {
    repo: 'alibaba/dashscope-sdk-python',
    reason: '阿里云灵积SDK，提供AI能力调用',
    priority: 'medium'
  },
  
  // 5. Alibaba Cloud Skills
  {
    repo: 'aliyun/alibabacloud-bigdata-skills',
    reason: '阿里云大数据Skills集合',
    priority: 'medium'
  },
  
  // 6. Alicloud Skills
  {
    repo: 'cinience/alicloud-skills',
    reason: '阿里云相关Skills',
    priority: 'medium'
  },
  
  // 7. Alibaba Development Manual Skills
  {
    repo: 'yanhaoluo0/AlibabaDevelopmentManualSkills',
    reason: '阿里开发手册Skills',
    priority: 'low'
  },
  
  // ========== 腾讯 (Tencent) ==========
  
  // 8. Tencent CloudBase Skills
  {
    repo: 'TencentCloudBase/cloudbase-skills',
    reason: '腾讯云云开发AI Agent Skills',
    priority: 'high'
  },
  
  // 9. Tencent RTC Skills
  {
    repo: 'Tencent-RTC/tencent-rtc-skills',
    reason: '腾讯实时通信Skills',
    priority: 'medium'
  },
  
  // 10. Tencent Docs Markdown Skill
  {
    repo: 'Wscats/tencent-docs-markdown',
    reason: '腾讯文档Markdown命令行工具和Agent Skill',
    priority: 'medium'
  },
  
  // 11. Tencent EdgeOne Agent Plugins
  {
    repo: 'Tencent/tencent-edgeone-agent-plugins',
    reason: '腾讯云EdgeOne Agent插件',
    priority: 'medium'
  },
  
  // 12. Lexiang MCP Skill
  {
    repo: 'tencent-lexiang/lexiang-mcp-skill',
    reason: '腾讯乐享MCP Skill',
    priority: 'low'
  },
  
  // 13. TKE Stack Skill
  {
    repo: 'tkestack/tke-skill',
    reason: '腾讯云Kubernetes引擎Skills',
    priority: 'low'
  },
  
  // 14. Hunyuan - 腾讯混元大模型
  {
    repo: 'Tencent/Hunyuan',
    reason: '腾讯混元大模型项目',
    priority: 'high'
  },
  
  // 15. Self-Evolving Agent
  {
    repo: 'Tencent/SelfEvolvingAgent',
    reason: '腾讯自进化Agent研究',
    priority: 'medium'
  },
  
  // 16. TAT Agent
  {
    repo: 'Tencent/tat-agent',
    reason: '腾讯自动化测试Agent',
    priority: 'medium'
  },
  
  // ========== 京东 (JD) ==========
  
  // 注：京东公开的AI/Skill项目相对较少
  // 以下是有潜力的仓库
  
  // 17. JD AI Open Platform (如果有)
  // 需要进一步搜索确认
  
  // ========== 其他中国科技公司 ==========
  
  // 18. MateClaw - 基于OpenClaw的中国AI工具
  {
    repo: 'matevip/mateclaw',
    reason: '中国版OpenClaw AI工具集',
    priority: 'medium'
  },
  
  // 19. ToolJoy A股 Lite - 腾讯数据源
  {
    repo: 'zionLyl/tooljoy-cn-lite',
    reason: 'A股实时行情+技术分析(Tencent单源)，OpenClaw Skill',
    priority: 'medium'
  },
  
  // 20. Tonghuashun iFinD Skill
  {
    repo: 'Etherstrings/tonghuashun-ifind-skill',
    reason: '同花顺iFinD金融数据Skill，支持腾讯fallback',
    priority: 'medium'
  },
];

/**
 * 获取所有高优先级仓库
 */
export function getHighPriorityRepos() {
  return CHINA_TECH_SKILL_REPOS.filter(repo => repo.priority === 'high');
}

/**
 * 获取所有中优先级仓库
 */
export function getMediumPriorityRepos() {
  return CHINA_TECH_SKILL_REPOS.filter(repo => repo.priority === 'medium');
}

/**
 * 获取所有低优先级仓库
 */
export function getLowPriorityRepos() {
  return CHINA_TECH_SKILL_REPOS.filter(repo => repo.priority === 'low');
}

/**
 * 获取所有仓库URL列表（用于批量爬取）
 */
export function getAllRepoUrls() {
  return CHINA_TECH_SKILL_REPOS.map(
    item => `https://github.com/${item.repo}`
  );
}

/**
 * 按公司分组
 */
export function getReposByCompany() {
  const grouped: {
    alibaba: typeof CHINA_TECH_SKILL_REPOS;
    tencent: typeof CHINA_TECH_SKILL_REPOS;
    jd: typeof CHINA_TECH_SKILL_REPOS;
    other: typeof CHINA_TECH_SKILL_REPOS;
  } = {
    alibaba: [],
    tencent: [],
    jd: [],
    other: []
  };
  
  CHINA_TECH_SKILL_REPOS.forEach(item => {
    const repoLower = item.repo.toLowerCase();
    if (repoLower.includes('alibaba') || repoLower.includes('aliyun') || repoLower.includes('qwen') || repoLower.includes('modelscope')) {
      grouped.alibaba.push(item);
    } else if (repoLower.includes('tencent') || repoLower.includes('hunyuan')) {
      grouped.tencent.push(item);
    } else if (repoLower.includes('jd') || repoLower.includes('jingdong')) {
      grouped.jd.push(item);
    } else {
      grouped.other.push(item);
    }
  });
  
  return grouped;
}

// 导出统计信息
export const STATS = {
  total: CHINA_TECH_SKILL_REPOS.length,
  high: getHighPriorityRepos().length,
  medium: getMediumPriorityRepos().length,
  low: getLowPriorityRepos().length,
  byCompany: (() => {
    const grouped = getReposByCompany();
    return {
      alibaba: grouped.alibaba.length,
      tencent: grouped.tencent.length,
      jd: grouped.jd.length,
      other: grouped.other.length
    };
  })()
};
