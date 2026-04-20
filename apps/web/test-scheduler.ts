import { getScheduler } from './lib/services/TaskScheduler';

console.log('Testing Task Scheduler...');

try {
  const scheduler = getScheduler();
  console.log('Scheduler instance created');
  
  // Check status
  const status = scheduler.getStatus();
  console.log('Scheduler status:', status);
  
  console.log('✅ Task Scheduler is working correctly');
} catch (error) {
  const errorMessage = error instanceof Error ? error.message : 'Unknown error';
  const errorStack = error instanceof Error ? error.stack : 'No stack trace';
  console.error('❌ Task Scheduler error:', errorMessage);
  console.error(errorStack);
}