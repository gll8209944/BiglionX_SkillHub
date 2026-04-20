# 快速启动指南 - 子分类和反馈功能

## 🚀 立即测试新功能

### 1. 查看前端展示

```bash
# 如果开发服务器正在运行,直接访问:
http://localhost:3000/skills

# 查看Skills列表页面,应该能看到:
# - 子分类徽章(蓝色)
# - 置信度徽章(绿/黄/灰色)

# 点击任意Skill查看详情页,应该能看到:
# - 标题区域的分类徽章
# - "报告分类错误"按钮
```

### 2. 测试反馈功能

```bash
# 在Skill详情页:
1. 点击"报告分类错误"按钮
2. 选择反馈类型(例如: 子分类错误)
3. 填写建议的分类和原因
4. 提交表单
5. 应该看到成功消息
```

---

## ⚠️ 重要: 刷新Prisma Client并批量更新数据

由于数据库schema已更新,需要重新生成Prisma Client:

```bash
# 步骤1: 停止当前运行的开发服务器 (Ctrl+C)

# 步骤2: 重新生成Prisma Client
cd apps/web
npx prisma generate

# 步骤3: 重新启动开发服务器
npm run dev

# 步骤4: 在新终端中运行批量重新分类脚本
cd ../..
npx tsx scripts/reclassify-skills.ts
```

**预期输出:**
```
🚀 Starting batch reclassification...

Found XXX skills to reclassify

✅ Processed 50/XXX skills (XX updated, X errors, XX unchanged)
...

======================================================================
📊 Reclassification Summary
======================================================================
Total skills processed: XXX
Successfully updated: XX
Unchanged: XX
Errors: X
======================================================================
```

---

## 🔍 验证数据更新

```bash
# 检查有多少Skills已有子分类
npx tsx apps/web/check-subcategories.ts

# 应该看到类似输出:
# Found XX skills with subcategories:
# 1. Skill Name
#    Category: ai_ml
#    Subcategory: llm_tools
#    Confidence: 85%
```

---

## 🎨 前端效果预览

### Skills列表卡片
```
┌─────────────────────────────┐
│ Skill Name              [NS]│
│                             │
│ [LLM工具] [✓ 85%]          │  ← 新增徽章
│                             │
│ Description text here...   │
│                             │
│ 👤 Author  ⬇ 123  ★ 4.5   │
└─────────────────────────────┘
```

### Skills详情页
```
Skill Name
By Author | [Namespace] | [LLM工具] | [✓ 85%]  ← 新增徽章
⬇ 123 downloads | ★ 4.5 (10 reviews)

...

侧边栏:
┌──────────────────┐
│ 发现问题?        │
│ 如果您发现分类   │
│ 或其他信息有误,  │
│ 请告诉我们。     │
│                  │
│ [报告分类错误]   │  ← 新增按钮
└──────────────────┘
```

---

## 🛠️ 管理员功能

### 查看待审核反馈

```bash
# API调用示例
curl http://localhost:3000/api/admin/feedback?status=pending \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### 审核反馈

```bash
# 接受反馈
curl -X PATCH http://localhost:3000/api/admin/feedback/FEEDBACK_ID \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "accepted", "adminNotes": "已确认"}'

# 拒绝反馈
curl -X PATCH http://localhost:3000/api/admin/feedback/FEEDBACK_ID \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "rejected", "adminNotes": "分类正确"}'
```

---

## 📋 常见问题

### Q: 为什么看不到子分类徽章?
A: 可能该Skill还没有子分类数据。运行批量重新分类脚本后会显示。

### Q: 置信度徽章颜色代表什么?
- 🟢 绿色 (≥80%): 高置信度,分类很可能正确
- 🟡 黄色 (60-79%): 中等置信度
- ⚪ 灰色 (<60%): 低置信度,可能需要人工审核

### Q: 用户提交的反馈在哪里查看?
A: 只有管理员可以通过 `/api/admin/feedback` 查看和管理反馈。

### Q: 批量重新分类会覆盖手动修正的分类吗?
A: 脚本只会更新没有子分类或置信度低于70%的Skills。已手动修正的不会被覆盖。

---

## 🎯 下一步建议

1. **监控反馈数据**: 定期检查 `/api/admin/feedback` 查看用户反馈
2. **优化分类器**: 根据用户反馈调整SmartClassifier的关键词
3. **添加管理界面**: 创建可视化的管理Dashboard
4. **数据分析**: 分析哪些分类最容易出错,针对性优化

---

## 📞 需要帮助?

如有问题,请查看:
- 详细文档: `SUBCATEGORY_AND_FEEDBACK_IMPLEMENTATION.md`
- SmartClassifier源码: `apps/web/lib/utils/SmartClassifier.ts`
- API路由: `apps/web/app/api/skills/[slug]/feedback/route.ts`
