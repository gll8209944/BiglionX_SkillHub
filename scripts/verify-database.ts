import { prisma } from '../apps/web/lib/prisma';

async function verifyDatabase() {
  console.log('🔍 Verifying database schema...\n');
  
  try {
    // Check if new tables exist
    const syncLogsCount = await prisma.syncLog.count();
    const crawlerTasksCount = await prisma.crawlerTask.count();
    
    console.log('✅ Database Tables:');
    console.log(`   - sync_logs: ${syncLogsCount} records`);
    console.log(`   - crawler_tasks: ${crawlerTasksCount} records`);
    
    // Check if new fields exist in skills table
    const skillsWithSource = await prisma.skill.count({
      where: {
        source: { not: null }
      }
    });
    
    const totalSkills = await prisma.skill.count();
    
    console.log('\n✅ Skills Table:');
    console.log(`   - Total skills: ${totalSkills}`);
    console.log(`   - Skills with external source: ${skillsWithSource}`);
    
    // Check table columns
    const columns = await prisma.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'skills' 
      AND column_name IN ('source', 'source_id', 'quality_score', 'star_count', 'languages')
      ORDER BY column_name;
    `;
    
    console.log('\n✅ New Columns in Skills Table:');
    (columns as Array<{ column_name: string; data_type: string }>).forEach((col) => {
      console.log(`   - ${col.column_name}: ${col.data_type}`);
    });
    
    console.log('\n✅ Database verification completed successfully!');
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Verification failed:', errorMessage);
  } finally {
    await prisma.$disconnect();
  }
}

verifyDatabase();
