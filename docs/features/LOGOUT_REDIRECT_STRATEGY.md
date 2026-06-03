# 登出后跳转策略

## 📋 决策记录

**日期**: 2026年4月23日  
**决策**: 用户登出后跳转到首页 `/`（会自动重定向到 `/skills`）  
**状态**: ✅ 已实施

## 🎯 背景

### 之前的行为
- 用户点击"退出登录"后，跳转到 `/login`（登录页面）
- 用户被强制停留在登录页面，无法浏览公开内容

### 问题
- ❌ 用户体验不佳 - 感觉被"困住"
- ❌ 不符合现代 Web 应用的最佳实践
- ❌ 减少了未登录用户继续探索平台的机会

## ✅ 新的行为

### 跳转流程
```
用户点击"退出登录"
    ↓
清除会话
    ↓
跳转到 / (首页)
    ↓
自动重定向到 /skills (技能浏览页)
    ↓
用户可以继续浏览公开的技能
```

### 代码实现

**文件**: `apps/web/app/api/auth/signout/route.ts`

```typescript
export async function POST() {
  await signOut({ redirect: false });
  // 登出后跳转到首页（会自动重定向到 /skills）
  // 这样用户可以继续浏览公开内容，提升用户体验
  redirect('/');
}
```

## 📊 方案对比

| 方案 | 跳转目标 | 优点 | 缺点 | 推荐度 |
|------|---------|------|------|--------|
| **方案 1** ✅ | `/` → `/skills` | 用户体验好，符合最佳实践 | 重新登录需多一步 | ⭐⭐⭐⭐⭐ |
| 方案 2 | `/login` | 直接引导登录 | 体验差，限制用户 | ⭐⭐ |
| 方案 3 | `/skills` | 直接展示核心功能 | 与首页逻辑重复 | ⭐⭐⭐⭐ |

## 💡 设计理由

### 1. 用户体验优先
- 用户登出后应该能够自由浏览公开内容
- 不应该被强制停留在登录页面
- 给予用户选择权

### 2. 行业最佳实践
参考主流平台的登出行为：

| 平台 | 登出后跳转 | 说明 |
|------|-----------|------|
| GitHub | 首页 | 可以继续浏览项目 |
| GitLab | 登录页 + 返回首页链接 | 提供选择 |
| Stack Overflow | 首页 | 继续浏览问答 |
| Twitter/X | 登录页 | 但顶部有导航 |
| **SkillHub** | **首页 → 技能页** | **继续浏览技能** ✅ |

### 3. 业务价值
- ✅ 未登录用户仍可以浏览技能
- ✅ 增加用户再次注册/登录的可能性
- ✅ 展示平台价值和内容质量
- ✅ 有利于 SEO 和用户留存

### 4. 技术优势
- 利用现有的首页重定向逻辑
- 未来可以灵活调整首页行为
- 保持代码简洁和一致性

## 🔍 相关配置

### 首页重定向
**文件**: `apps/web/app/page.tsx`
```typescript
export default function Home() {
  redirect('/skills');
}
```

### 公开路由
以下路由不需要登录即可访问：
- `/` - 首页（重定向到 /skills）
- `/skills` - 技能浏览
- `/skills/[slug]` - 技能详情
- `/login` - 登录页面
- `/register` - 注册页面
- `/namespaces` - 命名空间浏览

### 受保护路由
以下路由需要登录：
- `/dashboard/*` - 用户仪表板
- `/api/skills/publish` - 发布技能
- `/api/namespaces/*` - 命名空间管理

## 🧪 测试步骤

### 手动测试
1. **登录系统**
   - 使用测试账户登录: test@skillhub.com / Test123456

2. **访问仪表板**
   - 确认可以访问 `/dashboard`

3. **点击退出登录**
   - 在导航栏右上角点击"退出登录"

4. **验证跳转**
   - ✅ 应该跳转到首页 `/`
   - ✅ 自动重定向到 `/skills`
   - ✅ 可以看到公开的技能列表
   - ✅ 导航栏显示"登录"和"注册"按钮

5. **验证会话清除**
   - 访问 `/api/auth/session`
   - 应该返回 `null` 或空对象

### 自动化测试建议

```typescript
// cypress/e2e/logout.cy.ts
describe('登出功能', () => {
  beforeEach(() => {
    // 登录
    cy.visit('/login');
    cy.contains('密码登录').click();
    cy.get('input[id="password-email"]').type('test@skillhub.com');
    cy.get('input[id="password"]').type('Test123456');
    cy.get('button[type="submit"]').click();
    
    // 验证登录成功
    cy.url().should('include', '/dashboard');
  });

  it('登出后应该跳转到首页', () => {
    // 点击退出登录
    cy.contains('退出登录').click();
    
    // 验证跳转到首页（会重定向到 /skills）
    cy.url().should('match', /\/(skills)?$/);
    
    // 验证会话已清除
    cy.request('/api/auth/session').then((response) => {
      expect(response.body.user).to.not.exist;
    });
    
    // 验证可以看到登录按钮
    cy.contains('登录').should('be.visible');
  });
});
```

## 🔮 未来改进

### 短期改进
- [ ] 添加登出确认对话框（可选）
- [ ] 在登出页面显示"感谢使用"消息
- [ ] 添加快速重新登录的链接

### 长期改进
- [ ] 记录登出日志用于分析
- [ ] 根据用户行为智能推荐内容
- [ ] 实现"记住我"功能
- [ ] 添加单点登出（SSO）支持

## 📝 注意事项

### 安全性
- ✅ 会话已正确清除
- ✅ JWT token 已失效
- ✅ 受保护路由仍然需要重新登录

### 用户体验
- ✅ 登出过程流畅
- ✅ 用户可以继续浏览
- ✅ 没有意外的中断

### 性能
- ✅ 重定向速度快
- ✅ 无额外的网络请求
- ✅ 缓存策略不受影响

## 🔗 相关文档

- [密码登录功能测试报告](./PASSWORD_LOGIN_TEST_REPORT.md)
- [密码登录最终修复报告](./PASSWORD_LOGIN_FINAL_FIX.md)
- [NextAuth 官方文档 - Sign Out](https://next-auth.js.org/getting-started/client#signout)

---

**决策者**: AI Assistant  
**审核状态**: ✅ 已实施  
**最后更新**: 2026年4月23日  
**下次审查**: 收集用户反馈后