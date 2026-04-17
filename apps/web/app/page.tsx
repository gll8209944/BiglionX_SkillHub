import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      {/* 顶部导航 */}
      <nav className="w-full px-6 py-4 border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img src="/logo.png" alt="Skill Hub Logo" className="h-10 w-10 object-contain" />
            <span className="text-2xl font-bold bg-linear-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Skill Hub
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              href="/login"
              className="px-6 py-2.5 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
            >
              登录
            </Link>
            <Link
              href="/register"
              className="px-6 py-2.5 text-sm font-medium text-white bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
            >
              注册
            </Link>
          </div>
        </div>
      </nav>

      {/* 主内容区 */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-20 bg-linear-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* 标题 */}
          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl font-extrabold bg-linear-to-r from-gray-900 via-blue-800 to-indigo-900 bg-clip-text text-transparent leading-tight">
              AI Agent 技能注册中心
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              发现、发布和管理 AI Agent 技能的开源平台
            </p>
          </div>

          {/* CTA 按钮 */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/skills"
              className="w-full sm:w-auto px-8 py-4 text-lg font-semibold text-white bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-200 hover:-translate-y-0.5"
            >
              浏览技能
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-4 text-lg font-semibold text-gray-700 bg-white hover:bg-gray-50 rounded-2xl shadow-lg hover:shadow-xl border border-gray-200 transition-all duration-200 hover:-translate-y-0.5"
            >
              登录 / 注册
            </Link>
            <Link
              href="https://github.com/BigLionX/SkillHub"
              target="_blank"
              className="w-full sm:w-auto px-8 py-4 text-lg font-semibold text-gray-700 bg-white hover:bg-gray-50 rounded-2xl shadow-lg hover:shadow-xl border border-gray-200 transition-all duration-200 hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path
                  fillRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  clipRule="evenodd"
                />
              </svg>
              GitHub
            </Link>
          </div>

          {/* 功能特性 */}
          <div className="grid md:grid-cols-3 gap-6 pt-12 text-left">
            {[
              {
                icon: '📦',
                title: '技能发布',
                desc: '轻松发布和管理你的 AI Agent 技能，支持版本控制和命名空间',
              },
              {
                icon: '🔍',
                title: '技能发现',
                desc: '浏览和搜索高质量技能，找到适合你项目的 AI 能力',
              },
              {
                icon: '🚀',
                title: 'CLI 工具',
                desc: '强大的命令行工具，一键安装、更新和管理技能',
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="p-6 bg-white/70 backdrop-blur-sm rounded-2xl border border-white/50 shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-1"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 页脚 */}
      <footer className="w-full py-6 border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 text-center text-sm text-gray-500">
          <p>© 2024 Skill Hub. Open source under Apache-2.0 License.</p>
        </div>
      </footer>
    </main>
  );
}
