/**
 * 分类结果接口
 */
export interface ClassificationResult {
  category: string;      // 主分类
  subcategory?: string;  // 子分类（可选）
  confidence: number;    // 置信度 (0-100)
}

/**
 * 智能分类器 - 基于多个维度对 Skills 进行分类
 */
export class SmartClassifier {
  /**
   * 综合分类 - 考虑描述、标签、语言等多个因素
   * @returns 分类结果（包含主分类、子分类和置信度）
   */
  classify(skill: {
    name: string;
    description: string | null;
    tags: string[] | null | undefined;
    languages: string[] | null | undefined;
  }): ClassificationResult {
    const name = skill.name.toLowerCase();
    const description = (skill.description || '').toLowerCase();
    const tags = (skill.tags as string[] || []).map(t => t.toLowerCase());
    const languages = (skill.languages as string[] || []).map(l => l.toLowerCase());
    
    // 合并所有文本用于分析
    const allText = `${name} ${description} ${tags.join(' ')} ${languages.join(' ')}`;
    
    // 按优先级检查分类
    const classifiers = [
      { category: 'ai_ml', check: this.isAIML.bind(this), getSubcategory: this.getAIMLSubcategory.bind(this) },
      { category: 'automation', check: this.isAutomation.bind(this), getSubcategory: this.getAutomationSubcategory.bind(this) },
      { category: 'security', check: this.isSecurity.bind(this), getSubcategory: undefined },
      { category: 'devops', check: this.isDevOps.bind(this), getSubcategory: undefined },
      { category: 'data_analytics', check: this.isDataAnalytics.bind(this), getSubcategory: this.getDataSubcategory.bind(this) },
      { category: 'web_mobile', check: this.isWebMobile.bind(this), getSubcategory: this.getWebMobileSubcategory.bind(this) },
      { category: 'communication', check: this.isCommunication.bind(this), getSubcategory: undefined },
      { category: 'business', check: this.isBusiness.bind(this), getSubcategory: undefined },
      { category: 'productivity', check: this.isProductivity.bind(this), getSubcategory: undefined },
      { category: 'development', check: this.isDevelopment.bind(this), getSubcategory: this.getDevSubcategory.bind(this) },
    ];
    
    for (const { category, check, getSubcategory } of classifiers) {
      if (check(allText, name, description, tags, languages)) {
        // 计算置信度
        const confidence = this.calculateConfidence(allText, category);
        
        // 获取子分类（如果支持）
        const subcategory = getSubcategory ? getSubcategory(allText, name, description, tags, languages) : undefined;
        
        return {
          category,
          subcategory,
          confidence,
        };
      }
    }
    
    return {
      category: 'general',
      confidence: 50,
    };
  }
  
  /**
   * AI & Machine Learning - 更精确的AI相关关键词
   */
  private isAIML(text: string, _name: string, _desc: string, _tags: string[], _langs: string[]): boolean {
    // 核心AI/ML关键词（高优先级）
    const coreAIKeywords = [
      'llm', 'large language model', 'gpt-', 'chatgpt',
      'machine learning', 'deep learning', 'neural network',
      'nlp', 'natural language processing',
      'computer vision', 'image recognition',
      'rag', 'retrieval augmented generation',
      'embedding', 'vector database', 'vector search',
      'fine-tuning', 'fine tuning', 'model training',
      'inference engine', 'model serving',
      'ollama', 'vllm', 'text-generation-inference',
      'huggingface transformers', 'pytorch', 'tensorflow',
      'stable diffusion', 'diffusion model',
      'whisper', 'speech recognition', 'text to speech',
      'langchain', 'llamaindex', 'semantic kernel',
      'autogen', 'crewai', 'agent framework',
    ];
    
    // 检查是否有核心AI关键词
    const hasCoreAI = coreAIKeywords.some(keyword => text.includes(keyword));
    
    if (hasCoreAI) {
      return true;
    }
    
    // 通用AI关键词（需要更多上下文）
    const generalAIKeywords = [
      'ai assistant', 'ai agent', 'autonomous agent',
      'copilot', 'code completion', 'ai-powered',
      'prompt engineering', 'prompt template',
      'claude code', 'openai api', 'anthropic',
    ];
    
    // 如果有通用AI关键词，并且文本长度足够（避免误判）
    return generalAIKeywords.some(keyword => text.includes(keyword)) && text.length > 50;
  }
  
