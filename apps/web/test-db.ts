import { prisma } from './lib/prisma';

async function testDatabase() {
  console.log('🔍 Testing database connection...\n');

  try {
    // 测试连接
    await prisma.$connect();
    console.log('✅ Database connected successfully!\n');

    // 查询所有表
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `;

    console.log('📊 Tables in database:');
    console.table(tables);

    // 检查用户表
    const userCount = await prisma.user.count();
    console.log(`\n👥 Users count: ${userCount}`);

    // 检查 Skills 表
    const skillCount = await prisma.skill.count();
    console.log(`📦 Skills count: ${skillCount}`);

    // 检查命名空间表
    const namespaceCount = await prisma.namespace.count();
    console.log(`🏢 Namespaces count: ${namespaceCount}`);

    console.log('\n✅ All tests passed!');
  } catch (error) {
    console.error('❌ Database test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabase();
