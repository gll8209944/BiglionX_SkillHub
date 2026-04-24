'use client';

import React from 'react';
import Link from 'next/link';
import { Package, Zap, ArrowRight, Code, Layers, Bot, Globe } from 'lucide-react';

interface PromoCardsProps {
  className?: string;
}

export default function PromoCards({ className = '' }: PromoCardsProps) {
  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      {/* Widget 推广卡片 */}
      <Link 
        href="/widget-demo"
        className="group relative overflow-hidden bg-linear-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl p-6 text-white hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
      >
        {/* 背景装饰 */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full blur-2xl -ml-12 -mb-12" />
        
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Package className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold">SkillHub Widget</h3>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-400 text-yellow-900 mt-1">
                  NEW
                </span>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
          </div>
          
          <p className="text-sm text-white/90 mb-4 leading-relaxed">
            可嵌入的 Skill 商店组件，一行代码集成到您的应用中
          </p>
          
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs bg-white/20 backdrop-blur-sm">
              <Zap className="w-3 h-3 mr-1" />
              智能搜索
            </span>
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs bg-white/20 backdrop-blur-sm">
              <Layers className="w-3 h-3 mr-1" />
              本地管理
            </span>
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs bg-white/20 backdrop-blur-sm">
              <Code className="w-3 h-3 mr-1" />
              主题定制
            </span>
          </div>
        </div>
      </Link>

      {/* Flowise / AI Agent 集成推广卡片 */}
      <Link 
        href="https://skillhub.proclaw.cc/api/openapi"
        target="_blank"
        className="group relative overflow-hidden bg-linear-to-br from-orange-500 via-red-500 to-pink-500 rounded-2xl p-6 text-white hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
      >
        {/* 背景装饰 */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full blur-2xl -ml-12 -mb-12" />
        
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold">AI Agent 集成</h3>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-400 text-purple-900 mt-1">
                  NEW
                </span>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
          </div>
          
          <p className="text-sm text-white/90 mb-4 leading-relaxed">
            OpenAPI 3.0 标准接口，支持 Flowise、LangChain、Dify 等平台自动发现
          </p>
          
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs bg-white/20 backdrop-blur-sm">
              <Globe className="w-3 h-3 mr-1" />
              OpenAPI 3.0
            </span>
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs bg-white/20 backdrop-blur-sm">
              <Bot className="w-3 h-3 mr-1" />
              AI 工具
            </span>
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs bg-white/20 backdrop-blur-sm">
              ⚡ 即插即用
            </span>
          </div>
        </div>
      </Link>

      {/* SDK 推广卡片 */}
      <Link 
        href="/sdk"
        className="group relative overflow-hidden bg-linear-to-br from-blue-500 via-cyan-500 to-teal-500 rounded-2xl p-6 text-white hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
      >
        {/* 背景装饰 */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full blur-2xl -ml-12 -mb-12" />
        
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Code className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Search SDK</h3>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-400 text-green-900 mt-1">
                  推荐
                </span>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
          </div>
          
          <p className="text-sm text-white/90 mb-4 leading-relaxed">
            轻量级搜索 SDK，9KB 包体积，&lt;50ms 响应时间
          </p>
          
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs bg-white/20 backdrop-blur-sm">
              ⚡ 超轻量
            </span>
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs bg-white/20 backdrop-blur-sm">
              🎯 TypeScript
            </span>
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs bg-white/20 backdrop-blur-sm">
              🔍 语义搜索
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}
