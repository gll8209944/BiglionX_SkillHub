// Mock Prisma Client for API tests
export const mockPrisma = {
  skill: {
    count: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    aggregate: jest.fn(),
    groupBy: jest.fn(),
  },
  namespace: {
    count: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  namespaceMember: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    delete: jest.fn(),
  },
  user: {
    count: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  review: {
    count: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findFirst: jest.fn(),
  },
  auditLog: {
    findMany: jest.fn(),
  },
};

// Mock the prisma module
jest.mock('@/lib/prisma', () => ({
  prisma: mockPrisma,
}));

// Mock auth
const mockAuthFn = jest.fn();
jest.mock('@/app/api/auth/[...nextauth]/route', () => ({
  auth: mockAuthFn,
}));

import { auth } from '@/app/api/auth/[...nextauth]/route';
export const mockAuth = auth as jest.MockedFunction<typeof auth>;