  /**
   * Development Tools
   */
  private isDevelopment(text: string, _name: string, _desc: string, _tags: string[], _langs: string[]): boolean {
    const devKeywords = [
      'code', 'coding', 'programming', 'developer',
      'ide', 'editor', 'vscode', 'vim', 'emacs',
      'debug', 'debugger', 'lint', 'linter',
      'compiler', 'interpreter', 'transpiler',
      'framework', 'library', 'sdk', 'api',
      'cli', 'command line', 'terminal',
      'git', 'version control',
      'testing', 'unit test', 'integration test',
      'documentation', 'docs', 'api reference',
      'boilerplate', 'template', 'starter',
      'typescript', 'javascript', 'python', 'rust', 'go', 'java',
      'react', 'vue', 'angular', 'next.js', 'svelte',
      'node.js', 'express', 'fastapi', 'django', 'flask',
    ];
    
    return devKeywords.some(keyword => text.includes(keyword));
  }
  
  /**
   * Data & Analytics
   */
  private isDataAnalytics(text: string, _name: string, _desc: string, _tags: string[], _langs: string[]): boolean {
    const dataKeywords = [
      'database', 'sql', 'nosql', 'postgresql', 'mysql', 'mongodb',
      'data pipeline', 'etl', 'data warehouse',
      'analytics', 'dashboard', 'visualization', 'chart',
      'business intelligence', 'bi',
      'data processing', 'data transformation',
      'pandas', 'numpy', 'scipy',
      'jupyter', 'notebook',
      'csv', 'json', 'parquet', 'avro',
      'data scraping', 'web scraping', 'crawler',
      'excel', 'spreadsheet',
    ];
    
    return dataKeywords.some(keyword => text.includes(keyword));
  }
  
  /**
   * Automation & Workflow
   */
  private isAutomation(text: string, _name: string, _desc: string, _tags: string[], _langs: string[]): boolean {
    const automationKeywords = [
      'automation', 'automate', 'workflow',
      'zapier', 'n8n', 'make.com', 'integromat',
      'trigger', 'action', 'integration',
      'scheduled', 'cron', 'scheduler',
      'bot', 'robot', 'rpa',
      'task automation', 'process automation',
      'if-this-then-that', 'ifttt',
      'webhook', 'event-driven',
    ];
    
    return automationKeywords.some(keyword => text.includes(keyword));
  }
  
  /**
   * Communication
   */
  private isCommunication(text: string, _name: string, _desc: string, _tags: string[], _langs: string[]): boolean {
    const commKeywords = [
      'chat', 'messaging', 'message',
      'email', 'mail', 'smtp',
      'slack', 'discord', 'telegram', 'wechat', 'whatsapp',
      'video call', 'voice call', 'conference',
      'notification', 'alert',
      'social media', 'twitter', 'facebook', 'linkedin',
      'rss', 'feed',
      'comment', 'forum', 'community',
    ];
    
    return commKeywords.some(keyword => text.includes(keyword));
  }
  
  /**
   * Business & Finance
   */
  private isBusiness(text: string, _name: string, _desc: string, _tags: string[], _langs: string[]): boolean {
    const businessKeywords = [
      'finance', 'financial', 'accounting', 'invoice',
      'crm', 'customer relationship',
      'erp', 'enterprise resource',
      'project management', 'task management',
      'hr', 'human resources', 'recruitment',
      'sales', 'marketing', 'seo',
      'ecommerce', 'shopify', 'woocommerce',
      'payment', 'stripe', 'paypal',
      'inventory', 'supply chain',
      'reporting', 'kpi', 'metric',
    ];
    
    return businessKeywords.some(keyword => text.includes(keyword));
  }
  
