'use client';

import LoadingSpinner from './LoadingSpinner';

interface PageLoaderProps {
  message?: string;
}

export default function PageLoader({ message = '加载中...' }: PageLoaderProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-600">{message}</p>
      </div>
    </div>
  );
}
