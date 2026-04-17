import { render } from '@testing-library/react';
import LoadingSpinner from '../LoadingSpinner';

describe('LoadingSpinner 组件', () => {
  it('应该渲染默认的加载旋转器', () => {
    render(<LoadingSpinner />);
    
    const spinner = document.querySelector('svg');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass('animate-spin');
    expect(spinner).toHaveClass('h-8'); // 默认中等尺寸
    expect(spinner).toHaveClass('w-8');
    expect(spinner).toHaveClass('text-blue-600'); // 默认颜色
  });

  it('应该渲染小尺寸的加载旋转器', () => {
    render(<LoadingSpinner size="sm" />);
    
    const spinner = document.querySelector('svg');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass('h-4');
    expect(spinner).toHaveClass('w-4');
  });

  it('应该渲染大尺寸的加载旋转器', () => {
    render(<LoadingSpinner size="lg" />);
    
    const spinner = document.querySelector('svg');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass('h-12');
    expect(spinner).toHaveClass('w-12');
  });

  it('应该应用自定义颜色', () => {
    render(<LoadingSpinner color="text-red-500" />);
    
    const spinner = document.querySelector('svg');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass('text-red-500');
  });

  it('应该应用自定义类名', () => {
    render(<LoadingSpinner className="custom-class" />);
    
    const container = document.querySelector('.custom-class');
    expect(container).toBeInTheDocument();
  });

  it('应该包含正确的SVG结构', () => {
    render(<LoadingSpinner />);
    
    const circle = document.querySelector('circle');
    const path = document.querySelector('path');
    
    expect(circle).toBeInTheDocument();
    expect(path).toBeInTheDocument();
    expect(circle).toHaveClass('opacity-25');
    expect(path).toHaveClass('opacity-75');
  });
});