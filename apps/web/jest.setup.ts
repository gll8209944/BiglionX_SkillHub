// 学习更多: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Polyfill for Web APIs (needed for NextRequest/NextResponse)
import { Request as NodeFetchRequest, Response as NodeFetchResponse } from 'node-fetch';

/* eslint-disable @typescript-eslint/no-explicit-any, no-var */
if (typeof global.Request === 'undefined') {
  (global as any).Request = NodeFetchRequest;
}
if (typeof global.Response === 'undefined') {
  (global as any).Response = NodeFetchResponse;
}
/* eslint-enable @typescript-eslint/no-explicit-any, no-var */

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
    };
  },
  useSearchParams() {
    return new URLSearchParams();
  },
  useParams() {
    return {};
  },
}));

// Mock next-auth
jest.mock('@/app/api/auth/[...nextauth]/route', () => ({
  auth: jest.fn(() => Promise.resolve(null)),
}));

// Suppress console errors during tests
const originalConsoleError = console.error;
console.error = (...args) => {
  // 忽略特定的警告信息
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('Warning:') || args[0].includes('not wrapped in act'))
  ) {
    return;
  }
  originalConsoleError(...args);
};
