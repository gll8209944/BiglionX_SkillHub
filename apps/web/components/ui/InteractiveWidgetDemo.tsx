'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Package, Zap, ArrowRight, X, Code, Layers, Sparkles, Play, CheckCircle } from 'lucide-react';

interface InteractiveWidgetDemoProps {
  className?: string;
}

export default function InteractiveWidgetDemo({ className = '' }: InteractiveWidgetDemoProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [activeFeature, setActiveFeature] = useState(0);

  if (!isVisible) return null;

  const features = [
    {
      icon: <Zap className="w-5 h-5" />,
      title: '智能搜索',
      desc: '语义理解 + 关键词匹配',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: <Layers className="w-5 h-5" />,
      title: '本地管理',
      desc: 'CRUD操作 + 数据持久化',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: <Package className="w-5 h-5" />,
      title: '一键发布',
      desc: '同步到SkillHub平台',
      color: 'from-orange-500 to-red-500',
    },
  ];

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* 渐变背景 */}
      <div className="absolute inset-0 bg-linear-to-r from-indigo-600 via-purple-600 to-pink-600 opacity-95" />
      
      {/* 动态光效 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-yellow-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* 关闭按钮 */}
      <button
        onClick={() => setIsVisible(false)}
        className="absolute right-4 top-4 z-10 p-2 hover:bg-white/20 rounded-lg transition-all duration-200 group"
        aria-label="关闭"
      >
        <X className="w-5 h-5 text-white/80 group-hover:text-white transition-colors" />
      </button>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* 左侧：内容区 */}
          <div className="space-y-6">
            {/* 标题区 */}
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl shadow-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-white">
                  SkillHub Widget
                </h2>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-yellow-400 text-yellow-900 mt-1">
                  ✨ 全新发布 v1.0
                </span>
              </div>
            </div>

            {/* 描述 */}
            <p className="text-lg text-white/90 leading-relaxed">
              一行代码集成完整的 Skill 商店到您的应用中，支持搜索、管理和发布功能
            </p>

            {/* 特性轮播 */}
            <div className="space-y-3">
              {features.map((feature, index) => (
                <button
                  key={index}
                  onClick={() => setActiveFeature(index)}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-300 ${
                    activeFeature === index
                      ? 'bg-white/20 backdrop-blur-sm border-2 border-white/40 shadow-lg scale-105'
                      : 'bg-white/10 backdrop-blur-sm border-2 border-transparent hover:bg-white/15'
                  }`}
                >
                  <div className={`shrink-0 w-10 h-10 rounded-lg bg-linear-to-br ${feature.color} flex items-center justify-center text-white shadow-md`}>
                    {feature.icon}
                  </div>
                  <div className="text-left flex-1">
                    <div className="font-semibold text-white">{feature.title}</div>
                    <div className="text-sm text-white/80">{feature.desc}</div>
                  </div>
                  {activeFeature === index && (
                    <CheckCircle className="w-5 h-5 text-green-400 shrink-0" />
                  )}
                </button>
              ))}
            </div>

            {/* CTA按钮组 */}
            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                href="/widget-demo"
                className="group inline-flex items-center px-6 py-3 bg-white text-gray-900 font-semibold rounded-xl hover:bg-gray-50 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
              >
                <Play className="w-5 h-5 mr-2" />
                查看演示
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/sdk"
                className="inline-flex items-center px-6 py-3 bg-white/20 backdrop-blur-sm text-white font-semibold rounded-xl hover:bg-white/30 transition-all duration-200 border-2 border-white/50 hover:border-white/70"
              >
                <Code className="w-5 h-5 mr-2" />
                查看文档
              </Link>
            </div>
          </div>

          {/* 右侧：可视化预览 */}
          <div className="hidden lg:block">
            <div className="relative bg-white/10 backdrop-blur-md rounded-2xl border-2 border-white/20 p-6 shadow-2xl">
              {/* 模拟Widget界面 */}
              <div className="bg-white rounded-xl shadow-inner p-4 space-y-4">
                {/* 搜索框 */}
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <Zap className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-400 text-sm">搜索 AI 技能...</span>
                </div>

                {/* 标签 */}
                <div className="flex flex-wrap gap-2">
                  {['AI助手', '数据分析', '图像处理'].map((tag, i) => (
                    <span key={i} className="px-3 py-1 text-xs bg-indigo-50 text-indigo-700 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>

                {/* 结果列表 */}
                <div className="space-y-2">
                  {[1, 2].map((i) => (
                    <div key={i} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-linear-to-br from-blue-400 to-purple-500 rounded-lg" />
                        <div className="flex-1 space-y-2">
                          <div className="h-3 bg-gray-200 rounded w-3/4" />
                          <div className="h-2 bg-gray-100 rounded w-full" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 装饰元素 */}
              <div className="absolute -top-2 -right-2 w-20 h-20 bg-linear-to-br from-yellow-400 to-orange-500 rounded-full opacity-20 blur-xl" />
              <div className="absolute -bottom-2 -left-2 w-16 h-16 bg-linear-to-br from-pink-400 to-purple-500 rounded-full opacity-20 blur-xl" />
            </div>
          </div>
        </div>

        {/* 底部统计 */}
        <div className="mt-8 pt-6 border-t border-white/20 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">9KB</div>
            <div className="text-xs text-white/70">超轻量体积</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">&lt;50ms</div>
            <div className="text-xs text-white/70">极速响应</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">100%</div>
            <div className="text-xs text-white/70">TypeScript</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">MIT</div>
            <div className="text-xs text-white/70">开源协议</div>
          </div>
        </div>
      </div>
    </div>
  );
}
