/**
 * AdvancedFilterPanel 组件单元测试
 */

import { render, screen, fireEvent } from '@testing-library/react';
import AdvancedFilterPanel from '../AdvancedFilterPanel';

// Mock next/navigation
const mockPush = jest.fn();
const mockSearchParams = new URLSearchParams();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => mockSearchParams,
}));

describe('AdvancedFilterPanel', () => {
  const mockCategories = [
    { value: 'ai', label: 'AI/ML', count: 150 },
    { value: 'web', label: 'Web开发', count: 200 },
  ];

  const mockLanguages = [
    { value: 'python', label: 'Python' },
    { value: 'javascript', label: 'JavaScript' },
  ];

  const mockSources = [
    { value: 'github', label: 'GitHub' },
    { value: 'npm', label: 'NPM' },
  ];

  const mockLicenses = [
    { value: 'mit', label: 'MIT' },
    { value: 'apache', label: 'Apache 2.0' },
  ];

  beforeEach(() => {
    mockPush.mockClear();
    // 重置searchParams
    for (const key of Array.from(mockSearchParams.keys())) {
      mockSearchParams.delete(key);
    }
  });

  it('应该正确渲染高级筛选面板', () => {
    render(
      <AdvancedFilterPanel
        categories={mockCategories}
        languages={mockLanguages}
        sources={mockSources}
        licenses={mockLicenses}
      />
    );

    expect(screen.getByText('高级筛选')).toBeInTheDocument();
    expect(screen.getByText('排序方式')).toBeInTheDocument();
    expect(screen.getByText('应用筛选')).toBeInTheDocument();
  });

  it('应该显示分类筛选', () => {
    render(<AdvancedFilterPanel categories={mockCategories} />);

    expect(screen.getByText('分类')).toBeInTheDocument();
    expect(screen.getByText('AI/ML (150)')).toBeInTheDocument();
    expect(screen.getByText('Web开发 (200)')).toBeInTheDocument();
  });

  it('应该支持展开/收起高级选项', () => {
    render(
      <AdvancedFilterPanel
        categories={mockCategories}
        languages={mockLanguages}
      />
    );

    // 初始状态应该是收起的
    expect(screen.queryByText('编程语言')).not.toBeInTheDocument();

    // 点击展开
    const expandButton = screen.getByText('展开高级选项');
    fireEvent.click(expandButton);

    expect(screen.getByText('编程语言')).toBeInTheDocument();
    expect(screen.getByText('收起高级选项')).toBeInTheDocument();

    // 点击收起
    const collapseButton = screen.getByText('收起高级选项');
    fireEvent.click(collapseButton);

    expect(screen.queryByText('编程语言')).not.toBeInTheDocument();
  });

  it('应该在选择分类后应用筛选', () => {
    render(<AdvancedFilterPanel categories={mockCategories} />);

    const categoryLabel = screen.getByText('分类');
    const select = categoryLabel.nextElementSibling as HTMLSelectElement;
    fireEvent.change(select, { target: { value: 'ai' } });

    const applyButton = screen.getByText('应用筛选');
    fireEvent.click(applyButton);

    expect(mockPush).toHaveBeenCalledWith('/skills?category=ai&sortBy=relevance');
  });

  it('应该支持设置排序方式', () => {
    render(<AdvancedFilterPanel />);

    const sortSelect = screen.getByText('排序方式').nextElementSibling as HTMLSelectElement;
    fireEvent.change(sortSelect, { target: { value: 'quality' } });

    const applyButton = screen.getByText('应用筛选');
    fireEvent.click(applyButton);

    expect(mockPush).toHaveBeenCalledWith('/skills?sortBy=quality');
  });

  it('应该支持Stars范围筛选', () => {
    render(
      <AdvancedFilterPanel
        languages={mockLanguages}
      />
    );

    // 展开高级选项
    fireEvent.click(screen.getByText('展开高级选项'));

    const minStarsInput = screen.getAllByPlaceholderText('0')[0];
    const maxStarsInput = screen.getByPlaceholderText('不限');

    fireEvent.change(minStarsInput, { target: { value: '100' } });
    fireEvent.change(maxStarsInput, { target: { value: '1000' } });

    const applyButton = screen.getByText('应用筛选');
    fireEvent.click(applyButton);

    expect(mockPush).toHaveBeenCalledWith('/skills?minStars=100&maxStars=1000&sortBy=relevance');
  });

  it('应该支持日期范围筛选', () => {
    render(
      <AdvancedFilterPanel
        languages={mockLanguages}
      />
    );

    // 展开高级选项
    fireEvent.click(screen.getByText('展开高级选项'));

    // 查找date类型的输入框
    const dateInputs = document.querySelectorAll('input[type="date"]');
    expect(dateInputs.length).toBeGreaterThanOrEqual(2);
    
    // 设置日期
    fireEvent.change(dateInputs[0], { target: { value: '2024-01-01' } });

    const applyButton = screen.getByText('应用筛选');
    fireEvent.click(applyButton);

    expect(mockPush).toHaveBeenCalled();
  });

  it('应该支持质量评分筛选', () => {
    render(
      <AdvancedFilterPanel
        languages={mockLanguages}
      />
    );

    // 展开高级选项
    fireEvent.click(screen.getByText('展开高级选项'));

    const qualityLabel = screen.getByText('最低质量评分');
    const qualitySelect = qualityLabel.nextElementSibling as HTMLSelectElement;
    fireEvent.change(qualitySelect, { target: { value: '80' } });

    const applyButton = screen.getByText('应用筛选');
    fireEvent.click(applyButton);

    expect(mockPush).toHaveBeenCalledWith('/skills?minQuality=80&sortBy=relevance');
  });

  it('应该支持清除所有筛选', () => {
    // 设置初始URL参数
    mockSearchParams.set('category', 'ai');
    mockSearchParams.set('language', 'python');
    mockSearchParams.set('sortBy', 'quality');

    render(<AdvancedFilterPanel categories={mockCategories} languages={mockLanguages} />);

    const clearButton = screen.getByText('清除');
    fireEvent.click(clearButton);

    // 清除后只保留q参数（如果有的话）
    expect(mockPush).toHaveBeenCalledWith('/skills?');
  });

  it('应该在有激活筛选时显示清除按钮', () => {
    mockSearchParams.set('category', 'ai');
    mockSearchParams.set('sortBy', 'relevance');

    render(<AdvancedFilterPanel categories={mockCategories} />);

    expect(screen.getByText('清除')).toBeInTheDocument();
  });

  it('应该在没有激活筛选时隐藏清除按钮', () => {
    render(<AdvancedFilterPanel categories={mockCategories} />);

    expect(screen.queryByText('清除')).not.toBeInTheDocument();
  });

  it('应该显示活跃的筛选标签', () => {
    mockSearchParams.set('category', 'ai');
    mockSearchParams.set('language', 'python');
    mockSearchParams.set('sortBy', 'relevance');

    render(
      <AdvancedFilterPanel
        categories={mockCategories}
        languages={mockLanguages}
      />
    );

    expect(screen.getByText('当前筛选：')).toBeInTheDocument();
    expect(screen.getByText('AI/ML')).toBeInTheDocument();
  });

  it('应该支持从标签移除单个筛选', () => {
    mockSearchParams.set('category', 'ai');
    mockSearchParams.set('sortBy', 'relevance');

    render(<AdvancedFilterPanel categories={mockCategories} />);

    const removeButton = screen.getByText('×');
    fireEvent.click(removeButton);

    // 点击移除按钮后，应该更新内部状态，但不会立即跳转
    // 需要点击“应用筛选”才会跳转
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('应该保留搜索关键词q参数', () => {
    mockSearchParams.set('q', 'test query');

    render(<AdvancedFilterPanel categories={mockCategories} />);

    const categoryLabel = screen.getByText('分类');
    const select = categoryLabel.nextElementSibling as HTMLSelectElement;
    fireEvent.change(select, { target: { value: 'ai' } });

    const applyButton = screen.getByText('应用筛选');
    fireEvent.click(applyButton);

    expect(mockPush).toHaveBeenCalledWith('/skills?q=test+query&category=ai&sortBy=relevance');
  });

  it('应该在应用筛选时重置页码', () => {
    mockSearchParams.set('page', '5');

    render(<AdvancedFilterPanel categories={mockCategories} />);

    const categoryLabel = screen.getByText('分类');
    const select = categoryLabel.nextElementSibling as HTMLSelectElement;
    fireEvent.change(select, { target: { value: 'ai' } });

    const applyButton = screen.getByText('应用筛选');
    fireEvent.click(applyButton);

    // page参数应该被删除，但sortBy会保留
    expect(mockPush).toHaveBeenCalledWith('/skills?category=ai&sortBy=relevance');
  });

  it('应该支持许可证类型筛选', () => {
    render(
      <AdvancedFilterPanel
        licenses={mockLicenses}
      />
    );

    // 展开高级选项
    fireEvent.click(screen.getByText('展开高级选项'));

    const licenseLabel = screen.getByText('许可证类型');
    const licenseSelect = licenseLabel.nextElementSibling as HTMLSelectElement;
    fireEvent.change(licenseSelect, { target: { value: 'mit' } });

    const applyButton = screen.getByText('应用筛选');
    fireEvent.click(applyButton);

    expect(mockPush).toHaveBeenCalledWith('/skills?license=mit&sortBy=relevance');
  });

  it('应该支持数据源筛选', () => {
    render(
      <AdvancedFilterPanel
        sources={mockSources}
      />
    );

    // 展开高级选项
    fireEvent.click(screen.getByText('展开高级选项'));

    const sourceLabel = screen.getByText('数据源');
    const sourceSelect = sourceLabel.nextElementSibling as HTMLSelectElement;
    fireEvent.change(sourceSelect, { target: { value: 'github' } });

    const applyButton = screen.getByText('应用筛选');
    fireEvent.click(applyButton);

    expect(mockPush).toHaveBeenCalledWith('/skills?source=github&sortBy=relevance');
  });

  it('应该支持子分类筛选', () => {
    const mockSubcategories = [
      { value: 'llm', label: '大语言模型' },
      { value: 'cv', label: '计算机视觉' },
    ];

    render(
      <AdvancedFilterPanel
        subcategories={mockSubcategories}
      />
    );

    // 展开高级选项
    fireEvent.click(screen.getByText('展开高级选项'));

    const subcategoryLabel = screen.getByText('子分类');
    const subcategorySelect = subcategoryLabel.nextElementSibling as HTMLSelectElement;
    fireEvent.change(subcategorySelect, { target: { value: 'llm' } });

    const applyButton = screen.getByText('应用筛选');
    fireEvent.click(applyButton);

    expect(mockPush).toHaveBeenCalledWith('/skills?subcategory=llm&sortBy=relevance');
  });

  it('应该在空数组时不渲染对应的筛选项', () => {
    render(<AdvancedFilterPanel />);

    expect(screen.queryByText('分类')).not.toBeInTheDocument();
    expect(screen.queryByText('编程语言')).not.toBeInTheDocument();
    expect(screen.queryByText('数据源')).not.toBeInTheDocument();
    expect(screen.queryByText('许可证类型')).not.toBeInTheDocument();
  });
});
