import { render, screen, fireEvent } from '@testing-library/react';
import Alert from '../Alert';

describe('Alert 组件', () => {
  it('应该渲染默认的信息类型警告', () => {
    render(<Alert message="这是一条信息" />);
    
    expect(screen.getByText('这是一条信息')).toBeInTheDocument();
    
    const alert = document.querySelector('.bg-blue-50');
    expect(alert).toBeInTheDocument();
  });

  it('应该渲染成功类型的警告', () => {
    render(<Alert type="success" message="操作成功" />);
    
    expect(screen.getByText('操作成功')).toBeInTheDocument();
    
    const alert = document.querySelector('.bg-green-50');
    expect(alert).toBeInTheDocument();
  });

  it('应该渲染错误类型的警告', () => {
    render(<Alert type="error" message="发生错误" />);
    
    expect(screen.getByText('发生错误')).toBeInTheDocument();
    
    const alert = document.querySelector('.bg-red-50');
    expect(alert).toBeInTheDocument();
  });

  it('应该渲染警告类型的警告', () => {
    render(<Alert type="warning" message="注意警告" />);
    
    expect(screen.getByText('注意警告')).toBeInTheDocument();
    
    const alert = document.querySelector('.bg-yellow-50');
    expect(alert).toBeInTheDocument();
  });

  it('应该渲染带标题的警告', () => {
    render(<Alert title="提示" message="这是一条带标题的信息" />);
    
    expect(screen.getByText('提示')).toBeInTheDocument();
    expect(screen.getByText('这是一条带标题的信息')).toBeInTheDocument();
  });

  it('应该渲染关闭按钮当提供onClose回调时', () => {
    const handleClose = jest.fn();
    render(<Alert message="可关闭的警告" onClose={handleClose} />);
    
    const closeButton = screen.getByRole('button');
    expect(closeButton).toBeInTheDocument();
    
    fireEvent.click(closeButton);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('不应该渲染关闭按钮当未提供onClose回调时', () => {
    render(<Alert message="不可关闭的警告" />);
    
    const buttons = screen.queryAllByRole('button');
    expect(buttons).toHaveLength(0);
  });

  it('应该应用自定义类名', () => {
    render(<Alert message="自定义样式" className="custom-alert-class" />);
    
    const alert = document.querySelector('.custom-alert-class');
    expect(alert).toBeInTheDocument();
  });

  it('应该为不同类型的警告应用正确的图标路径', () => {
    const { rerender } = render(<Alert type="success" message="成功" />);
    let icon = document.querySelector('svg path');
    expect(icon).toHaveAttribute('d', 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z');

    rerender(<Alert type="error" message="错误" />);
    icon = document.querySelector('svg path');
    expect(icon).toHaveAttribute('d', 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z');

    rerender(<Alert type="warning" message="警告" />);
    icon = document.querySelector('svg path');
    expect(icon).toHaveAttribute('d', 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z');

    rerender(<Alert type="info" message="信息" />);
    icon = document.querySelector('svg path');
    expect(icon).toHaveAttribute('d', 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z');
  });
});