  /**
   * Security
   */
  private isSecurity(text: string, _name: string, _desc: string, _tags: string[], _langs: string[]): boolean {
    const securityKeywords = [
      'security', 'cybersecurity', 'pentest', 'penetration',
      'vulnerability', 'exploit', 'cve',
      'authentication', 'authorization', 'oauth', 'jwt',
      'encryption', 'decryption', 'cipher',
      'firewall', 'vpn', 'proxy',
      'malware', 'antivirus', 'ransomware',
      'scanning', 'audit', 'compliance',
      'password', 'secret', 'credential',
    ];
    
    return securityKeywords.some(keyword => text.includes(keyword));
  }
  
  /**
   * DevOps & Infrastructure
   */
  private isDevOps(text: string, _name: string, _desc: string, _tags: string[], _langs: string[]): boolean {
    const devopsKeywords = [
      'docker', 'container', 'kubernetes', 'k8s',
      'ci/cd', 'continuous integration', 'continuous deployment',
      'jenkins', 'github actions', 'gitlab ci',
      'terraform', 'ansible', 'puppet', 'chef',
      'aws', 'azure', 'gcp', 'cloud',
      'monitoring', 'observability', 'prometheus', 'grafana',
      'logging', 'elk', 'splunk',
      'deployment', 'infrastructure', 'iac',
      'serverless', 'lambda', 'edge computing',
    ];
    
    return devopsKeywords.some(keyword => text.includes(keyword));
  }
  
  /**
   * Web & Mobile Development - 更具体的Web/移动开发关键词
   */
  private isWebMobile(text: string, _name: string, _desc: string, _tags: string[], _langs: string[]): boolean {
    const webMobileKeywords = [
      'website', 'web app', 'web application', 'webpage',
      'mobile app', 'ios app', 'android app', 'flutter', 'react native',
      'responsive design', 'pwa', 'progressive web app',
      'frontend framework', 'ui component', 'design system',
      'html5', 'css3', 'sass', 'scss', 'tailwind css',
      'landing page', 'portfolio website', 'blog platform',
      'ecommerce website', 'online store',
    ];
    
    // 需要更明确的Web/Mobile关键词，避免与通用backend冲突
    return webMobileKeywords.some(keyword => text.includes(keyword));
  }
  
  /**
   * Productivity
   */
  private isProductivity(text: string, _name: string, _desc: string, _tags: string[], _langs: string[]): boolean {
    const productivityKeywords = [
      'productivity', 'efficiency', 'time management',
      'note', 'notes', 'knowledge base', 'obsidian', 'notion',
      'todo', 'task list', 'checklist',
      'calendar', 'schedule', 'reminder',
      'bookmark', 'favorite', 'collection',
      'search', 'find', 'discovery',
      'organize', 'organization', 'filing',
      'habit', 'tracker', 'goal',
      'focus', 'pomodoro', 'timer',
    ];
    
    return productivityKeywords.some(keyword => text.includes(keyword));
  }
  
  // ==================== 子分类方法 ====================
  
  /**
   * AI/ML 子分类
   */
  private getAIMLSubcategory(text: string, _name: string, _desc: string, _tags: string[], _langs: string[]): string | undefined {
    if (text.includes('agent') || text.includes('autonomous') || text.includes('crewai') || text.includes('autogen')) {
      return 'ai_agent'; // AI代理
    }
    if (text.includes('llm') || text.includes('language model') || text.includes('gpt') || text.includes('chat')) {
      return 'llm_tools'; // LLM工具
    }
    if (text.includes('langchain') || text.includes('llamaindex') || text.includes('framework')) {
      return 'ml_framework'; // ML框架
    }
    if (text.includes('vision') || text.includes('image') || text.includes('diffusion')) {
      return 'computer_vision'; // 计算机视觉
    }
    if (text.includes('speech') || text.includes('voice') || text.includes('whisper') || text.includes('tts')) {
      return 'speech_audio'; // 语音处理
    }
    return undefined;
  }
  
