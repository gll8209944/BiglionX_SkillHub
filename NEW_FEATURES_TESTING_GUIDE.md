# SkillHub 新功能快速测试指南

## 🚀 快速开始

### 1. 数据库迁移

首先需要应用新的数据库 schema(添加了 ApiKey 模型):

```bash
cd apps/web
npx prisma migrate dev --name add_api_keys
npx prisma generate
```

### 2. 安装依赖

确保所有新依赖已安装:

```bash
npm install
```

主要新增依赖:
- `recharts` - 图表库
- `@hookform/resolvers` - 表单验证集成

### 3. 启动开发服务器

```bash
npm run dev
```

访问: http://localhost:3000

---

## 📋 测试清单

### ✅ Settings 设置页面

#### 访问路径
- 主页面: http://localhost:3000/dashboard/settings
- 账户安全: http://localhost:3000/dashboard/settings/security
- 通知设置: http://localhost:3000/dashboard/settings/notifications
- API 密钥: http://localhost:3000/dashboard/settings/api-keys

#### 测试步骤

**1. 个人资料页面**
- [ ] 导航到 `/dashboard/settings`
- [ ] 检查侧边栏导航是否正常显示
- [ ] 尝试上传头像(选择图片文件)
- [ ] 修改姓名字段
- [ ] 查看字符计数器是否工作
- [ ] 点击"保存更改"按钮
- [ ] 验证成功消息显示

**2. 账户安全页面**
- [ ] 导航到 `/dashboard/settings/security`
- [ ] 查看 OAuth 提示消息
- [ ] 尝试填写密码修改表单
- [ ] 验证密码长度验证(至少8字符)
- [ ] 验证两次密码一致性检查
- [ ] 点击"删除账户"按钮
- [ ] 确认二次确认对话框显示

**3. 通知设置页面**
- [ ] 导航到 `/dashboard/settings/notifications`
- [ ] 切换各个通知开关
- [ ] 更改通知频率(即时/每日/每周)
- [ ] 点击"发送测试通知"按钮
- [ ] 点击"保存设置"按钮
- [ ] 验证保存成功消息

**4. API 密钥管理页面**
- [ ] 导航到 `/dashboard/settings/api-keys`
- [ ] 点击"创建新密钥"按钮
- [ ] 输入密钥名称
- [ ] 选择权限范围(read/write/admin)
- [ ] 点击"创建密钥"
- [ ] **重要**: 复制显示的完整密钥
- [ ] 关闭模态框
- [ ] 验证密钥列表中出现新密钥
- [ ] 点击复制按钮
- [ ] 尝试删除密钥(带确认)

---

### ✅ Analytics 数据分析页面

#### 访问路径
- http://localhost:3000/dashboard/analytics

#### 测试步骤

**1. 平台概览**
- [ ] 导航到 `/dashboard/analytics`
- [ ] 默认显示"平台概览"选项卡
- [ ] 检查4个统计卡片:
  - 总 Skills (带周增长率)
  - 总下载量
  - 总用户数 (含活跃用户)
  - 平均评分 (星级显示)
- [ ] 切换时间范围(7天/30天/90天)
- [ ] 验证数据随时间范围变化

**2. 图表功能**
- [ ] 检查 Skills 增长趋势图(折线图)
- [ ] 检查下载量趋势图(面积图)
- [ ] 检查分类分布图(饼图)
- [ ] 检查热门 Skills Top 10
- [ ] 鼠标悬停图表查看工具提示
- [ ] 验证图表响应式(调整浏览器窗口大小)

**3. 个人分析**
- [ ] 切换到"个人分析"选项卡
- [ ] 查看"即将推出"提示页面

---

### ✅ 路由重定向

#### 测试步骤

**旧路由重定向**
- [ ] 访问 `/analytics` (旧路由)
- [ ] 验证自动重定向到 `/dashboard/analytics`
- [ ] 访问任何其他 `(dashboard)` 下的路由
- [ ] 验证都重定向到对应的 `/dashboard/*` 路径

---

## 🐛 已知问题和注意事项

### 1. Zod 版本兼容性
**问题**: 项目使用 Zod 4.x,与 `@hookform/resolvers` 有兼容性问题

**当前解决方案**: 
- 在 Settings 页面中手动调用 `safeParse()` 进行验证
- 未使用 `zodResolver`

**建议**: 
- 选项 A: 降级到 Zod 3.x (`npm install zod@^3.22.0`)
- 选项 B: 等待 `@hookform/resolvers` 更新支持 Zod 4

### 2. API 后端未实现
以下 API 端点前端已完成,但后端需要实现:

- `POST /api/auth/change-password` - 当前返回 OAuth 错误
- `GET/POST/DELETE /api/settings/api-keys` - 完全未实现
- `PUT /api/users/notifications` - 通知设置保存

**影响**: 相关功能会显示错误或无响应

**临时方案**: 
- 密码修改: 提示 OAuth 用户无法修改
- API 密钥: 使用前端模拟数据
- 通知设置: 仅前端状态,不持久化

### 3. Analytics 数据源
**当前状态**: 使用模拟数据

**需要实现**:
- `GET /api/analytics/trends` - 趋势数据
- `GET /api/analytics/personal` - 个人数据

**影响**: 图表显示随机生成的数据,非真实统计

---

## 🎨 UI/UX 亮点

### 响应式设计
- 桌面端: 侧边栏导航
- 移动端: 底部导航栏
- 图表自适应容器大小

### 交互反馈
- 加载状态指示器
- 成功/错误消息提示
- 按钮禁用状态
- 表单实时验证

### 视觉设计
- 统一的配色方案
- Lucide 图标系统
- 卡片式布局
- 平滑过渡动画

---

## 📸 截图建议

建议截图以下页面用于文档或演示:

1. **Settings 主页面** - 展示侧边栏导航和个人资料表单
2. **API 密钥创建** - 展示密钥生成后的完整密钥显示
3. **Analytics 平台概览** - 展示4个统计卡片和图表
4. **移动端视图** - 展示底部导航栏

---

## 🔍 代码审查要点

### Settings 页面
- [ ] 表单验证逻辑是否正确
- [ ] 错误处理是否完善
- [ ] Session 更新是否生效
- [ ] 移动端导航是否正常

### Analytics 页面
- [ ] Recharts 组件是否正确渲染
- [ ] 时间范围切换是否触发数据刷新
- [ ] 图表是否响应式
- [ ] 数据类型是否正确

### 路由清理
- [ ] 旧路由是否正确重定向
- [ ] Middleware 配置是否正确
- [ ] 是否有 404 错误

---

## 🚦 部署前检查

### 必须完成
1. [ ] 运行数据库迁移
2. [ ] 实现 API 密钥后端 API
3. [ ] 实现密码修改后端 API(如果需要)
4. [ ] 测试所有表单提交

### 建议完成
1. [ ] 添加真实的 Analytics 数据源
2. [ ] 实现 Toast 通知组件
3. [ ] 添加单元测试
4. [ ] 性能优化(图表数据缓存)

### 可选完成
1. [ ] 实现自动保存草稿
2. [ ] 添加键盘快捷键
3. [ ] 国际化支持
4. [ ] 深色模式

---

## 📞 支持和反馈

如遇到问题:
1. 检查浏览器控制台错误
2. 验证 API 响应
3. 查看 `IMPLEMENTATION_SUMMARY.md` 了解已知问题
4. 检查 Prisma 迁移是否成功

---

**最后更新**: 2026-04-17  
**版本**: v1.0.0 (新功能发布)
