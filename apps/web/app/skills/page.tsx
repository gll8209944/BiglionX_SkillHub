import { Metadata } from 'next';
import PublicSkillsClient from './PublicSkillsClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Skill仓库 - SkillHub',
  description: '浏览和发现优秀的 AI Agent 技能',
};

interface SearchParams {
  q?: string;
  category?: string;
  subcategory?: string;
  language?: string;
  source?: string;
  license?: string;
  minQuality?: string;
  minStars?: string;
  maxStars?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  page?: string;
  semantic?: string;
  global?: string;
}

export default function PublicSkillsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  return <PublicSkillsClient searchParams={searchParams} />;
}
