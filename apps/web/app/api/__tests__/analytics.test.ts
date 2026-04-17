import { NextRequest } from 'next/server';
import { GET } from '../analytics/overview/route';
import { mockPrisma } from './mocks';

// Mock auth
const mockAuth = jest.fn();
jest.mock('@/app/api/auth/[...nextauth]/route', () => ({
  auth: () => mockAuth(),
}));

describe('Analytics API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/analytics/overview', () => {
    it('应该拒绝未认证的请求', async () => {
      mockAuth.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/analytics/overview');
      const response = await GET(request);

      expect(response.status).toBe(401);
    });

    it('应该返回分析概览数据', async () => {
      mockAuth.mockResolvedValue({
        user: { id: 'admin1', email: 'admin@example.com' },
      });

      // Mock 所有 prisma 调用
      mockPrisma.skill.count.mockResolvedValue(100);
      mockPrisma.skill.aggregate.mockResolvedValueOnce({
        _sum: { downloadCount: 5000 },
      });
      mockPrisma.user.count.mockResolvedValue(200);
      mockPrisma.skill.aggregate.mockResolvedValueOnce({
        _avg: { rating: 4.5 },
      });
      mockPrisma.skill.groupBy.mockResolvedValue([
        { category: 'ai-agent', _count: 30 },
        { category: 'development', _count: 25 },
        { category: 'data', _count: 20 },
      ]);
      mockPrisma.skill.findMany.mockResolvedValue([
        {
          id: '1',
          name: 'Popular Skill',
          slug: 'popular-skill',
          downloadCount: 500,
          category: 'ai-agent',
        },
      ]);
      mockPrisma.auditLog.findMany.mockResolvedValue([
        { actorId: 'user1' },
        { actorId: 'user2' },
        { actorId: 'user3' },
      ]);

      const request = new NextRequest('http://localhost:3000/api/analytics/overview');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toMatchObject({
        totalSkills: 100,
        totalDownloads: 5000,
        totalUsers: 200,
        averageRating: 4.5,
        activeUsers: 3,
        skillsByCategory: expect.arrayContaining([
          expect.objectContaining({ category: 'ai-agent', count: 30 }),
        ]),
        topSkills: expect.arrayContaining([
          expect.objectContaining({ name: 'Popular Skill' }),
        ]),
        period: '30d',
      });
    });

    it('应该支持不同的时间周期', async () => {
      mockAuth.mockResolvedValue({
        user: { id: 'admin1', email: 'admin@example.com' },
      });

      mockPrisma.skill.count.mockResolvedValue(100);
      mockPrisma.skill.aggregate.mockResolvedValueOnce({ _sum: { downloadCount: 5000 } });
      mockPrisma.user.count.mockResolvedValue(200);
      mockPrisma.skill.aggregate.mockResolvedValueOnce({ _avg: { rating: 4.5 } });
      mockPrisma.skill.groupBy.mockResolvedValue([]);
      mockPrisma.skill.findMany.mockResolvedValue([]);
      mockPrisma.auditLog.findMany.mockResolvedValue([]);

      const request7d = new NextRequest('http://localhost:3000/api/analytics/overview?period=7d');
      await GET(request7d);

      const request90d = new NextRequest('http://localhost:3000/api/analytics/overview?period=90d');
      await GET(request90d);

      // 验证调用了正确的次数（每个请求都会调用这些方法）
      expect(mockPrisma.skill.count).toHaveBeenCalledTimes(4); // 2次总数 + 2次weeklyGrowth
    });

    it('应该计算周增长率', async () => {
      mockAuth.mockResolvedValue({
        user: { id: 'admin1', email: 'admin@example.com' },
      });

      mockPrisma.skill.count.mockResolvedValueOnce(100); // totalSkills
      mockPrisma.skill.count.mockResolvedValueOnce(10); // lastWeekSkills
      mockPrisma.skill.aggregate.mockResolvedValueOnce({ _sum: { downloadCount: 5000 } });
      mockPrisma.user.count.mockResolvedValue(200);
      mockPrisma.skill.aggregate.mockResolvedValueOnce({ _avg: { rating: 4.5 } });
      mockPrisma.skill.groupBy.mockResolvedValue([]);
      mockPrisma.skill.findMany.mockResolvedValue([]);
      mockPrisma.auditLog.findMany.mockResolvedValue([]);

      const request = new NextRequest('http://localhost:3000/api/analytics/overview');
      const response = await GET(request);
      const data = await response.json();

      expect(data.data.weeklyGrowth).toBe(10); // (10/100) * 100 = 10%
    });

    it('应该在总技能数为0时正确处理周增长率', async () => {
      mockAuth.mockResolvedValue({
        user: { id: 'admin1', email: 'admin@example.com' },
      });

      mockPrisma.skill.count.mockResolvedValueOnce(0); // totalSkills
      mockPrisma.skill.count.mockResolvedValueOnce(0); // lastWeekSkills
      mockPrisma.skill.aggregate.mockResolvedValueOnce({ _sum: { downloadCount: 0 } });
      mockPrisma.user.count.mockResolvedValue(0);
      mockPrisma.skill.aggregate.mockResolvedValueOnce({ _avg: { rating: null } });
      mockPrisma.skill.groupBy.mockResolvedValue([]);
      mockPrisma.skill.findMany.mockResolvedValue([]);
      mockPrisma.auditLog.findMany.mockResolvedValue([]);

      const request = new NextRequest('http://localhost:3000/api/analytics/overview');
      const response = await GET(request);
      const data = await response.json();

      expect(data.data.weeklyGrowth).toBe(0);
      expect(data.data.averageRating).toBe(0);
    });

    it('应该处理错误情况', async () => {
      mockAuth.mockResolvedValue({
        user: { id: 'admin1', email: 'admin@example.com' },
      });

      mockPrisma.skill.count.mockRejectedValue(new Error('Database error'));

      const request = new NextRequest('http://localhost:3000/api/analytics/overview');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
    });

    it('应该默认使用30天周期', async () => {
      mockAuth.mockResolvedValue({
        user: { id: 'admin1', email: 'admin@example.com' },
      });

      mockPrisma.skill.count.mockResolvedValue(100);
      mockPrisma.skill.aggregate.mockResolvedValueOnce({ _sum: { downloadCount: 5000 } });
      mockPrisma.user.count.mockResolvedValue(200);
      mockPrisma.skill.aggregate.mockResolvedValueOnce({ _avg: { rating: 4.5 } });
      mockPrisma.skill.groupBy.mockResolvedValue([]);
      mockPrisma.skill.findMany.mockResolvedValue([]);
      mockPrisma.auditLog.findMany.mockResolvedValue([]);

      const request = new NextRequest('http://localhost:3000/api/analytics/overview');
      const response = await GET(request);
      const data = await response.json();

      expect(data.data.period).toBe('30d');
    });
  });
});