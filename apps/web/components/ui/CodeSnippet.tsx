'use client';

import React, { useState } from 'react';
import { Copy, Check, Code2, Terminal } from 'lucide-react';

interface CodeSnippetProps {
  title?: string;
  code: string;
  language?: string;
}

export default function CodeSnippet({ 
  title = '快速开始', 
  code, 
  language = 'bash' 
}: CodeSnippetProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-gray-900 rounded-xl overflow-hidden shadow-2xl border border-gray-800">
      {/* 标题栏 */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-800/50 border-b border-gray-700">
        <div className="flex items-center gap-2">
          {language === 'bash' ? (
            <Terminal className="w-4 h-4 text-green-400" />
          ) : (
            <Code2 className="w-4 h-4 text-blue-400" />
          )}
          <span className="text-sm font-medium text-gray-300">{title}</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-400 hover:text-white bg-gray-700/50 hover:bg-gray-700 rounded-lg transition-all duration-200"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-green-400" />
              <span className="text-green-400">已复制</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>复制</span>
            </>
          )}
        </button>
      </div>

      {/* 代码内容 */}
      <div className="p-4 overflow-x-auto">
        <pre className="text-sm font-mono leading-relaxed">
          <code className="text-gray-300">
            {code.split('\n').map((line, i) => (
              <div key={i} className="hover:bg-gray-800/50 px-2 -mx-2 rounded transition-colors">
                <span className="text-gray-600 select-none mr-4 inline-block w-6 text-right">{i + 1}</span>
                <span dangerouslySetInnerHTML={{
                  __html: highlightSyntax(line, language)
                }} />
              </div>
            ))}
          </code>
        </pre>
      </div>
    </div>
  );
}

// 简单的语法高亮函数
function highlightSyntax(line: string, language: string): string {
  if (language === 'bash') {
    // 高亮命令
    line = line.replace(/^(npm|yarn|pnpm|npx)/g, '<span class="text-yellow-400">$1</span>');
    // 高亮标志
    line = line.replace(/(--\w+)/g, '<span class="text-purple-400">$1</span>');
    // 高亮包名
    line = line.replace(/(@[\w-]+\/[\w-]+)/g, '<span class="text-cyan-400">$1</span>');
    line = line.replace(/\b(install|i|add)\b/g, '<span class="text-green-400">$1</span>');
  } else if (language === 'javascript' || language === 'typescript') {
    // 高亮关键字
    line = line.replace(/\b(import|from|const|let|var|function|return|export|default)\b/g, '<span class="text-purple-400">$1</span>');
    // 高亮字符串
    line = line.replace(/(['"`].*?['"`])/g, '<span class="text-green-400">$1</span>');
    // 高亮注释
    line = line.replace(/(\/\/.*)/g, '<span class="text-gray-500">$1</span>');
    // 高亮括号
    line = line.replace(/([{}()[\]])/g, '<span class="text-yellow-400">$1</span>');
  }
  
  return line;
}
