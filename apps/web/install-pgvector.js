const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function installPgvector() {
  // 从环境变量获取数据库连接
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL 环境变量未设置');
    console.log('请确保 .env.local 文件中包含 DATABASE_URL');
    process.exit(1);
  }

  console.log('🔌 连接到数据库...');
  console.log(`数据库URL: ${databaseUrl.substring(0, 50)}...`);

  const client = new Client({
    connectionString: databaseUrl,
    ssl: {
      rejectUnauthorized: false // Neon需要SSL
    }
  });

  try {
    await client.connect();
    console.log('✅ 数据库连接成功');

    // 读取SQL文件
    const sqlPath = path.join(__dirname, 'prisma', 'install-pgvector.sql');
    const sql = fs.readFileSync(sqlPath, 'utf-8');

    console.log('\n📋 执行pgvector安装脚本...');
    
    // 分割SQL语句并逐个执行
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    for (const statement of statements) {
      try {
        const result = await client.query(statement);
        
        if (result.rows && result.rows.length > 0) {
          console.log('\n查询结果:');
          console.table(result.rows);
        } else {
          console.log('✓ 执行成功');
        }
      } catch (error) {
        console.error(`✗ 执行失败: ${error.message}`);
        if (error.message.includes('could not open extension control file')) {
          console.error('\n⚠️  错误: pgvector扩展在您的Neon数据库中不可用');
          console.error('可能的原因:');
          console.error('1. Neon当前计划不支持pgvector扩展');
          console.error('2. 需要升级到支持扩展的计划');
          console.error('\n建议方案:');
          console.error('- 联系Neon支持确认pgvector可用性');
          console.error('- 或考虑使用其他支持pgvector的PostgreSQL服务');
          console.error('- 或使用外部向量数据库（如Pinecone、Weaviate）');
        }
        throw error;
      }
    }

    console.log('\n✅ pgvector扩展安装完成！');
    
    // 验证安装 - 列出所有扩展
    console.log('\n📊 检查已安装的扩展:');
    const allExtensions = await client.query(`
      SELECT extname, extversion 
      FROM pg_extension 
      ORDER BY extname
    `);
    
    console.table(allExtensions.rows);
    
    const vectorExt = allExtensions.rows.find(ext => ext.extname === 'vector');
    if (vectorExt) {
      console.log('\n✅ pgvector扩展已成功安装！');
      console.log(`   版本: ${vectorExt.extversion}`);
    } else {
      console.warn('\n⚠️  警告: pgvector扩展未找到');
      console.warn('   可能Neon数据库不支持pgvector扩展');
      console.warn('\n   建议方案:');
      console.warn('   1. 联系Neon支持确认pgvector可用性');
      console.warn('   2. 考虑使用Supabase或其他支持pgvector的服务');
      console.warn('   3. 或使用外部向量数据库（Pinecone、Weaviate等）');
    }

  } catch (error) {
    console.error('\n❌ 安装失败:', error.message);
    process.exit(1);
  } finally {
    await client.end();
    console.log('\n🔌 数据库连接已关闭');
  }
}

// 加载环境变量
require('dotenv').config({ path: '.env.local' });

installPgvector();
