// 测试爬虫配置 API
const testCrawlerConfigAPI = async () => {
  console.log('🧪 测试爬虫配置 API...\n');

  // 测试保存配置
  console.log('1️⃣ 测试保存配置...');
  try {
    const saveResponse = await fetch('http://localhost:3001/api/admin/crawler/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        config: {
          dataSources: {
            github: {
              enabled: true,
              searchQueries: ['skill.md', 'agent skill'],
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
          },
          schedule: {
            enabled: false,
            cronExpression: '0 3 * * *',
            timezone: 'Asia/Shanghai',
          },
          filters: {
            languages: ['TypeScript', 'JavaScript', 'Python'],
            requireSkillMd: true,
            excludeArchived: true,
          },
        },
      }),
    });

    if (saveResponse.ok) {
      const saveData = await saveResponse.json();
      console.log('✅ 保存配置成功:', saveData);
    } else {
      const errorData = await saveResponse.json();
      console.log('❌ 保存配置失败:', errorData);
      return;
    }
  } catch (error) {
    console.error('❌ 保存配置错误:', error);
    return;
  }

  // 测试获取配置
  console.log('\n2️⃣ 测试获取配置...');
  try {
    const getResponse = await fetch('http://localhost:3001/api/admin/crawler/config');
    
    if (getResponse.ok) {
      const getData = await getResponse.json();
      console.log('✅ 获取配置成功:');
      console.log(JSON.stringify(getData, null, 2));
    } else {
      const errorData = await getResponse.json();
      console.log('❌ 获取配置失败:', errorData);
    }
  } catch (error) {
    console.error('❌ 获取配置错误:', error);
  }

  console.log('\n✨ 测试完成！');
};

testCrawlerConfigAPI();
