import { render, screen } from '@testing-library/react';
import PageLoader from '../PageLoader';

describe('PageLoader 组件', () => {
  it('应该渲染默认的页面加载器', () => {
    render(<PageLoader />);
    
    expect(screen.getByText('加载中...')).toBeInTheDocument();
    
    const spinner = document.querySelector('svg');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass('animate-spin');
    expect(spinner).toHaveClass('h-12'); // 大尺寸
    expect(spinner).toHaveClass('w-12');
  });

  it('应该渲染自定义消息的页面加载器', () => {
    render(<PageLoader message="正在加载数据..." />);
    
    expect(screen.getByText('正在加载数据...')).toBeInTheDocument();
  });

  it('应该包含居中的布局结构', () => {
    render(<PageLoader />);
    
    const container = document.querySelector('.min-h-screen');
    expect(container).toBeInTheDocument();
    expect(container).toHaveClass('flex');
    expect(container).toHaveClass('items-center');
    expect(container).toHaveClass('justify-center');
    expect(container).toHaveClass('bg-gray-50');
  });

  it('应该包含文本居中的容器', () => {
    render(<PageLoader />);
    
    const textContainer = document.querySelector('.text-center');
    expect(textContainer).toBeInTheDocument();
  });

  it('应该在LoadingSpinner下方显示消息文本', () => {
    render(<PageLoader message="测试消息" />);
    
    const messageElement = screen.getByText('测试消息');
    expect(messageElement).toBeInTheDocument();
    expect(messageElement).toHaveClass('mt-4');
    expect(messageElement).toHaveClass('text-gray-600');
  });

  it('应该使用LoadingSpinner组件', () => {
    render(<PageLoader />);
    
    // PageLoader内部使用了LoadingSpinner，应该有大尺寸的spinner
    const spinner = document.querySelector('svg');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass('h-12');
    expect(spinner).toHaveClass('w-12');
  });
});