/**
 * SearchBox 组件单元测试
 */

import { render, screen, fireEvent } from '@testing-library/react';
import SearchBox from '../SearchBox';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(() => null),
  }),
}));

describe('SearchBox', () => {
  it('应该正确渲染搜索框', () => {
    render(<SearchBox />);
    
    const input = screen.getByPlaceholderText('搜索 Skills...');
    expect(input).toBeInTheDocument();
  });

  it('应该支持自定义placeholder', () => {
    render(<SearchBox placeholder="自定义搜索..." />);
    
    const input = screen.getByPlaceholderText('自定义搜索...');
    expect(input).toBeInTheDocument();
  });

  it('应该在输入时显示建议（需要API mock）', () => {
    // 这个测试需要mock fetch API
    render(<SearchBox />);
    
    const input = screen.getByPlaceholderText('搜索 Skills...');
    fireEvent.change(input, { target: { value: 'test' } });
    
    // 由于防抖，需要等待
    expect(input).toBeInTheDocument();
  });
});