  /**
   * Automation 子分类
   */
  private getAutomationSubcategory(text: string, _name: string, _desc: string, _tags: string[], _langs: string[]): string | undefined {
    if (text.includes('workflow') || text.includes('n8n') || text.includes('zapier')) {
      return 'workflow_automation'; // 工作流自动化
    }
    if (text.includes('bot') || text.includes('robot') || text.includes('rpa')) {
      return 'rpa_bot'; // RPA机器人
    }
    if (text.includes('scheduled') || text.includes('cron') || text.includes('scheduler')) {
      return 'task_scheduling'; // 任务调度
    }
    return undefined;
  }
  
  /**
   * Data Analytics 子分类
   */
  private getDataSubcategory(text: string, _name: string, _desc: string, _tags: string[], _langs: string[]): string | undefined {
    if (text.includes('database') || text.includes('sql') || text.includes('nosql')) {
      return 'database'; // 数据库
    }
    if (text.includes('analytics') || text.includes('dashboard') || text.includes('visualization')) {
      return 'data_viz'; // 数据可视化
    }
    if (text.includes('scraping') || text.includes('crawler') || text.includes('spider')) {
      return 'web_scraping'; // 网络爬虫
    }
    return undefined;
  }
  
  /**
   * Web/Mobile 子分类
   */
  private getWebMobileSubcategory(text: string, _name: string, _desc: string, _tags: string[], _langs: string[]): string | undefined {
    if (text.includes('mobile') || text.includes('ios') || text.includes('android') || text.includes('flutter')) {
      return 'mobile_app'; // 移动应用
    }
    if (text.includes('frontend') || text.includes('ui') || text.includes('component')) {
      return 'frontend'; // 前端开发
    }
    if (text.includes('ecommerce') || text.includes('store') || text.includes('shop')) {
      return 'ecommerce'; // 电商
    }
    return undefined;
  }
  
  /**
   * Development 子分类
   */
  private getDevSubcategory(text: string, _name: string, _desc: string, _tags: string[], _langs: string[]): string | undefined {
    if (text.includes('ide') || text.includes('editor') || text.includes('vscode') || text.includes('vim')) {
      return 'dev_tools'; // 开发工具
    }
    if (text.includes('testing') || text.includes('test') || text.includes('unit test')) {
      return 'testing'; // 测试工具
    }
    if (text.includes('documentation') || text.includes('docs') || text.includes('api reference')) {
      return 'documentation'; // 文档工具
    }
    if (text.includes('cli') || text.includes('command line') || text.includes('terminal')) {
      return 'cli_tools'; // CLI工具
    }
    return undefined;
  }
  
  /**
   * 计算置信度
   */
  private calculateConfidence(text: string, category: string): number {
    let confidence = 70; // 基础置信度
    
    // 根据文本长度调整（更长的描述通常更准确）
    if (text.length > 200) confidence += 10;
    if (text.length > 500) confidence += 5;
    
    // 根据关键词匹配数量调整
    const keywordCounts = this.countKeywordMatches(text, category);
    if (keywordCounts > 5) confidence += 10;
    else if (keywordCounts > 3) confidence += 5;
    
    // 上限100
    return Math.min(confidence, 100);
  }
  
  /**
   * 统计关键词匹配数量
   */
  private countKeywordMatches(text: string, category: string): number {
    const keywordMap: Record<string, string[]> = {
      'ai_ml': ['llm', 'machine learning', 'ai', 'gpt', 'agent'],
      'development': ['code', 'programming', 'developer', 'typescript', 'javascript'],
      'automation': ['automation', 'workflow', 'bot', 'scheduled'],
      'data_analytics': ['database', 'analytics', 'data', 'visualization'],
      'web_mobile': ['web', 'mobile', 'frontend', 'react', 'vue'],
    };
    
    const keywords = keywordMap[category] || [];
    return keywords.filter(kw => text.includes(kw)).length;
  }
}
