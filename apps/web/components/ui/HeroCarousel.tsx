'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Code, Zap, Globe, Package, Star, Shield } from 'lucide-react';

interface Slide {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  ctaText: string;
  ctaLink: string;
  icon: React.ReactNode;
  gradient: string;
  features: string[];
}

const slides: Slide[] = [
  {
    id: 1,
    title: 'SkillHub Search SDK',
    subtitle: '为您的应用集成强大的AI技能搜索',
    description: '功能完备、易于集成的NPM包，让开发者轻松地将SkillHub强大的搜索功能嵌入到自己的项目中',
    ctaText: '立即开始集成',
    ctaLink: '/dashboard/integration',
    icon: <Package className="w-16 h-16" />,
    gradient: 'from-blue-600 via-purple-600 to-pink-600',
    features: [
      '🔍 全文搜索 + 语义搜索',
      '⚡ 轻量级，仅依赖axios',
      '🎯 完整的TypeScript类型',
      '📦 3行代码即可使用'
    ]
  },
  {
    id: 2,
    title: '智能语义搜索',
    subtitle: '理解用户意图，不只是关键词匹配',
    description: '基于向量相似度的AI搜索技术，即使用户输入自然语言也能精准找到相关技能',
    ctaText: '立即开始集成',
    ctaLink: '/dashboard/integration',
    icon: <Zap className="w-16 h-16" />,
    gradient: 'from-purple-600 via-indigo-600 to-blue-600',
    features: [
      '🧠 AI驱动的语义理解',
      '💬 支持自然语言查询',
      '🎯 相似度评分展示',
      '⚡ 毫秒级响应速度'
    ]
  },
  {
    id: 3,
    title: '多框架支持',
    subtitle: 'React、Vue、Angular、Node.js全兼容',
    description: '无论您使用什么技术栈，都能轻松集成。提供完整的示例代码和文档',
    ctaText: '查看文档',
    ctaLink: '/docs/FRONTEND_INTEGRATION_GUIDE.md',
    icon: <Globe className="w-16 h-16" />,
    gradient: 'from-indigo-600 via-blue-600 to-cyan-600',
    features: [
      '⚛️ React / Next.js',
      '💚 Vue 3 / Nuxt',
      '🅰️ Angular',
      '🟢 Node.js / Express'
    ]
  },
  {
    id: 4,
    title: '开发者友好',
    subtitle: '完善的文档、丰富的示例、活跃的社区',
    description: '从快速开始到高级用法，从基础搜索到语义搜索，全方位的技术支持',
    ctaText: '浏览示例',
    ctaLink: 'https://github.com/skillhub/skillhub/tree/main/packages/search-sdk/examples',
    icon: <Code className="w-16 h-16" />,
    gradient: 'from-cyan-600 via-teal-600 to-green-600',
    features: [
      '📚 完整API文档',
      '💡 6个实战示例',
      '🐛 GitHub Issues支持',
      '💬 Discord社区'
    ]
  },
  {
    id: 5,
    title: '企业级品质',
    subtitle: '生产环境验证，稳定可靠',
    description: '经过大量生产环境验证，提供99.9%的可用性保证，支持高并发访问',
    ctaText: '立即开始集成',
    ctaLink: '/dashboard/integration',
    icon: <Shield className="w-16 h-16" />,
    gradient: 'from-green-600 via-emerald-600 to-teal-600',
    features: [
      '✅ 99.9% 可用性保证',
      '🔒 企业级安全保障',
      '📊 完善的监控告警',
      '🚀 支持高并发访问'
    ]
  },
  {
    id: 7,
    title: '开源免费',
    subtitle: '完全开源，免费使用，无隐藏费用',
    description: 'MIT许可证，可自由用于商业项目，无需支付任何费用，代码完全透明',
    ctaText: '立即开始集成',
    ctaLink: '/dashboard/integration',
    icon: <Star className="w-16 h-16" />,
    gradient: 'from-yellow-600 via-orange-600 to-red-600',
    features: [
      '🆓 完全免费使用',
      '📜 MIT开源协议',
      '💼 可用于商业项目',
      '🔍 代码完全透明'
    ]
  }
];

