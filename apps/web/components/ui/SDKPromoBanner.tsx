'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { X, Package, ArrowRight, Zap } from 'lucide-react';

interface SDKPromoBannerProps {
  className?: string;
}

export default function SDKPromoBanner({ className = '' }: SDKPromoBannerProps) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className={`relative bg-linear-to-r from-blue-600 via-purple-600 to-pink-600 text-white ${className}`}>
      {/* 关闭按钮 */}
      <button
        onClick={() => setIsVisible(false)}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 hover:bg-white/20 rounded-lg transition-colors"
        aria-label="关闭"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* 左侧内容 */}
          <div className="flex items-center gap-4 flex-1">
            <div className="shrink-0 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <Package className="w-6 h-6" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-lg">🚀 SkillHub Search SDK 现已发布！</h3>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-400 text-yellow-900">
                  NEW
                </span>
              </div>
              <p className="text-sm text-white/90 hidden md:block">
                功能完备、易于集成的NPM包，让开发者轻松地将SkillHub强大的搜索功能嵌入到自己的项目中
              </p>
            </div>
          </div>

          {/* 右侧按钮 */}
          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/sdk"
              className="hidden sm:inline-flex items-center px-4 py-2 bg-white text-gray-900 font-medium rounded-lg hover:bg-gray-100 transition-colors text-sm"
            >
              了解更多
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
            <Link
              href="/dashboard/integration"
              className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm text-white font-medium rounded-lg hover:bg-white/30 transition-colors text-sm border border-white/50"
            >
              <Zap className="w-4 h-4 mr-1" />
              立即集成
            </Link>
          </div>
        </div>
      </div>

      {/* 装饰性光效 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
      </div>
    </div>
  );
}
