'use client';

interface SkeletonCardProps {
  count?: number;
}

// 单个卡片骨架屏
function SkillCardSkeleton() {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-gray-200/50 overflow-hidden border border-gray-100 animate-pulse">
      {/* Header gradient bar */}
      <div className="h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-20"></div>
      
      <div className="p-6">
        {/* Title and namespace */}
        <div className="flex items-start justify-between mb-4">
          <div className="h-6 bg-gray-200 rounded-lg w-3/4"></div>
          <div className="h-6 bg-purple-100 rounded-lg w-16"></div>
        </div>
        
        {/* Badges */}
        <div className="mb-3 flex gap-2">
          <div className="h-6 bg-blue-100 rounded-lg w-20"></div>
          <div className="h-6 bg-green-100 rounded-lg w-16"></div>
        </div>
        
        {/* Description */}
        <div className="space-y-2 mb-5">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>

        {/* Author and Stats */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
            <div className="h-4 bg-gray-200 rounded w-24"></div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-4 bg-gray-200 rounded w-16"></div>
            <div className="h-4 bg-gray-200 rounded w-16"></div>
          </div>
        </div>

        {/* Tags */}
        <div className="mt-4 flex gap-2">
          <div className="h-6 bg-gray-100 rounded-lg w-16"></div>
          <div className="h-6 bg-gray-100 rounded-lg w-20"></div>
          <div className="h-6 bg-gray-100 rounded-lg w-14"></div>
        </div>
      </div>
    </div>
  );
}

// 多个卡片骨架屏
export default function SkillsSkeleton({ count = 6 }: SkeletonCardProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <SkillCardSkeleton key={index} />
      ))}
    </div>
  );
}

// 侧边栏筛选骨架屏
export function FilterPanelSkeleton() {
  return (
    <div className="bg-white/80 backdrop-blur-sm shadow-lg shadow-gray-200/50 rounded-2xl p-6 sticky top-4 animate-pulse">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg"></div>
        <div className="h-6 bg-gray-200 rounded w-24"></div>
      </div>

      {/* Sort */}
      <div className="mb-6">
        <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
        <div className="h-10 bg-gray-200 rounded-lg w-full"></div>
      </div>

      {/* Category */}
      <div className="mb-6">
        <div className="h-4 bg-gray-200 rounded w-16 mb-2"></div>
        <div className="h-10 bg-gray-200 rounded-lg w-full"></div>
      </div>

      {/* Advanced toggle */}
      <div className="h-10 bg-gray-100 rounded-lg w-full mb-4"></div>

      {/* Advanced options placeholder */}
      <div className="space-y-6 pt-4 border-t border-gray-200">
        <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
        <div className="h-10 bg-gray-200 rounded-lg w-full"></div>
        
        <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
        <div className="h-10 bg-gray-200 rounded-lg w-full"></div>
      </div>

      {/* Apply button */}
      <div className="mt-6 h-12 bg-gradient-to-r from-blue-200 to-indigo-200 rounded-xl w-full"></div>
    </div>
  );
}

// 搜索框骨架屏
export function SearchBoxSkeleton() {
  return (
    <div className="max-w-3xl mx-auto animate-pulse">
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2">
          <div className="w-5 h-5 bg-gray-200 rounded"></div>
        </div>
        <div className="w-full h-14 bg-gray-200 rounded-xl"></div>
        <div className="absolute right-2 top-1/2 -translate-y-1/2 h-10 bg-gray-300 rounded-lg w-20"></div>
      </div>
    </div>
  );
}

// Hero区域骨架屏
export function HeroSkeleton() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-700 to-purple-800 text-white animate-pulse">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium mb-6">
            <div className="w-4 h-4 bg-white/30 rounded-full"></div>
            <div className="h-4 bg-white/30 rounded w-32"></div>
          </div>
          
          {/* Title */}
          <div className="h-12 bg-white/20 rounded-xl w-3/4 mx-auto mb-6"></div>
          
          {/* Subtitle */}
          <div className="h-6 bg-white/10 rounded-lg w-2/3 mx-auto mb-10"></div>
          
          {/* Search box */}
          <SearchBoxSkeleton />
          
          {/* Stats */}
          <div className="mt-12 grid grid-cols-3 gap-6 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="h-8 bg-white/20 rounded w-16 mx-auto mb-2"></div>
              <div className="h-4 bg-white/10 rounded w-20 mx-auto"></div>
            </div>
            <div className="text-center">
              <div className="h-8 bg-white/20 rounded w-16 mx-auto mb-2"></div>
              <div className="h-4 bg-white/10 rounded w-20 mx-auto"></div>
            </div>
            <div className="text-center">
              <div className="h-8 bg-white/20 rounded w-16 mx-auto mb-2"></div>
              <div className="h-4 bg-white/10 rounded w-20 mx-auto"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 完整页面骨架屏
export function FullPageSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Navigation skeleton */}
      <nav className="sticky top-0 z-50 w-full px-6 py-4 border-b border-gray-200 bg-white/90 backdrop-blur-md shadow-sm animate-pulse">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-gray-200 rounded"></div>
            <div className="h-8 bg-gray-200 rounded w-32"></div>
          </div>
          <div className="flex items-center space-x-6">
            <div className="h-4 bg-gray-200 rounded w-12"></div>
            <div className="h-4 bg-gray-200 rounded w-16"></div>
            <div className="h-4 bg-gray-200 rounded w-14"></div>
            <div className="flex items-center space-x-3 pl-4 border-l border-gray-200">
              <div className="h-10 bg-gray-200 rounded-xl w-20"></div>
              <div className="h-10 bg-gray-300 rounded-xl w-20"></div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero skeleton */}
      <HeroSkeleton />

      {/* Quick tags skeleton */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40 animate-pulse">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-2 overflow-x-auto">
            <div className="h-4 bg-gray-200 rounded w-20 mr-2"></div>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-8 bg-gray-200 rounded-full w-24"></div>
            ))}
          </div>
        </div>
      </div>

      {/* Main content skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex gap-8">
          {/* Sidebar skeleton */}
          <aside className="w-64 shrink-0">
            <FilterPanelSkeleton />
          </aside>

          {/* Content skeleton */}
          <main className="flex-1">
            {/* Results info */}
            <div className="mb-8 flex items-center justify-between animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-32"></div>
              <div className="h-8 bg-gray-200 rounded-lg w-40"></div>
            </div>

            {/* Cards skeleton */}
            <SkillsSkeleton count={6} />

            {/* Pagination skeleton */}
            <div className="mt-8 flex justify-center animate-pulse">
              <div className="flex items-center space-x-2">
                <div className="h-10 bg-gray-200 rounded-lg w-20"></div>
                <div className="h-10 bg-gray-200 rounded w-32"></div>
                <div className="h-10 bg-gray-200 rounded-lg w-20"></div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