export default function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = () => {
    console.log('handleNext called, current:', currentSlide);
    setCurrentSlide((prev) => {
      const next = (prev + 1) % slides.length;
      console.log('Changing to:', next);
      return next;
    });
  };

  const handlePrev = () => {
    console.log('handlePrev called, current:', currentSlide);
    setCurrentSlide((prev) => {
      const prev_slide = (prev - 1 + slides.length) % slides.length;
      console.log('Changing to:', prev_slide);
      return prev_slide;
    });
  };

  const goToSlide = (index: number) => {
    if (index === currentSlide) return;
    setCurrentSlide(index);
  };

  // 自动轮播
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);

    return () => clearInterval(timer);
  }, []);

  const slide = slides[currentSlide];

  return (
    <div className="relative w-full overflow-hidden rounded-2xl shadow-2xl">
      {/* 背景渐变 */}
      <div 
        className={`absolute inset-0 bg-linear-to-br ${slide.gradient}`}
      />

      {/* 装饰性元素 */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-48 h-48 bg-white rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white rounded-full blur-3xl" />
      </div>

      {/* 主要内容 */}
      <div className="relative z-10 px-8 py-16 md:px-16 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* 左侧内容 */}
          <div className="text-white space-y-6">
            {/* 图标 */}
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl mb-4">
              {slide.icon}
            </div>

            {/* 标题 */}
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-3 leading-tight">
                {slide.title}
              </h2>
              <p className="text-xl md:text-2xl font-medium text-white/90">
                {slide.subtitle}
              </p>
            </div>

            {/* 描述 */}
            <p className="text-lg text-white/80 leading-relaxed max-w-xl">
              {slide.description}
            </p>

            {/* 特性列表 */}
            <div className="grid grid-cols-2 gap-3 pt-4">
              {slide.features.map((feature, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-2 text-sm text-white/90 bg-white/10 backdrop-blur-sm px-3 py-2 rounded-lg"
                >
                  <span>{feature}</span>
                </div>
              ))}
            </div>

            {/* CTA按钮 */}
            <div className="pt-6">
              <Link
                href={slide.ctaLink}
                className="inline-flex items-center px-8 py-4 bg-white text-gray-900 font-semibold rounded-xl hover:bg-gray-100 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                {slide.ctaText}
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </div>

          {/* 右侧代码预览 */}
          <div className="hidden lg:block">
            <div className="bg-gray-900/90 backdrop-blur-sm rounded-xl p-6 shadow-2xl border border-white/10">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="ml-2 text-xs text-gray-400">example.ts</span>
              </div>
              <pre className="text-sm text-gray-300 overflow-x-auto">
                <code>{`import { SearchSDK } from '@skillhub/search-sdk';

const sdk = new SearchSDK({
  apiUrl: 'https://api.skillhub.com'
});

// 全文搜索
const results = await sdk.search({
  query: 'python automation',
  page: 1,
  pageSize: 20
});

// 语义搜索
const semantic = await sdk.semanticSearch({
  query: '如何自动化处理Excel',
  limit: 10
});`}</code>
              </pre>
            </div>
          </div>
        </div>
      </div>

      {/* 导航按钮 */}
      <button
        onClick={handlePrev}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-all duration-200 hover:scale-110 z-20 cursor-pointer"
        aria-label="上一张"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={handleNext}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-all duration-200 hover:scale-110 z-20 cursor-pointer"
        aria-label="下一张"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* 指示器 */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`transition-all duration-300 rounded-full ${
              index === currentSlide
                ? 'w-8 h-3 bg-white'
                : 'w-3 h-3 bg-white/50 hover:bg-white/70'
            }`}
            aria-label={`跳转到第${index + 1}张`}
          />
        ))}
      </div>

      {/* 进度条 */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
        <div
          className="h-full bg-white transition-all duration-300"
          style={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
        />
      </div>
    </div>
  );
}
