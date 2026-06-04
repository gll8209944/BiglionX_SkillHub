'use client';

import DatabaseReconnecting from '@/components/ui/DatabaseReconnecting';

export default function SkillsPageError({ reset }: { reset: () => void }) {
  return <DatabaseReconnecting onRetry={reset} skipTimer={true} />;
}
