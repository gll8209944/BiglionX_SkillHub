import React from 'react';
import Link from 'next/link';
import { 
  Package, Zap, Code, Globe, Book, ArrowRight, 
  CheckCircle, Star, Download, TrendingUp, Users 
} from 'lucide-react';
import HeroCarousel from '@/components/ui/HeroCarousel';
import CodeSnippet from '@/components/ui/CodeSnippet';

/**
 * SDK营销落地页
 * 展示SkillHub Search SDK的价值主张和核心优势
 */
export default function SDKLandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* 顶部导航 */}
      <nav className="sticky top-0 z-50 w-full px-6 py-2 border-b border-gray-200 bg-white/90 backdrop-blur-md shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center group">
              <img src="/skillhub.png" alt="Skill Hub Logo" className="h-16 w-auto object-contain transition-transform group-hover:scale-105" />
            </Link>
          </div>
          <div className="flex items-center space-x-6">
            <Link
              href="/"
              className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
            >
              首页
            </Link>
            <Link
              href="/sdk"
              className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
            >
              SDK
            </Link>
            <Link
              href="https://github.com/BigLionX/SkillHub"
              target="_blank"
              className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors flex items-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path
                  fillRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  clipRule="evenodd"
                />
              </svg>
              GitHub
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section with Carousel */}
      <section className="relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <HeroCarousel />
        </div>
      </section>

      {/* Quick Start Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              快速开始
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              只需三步，即可为您的应用添加强大的搜索功能
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="bg-linear-to-br from-blue-50 to-cyan-50 rounded-2xl p-8 border border-blue-100">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl mb-6">
                1
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">安装 SDK</h3>
              <CodeSnippet
                title="npm 安装"
                code="npm install @skillhub/search-sdk"
                language="bash"
              />
            </div>

            {/* Step 2 */}
            <div className="bg-linear-to-br from-purple-50 to-pink-50 rounded-2xl p-8 border border-purple-100">
              <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-xl mb-6">
                2
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">初始化客户端</h3>
              <CodeSnippet
                title="TypeScript"
                code={`import { SearchSDK } from '@skillhub/search-sdk';

const sdk = new SearchSDK({
  apiUrl: 'https://api.skillhub.com',
});`}
                language="typescript"
              />
            </div>

            {/* Step 3 */}
            <div className="bg-linear-to-br from-green-50 to-emerald-50 rounded-2xl p-8 border border-green-100">
              <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center text-white font-bold text-xl mb-6">
                3
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">执行搜索</h3>
              <CodeSnippet
                title="搜索示例"
                code={`const results = await sdk.search({
  query: 'AI助手',
  pageSize: 10,
});

console.log(results.skills);`}
                language="typescript"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-linear-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-2xl mb-4">
                <Package className="w-8 h-8 text-blue-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">9KB</div>
              <div className="text-sm text-gray-600">超轻量包体积</div>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-2xl mb-4">
                <Zap className="w-8 h-8 text-purple-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">&lt;50ms</div>
              <div className="text-sm text-gray-600">平均响应时间</div>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-2xl mb-4">
                <Code className="w-8 h-8 text-green-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">6+</div>
              <div className="text-sm text-gray-600">完整示例项目</div>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-2xl mb-4">
                <Globe className="w-8 h-8 text-orange-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">4+</div>
              <div className="text-sm text-gray-600">支持框架数量</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              为什么选择 SkillHub Search SDK?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              为开发者打造带Skill搜索引擎的SkillHub，让您轻松集成一个属于自己的SkillHub
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white rounded-2xl p-8 border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 group">
              <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Zap className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">双重搜索模式</h3>
              <p className="text-gray-600 leading-relaxed">
                同时支持全文搜索和语义搜索，既能精确匹配关键词，又能理解用户意图
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-2xl p-8 border border-gray-200 hover:border-purple-300 hover:shadow-lg transition-all duration-300 group">
              <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Code className="w-7 h-7 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">TypeScript原生</h3>
              <p className="text-gray-600 leading-relaxed">
                完整的类型定义，智能提示，编译时错误检查，让开发更安全、更高效
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-2xl p-8 border border-gray-200 hover:border-green-300 hover:shadow-lg transition-all duration-300 group">
              <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Package className="w-7 h-7 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">极简依赖</h3>
              <p className="text-gray-600 leading-relaxed">
                仅依赖axios，包体积小，加载速度快，不会影响您的应用性能
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white rounded-2xl p-8 border border-gray-200 hover:border-orange-300 hover:shadow-lg transition-all duration-300 group">
              <div className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Globe className="w-7 h-7 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">多框架支持</h3>
              <p className="text-gray-600 leading-relaxed">
                React、Vue、Angular、Node.js全覆盖，无论您用什么技术栈都能轻松集成
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-white rounded-2xl p-8 border border-gray-200 hover:border-pink-300 hover:shadow-lg transition-all duration-300 group">
              <div className="w-14 h-14 bg-pink-100 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Book className="w-7 h-7 text-pink-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">文档完善</h3>
              <p className="text-gray-600 leading-relaxed">
                从快速开始到高级用法，从API参考到最佳实践，应有尽有
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-white rounded-2xl p-8 border border-gray-200 hover:border-cyan-300 hover:shadow-lg transition-all duration-300 group">
              <div className="w-14 h-14 bg-cyan-100 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Users className="w-7 h-7 text-cyan-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">社区支持</h3>
              <p className="text-gray-600 leading-relaxed">
                活跃的GitHub社区，Discord频道，及时的技术支持和问题解答
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Code Example Section */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-white">
              <h2 className="text-4xl font-bold mb-6">
                3行代码，即刻拥有
              </h2>
              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                无需复杂配置，不需要学习曲线。安装、初始化、搜索，就这么简单。
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="shrink-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-1">安装SDK</h4>
                    <p className="text-gray-400 text-sm">npm install @skillhub/search-sdk</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="shrink-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-1">初始化实例</h4>
                    <p className="text-gray-400 text-sm">const sdk = new SearchSDK({'{'} apiUrl {'}'})</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="shrink-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-1">开始搜索</h4>
                    <p className="text-gray-400 text-sm">await sdk.search({'{'} query {'}'})</p>
                  </div>
                </div>
              </div>

              <div className="mt-10">
                <Link
                  href="/dashboard/integration"
                  className="inline-flex items-center px-8 py-4 bg-linear-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
                >
                  查看完整文档
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </div>
            </div>

            <div className="bg-gray-800 rounded-2xl p-8 shadow-2xl border border-gray-700">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="ml-3 text-sm text-gray-400">quick-start.ts</span>
              </div>
              <pre className="text-sm text-gray-300 overflow-x-auto">
                <code>{`// 1. 导入SDK
import { SearchSDK } from '@skillhub/search-sdk';

// 2. 创建实例
const sdk = new SearchSDK({
  apiUrl: 'https://api.skillhub.com'
});

// 3. 执行搜索
async function searchSkills() {
  const results = await sdk.search({
    query: 'python automation',
    page: 1,
    pageSize: 20,
    sortBy: 'relevance'
  });

  console.log(\`找到 \${results.total} 个结果\`);
  
  results.skills.forEach(skill => {
    console.log(\`\${skill.name}: \${skill.description}\`);
  });
}

searchSkills();`}</code>
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-20 bg-linear-to-br from-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              适用场景
            </h2>
            <p className="text-xl text-gray-600">
              无论您是个人开发者还是企业团队，都能从中受益
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Code className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Web应用</h3>
              <p className="text-sm text-gray-600">
                为您的网站添加智能搜索功能，提升用户体验
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Package className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">CLI工具</h3>
              <p className="text-sm text-gray-600">
                在命令行工具中集成搜索，方便开发者使用
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Globe className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">后端服务</h3>
              <p className="text-sm text-gray-600">
                作为微服务提供搜索API，支持高并发访问
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">移动应用</h3>
              <p className="text-sm text-gray-600">
                在React Native等跨平台框架中使用
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials / Social Proof */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              开发者信赖的选择
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 mb-6 italic">
                "集成非常简单，文档清晰明了。语义搜索功能特别强大，用户反馈很好！"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-linear-to-br from-blue-400 to-purple-400 rounded-full" />
                <div>
                  <div className="font-semibold text-gray-900">张开发者</div>
                  <div className="text-sm text-gray-500">全栈工程师</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 mb-6 italic">
                "TypeScript支持非常完善，类型提示很准确。大大提升了开发效率。"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-linear-to-br from-green-400 to-cyan-400 rounded-full" />
                <div>
                  <div className="font-semibold text-gray-900">李前端</div>
                  <div className="text-sm text-gray-500">前端架构师</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 mb-6 italic">
                "包体积很小，性能优秀。客服响应也很及时，强烈推荐！"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-linear-to-br from-orange-400 to-red-400 rounded-full" />
                <div>
                  <div className="font-semibold text-gray-900">王后端</div>
                  <div className="text-sm text-gray-500">Node.js开发者</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Product - Widget */}
      <section className="py-20 bg-linear-to-br from-indigo-50 via-purple-50 to-pink-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
            <div className="grid md:grid-cols-2 gap-0">
              {/* Left Content */}
              <div className="p-10 flex flex-col justify-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium mb-6 w-fit">
                  <Package className="w-4 h-4" />
                  相关产品推荐
                </div>
                
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  SkillHub Widget
                </h2>
                <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                  如果您需要更完整的 UI 组件，而不仅仅是 SDK，那么 Widget 是您的最佳选择！
                  提供现成的搜索界面、管理面板和主题定制功能。
                </p>
                
                <div className="space-y-3 mb-8">
                  <div className="flex items-start gap-3">
                    <div className="shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">即插即用的 UI 组件</div>
                      <div className="text-sm text-gray-600">无需自己开发界面，直接使用精美组件</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">本地 Skill 管理</div>
                      <div className="text-sm text-gray-600">创建、编辑、发布 Skills，一站式管理</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">主题完全定制</div>
                      <div className="text-sm text-gray-600">颜色、圆角、字体，随心所欲</div>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-4">
                  <Link
                    href="/widget-demo"
                    className="inline-flex items-center px-6 py-3 bg-linear-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                  >
                    <Zap className="w-5 h-5 mr-2" />
                    查看 Widget 演示
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                  <Link
                    href="/sdk"
                    className="inline-flex items-center px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:border-indigo-600 hover:text-indigo-600 transition-colors"
                  >
                    继续使用 SDK
                  </Link>
                </div>
              </div>
              
              {/* Right Preview */}
              <div className="bg-linear-to-br from-indigo-600 via-purple-600 to-pink-600 p-10 flex items-center justify-center">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 w-full max-w-md border border-white/20">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                      <Package className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="text-white font-semibold">Widget 预览</div>
                      <div className="text-white/70 text-sm">一行代码集成</div>
                    </div>
                  </div>
                  
                  <div className="bg-white/90 rounded-lg p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-indigo-500 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-purple-500 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-pink-500 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex gap-2">
                    <span className="px-3 py-1 bg-white/20 text-white text-xs rounded-full">智能搜索</span>
                    <span className="px-3 py-1 bg-white/20 text-white text-xs rounded-full">本地管理</span>
                    <span className="px-3 py-1 bg-white/20 text-white text-xs rounded-full">一键发布</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-linear-to-br from-blue-600 via-purple-600 to-pink-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            准备好开始了吗？
          </h2>
          <p className="text-xl text-white/90 mb-10">
            加入数千名开发者的行列，为您的应用添加强大的搜索功能
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/dashboard/integration"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-gray-900 font-semibold rounded-xl hover:bg-gray-100 transform hover:scale-105 transition-all duration-200 shadow-lg"
            >
              <Book className="w-5 h-5 mr-2" />
              查看集成指南
            </Link>
          </div>

          <div className="mt-12 flex items-center justify-center gap-8 text-white/80 text-sm">
            <div className="flex items-center gap-2">
              <Download className="w-5 h-5" />
              <span>免费使用</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              <span>开源项目</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              <span>社区支持</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
