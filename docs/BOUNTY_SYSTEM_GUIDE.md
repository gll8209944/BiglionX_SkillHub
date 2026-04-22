# 技能悬赏系统 - 功能说明

## 概述

技能悬赏系统是 SkillHub 平台的核心功能之一，旨在解决"技能缺失"问题。通过悬赏机制，用户可以发布技能需求，专业开发者承接开发任务，完成后技能入库供所有用户使用，形成"用户无代码创建-开发者贡献技能-平台生态繁荣"的正循环。

## 核心功能

### 1. 发布悬赏
- 用户可以描述需要的技能功能、技术要求和预算
- 设置悬赏金额和截止时间
- 指定技能分类和复杂度要求

### 2. 申请悬赏
- 开发者浏览开放的悬赏
- 提交申请方案，包括实现思路、时间安排等
- 展示个人作品集和相关经验

### 3. 审核与分配
- 悬赏发布者查看所有申请
- 选择最合适的开发者承接任务
- 系统自动通知其他申请者结果

### 4. 开发与提交
- 开发者完成技能开发
- 提交 SKILL.md 和相关资源
- 发布者验收并确认完成

### 5. 技能入库
- 完成的技能自动发布到平台
- 关联到原始悬赏记录
- 所有用户可以搜索和使用

## 数据库设计

### 主要表结构

#### SkillBounty (悬赏表)
- `id`: 悬赏ID
- `title`: 悬赏标题
- `description`: 详细描述（Markdown格式）
- `requirements`: 技能要求（JSON，包含category、tags等）
- `reward`: 悬赏金额
- `currency`: 货币类型（默认CNY）
- `status`: 状态（OPEN/ASSIGNED/IN_PROGRESS/SUBMITTED/COMPLETED/CANCELLED/EXPIRED）
- `creatorId`: 发布者ID
- `assigneeId`: 承接者ID
- `skillId`: 完成后关联的技能ID
- `deadline`: 截止时间

#### BountyApplication (申请表)
- `id`: 申请ID
- `bountyId`: 悬赏ID
- `userId`: 申请者ID
- `proposal`: 申请方案（Markdown格式）
- `estimatedTime`: 预计完成时间
- `portfolio`: 作品集链接
- `status`: 状态（PENDING/ACCEPTED/REJECTED/WITHDRAWN）

#### BountySubmission (提交表)
- `id`: 提交ID
- `bountyId`: 悬赏ID
- `userId`: 提交者ID
- `content`: 提交内容（SKILL.md内容或文件路径）
- `description`: 提交说明
- `attachments`: 附件列表
- `status`: 状态（SUBMITTED/UNDER_REVIEW/APPROVED/REJECTED/NEEDS_REVISION）

## API 端点

### 悬赏管理
- `GET /api/bounties` - 获取悬赏列表（支持分页、过滤）
- `POST /api/bounties` - 创建新悬赏
- `GET /api/bounties/[id]` - 获取悬赏详情
- `PUT /api/bounties/[id]` - 更新悬赏
- `DELETE /api/bounties/[id]` - 取消悬赏

### 申请管理
- `POST /api/bounties/[id]/apply` - 申请悬赏
- `POST /api/bounties/[id]/applications/[applicationId]/review` - 审核申请（接受/拒绝）

### 提交管理（待实现）
- `POST /api/bounties/[id]/submit` - 提交完成的作品
- `POST /api/bounties/[id]/submissions/[submissionId]/review` - 审核提交

## 前端页面

### 1. 悬赏列表页 (`/bounties`)
- 展示所有开放中的悬赏
- 支持按状态、分类筛选
- 显示悬赏金额、申请数量等关键信息
- 分页加载

### 2. 创建悬赏页 (`/bounties/new`)
- 表单填写悬赏信息
- 实时验证
- 预览功能

### 3. 悬赏详情页 (`/bounties/[id]`)
- 完整的悬赏信息展示
- 申请列表（仅创建者可见）
- 申请按钮（符合条件的用户）
- 审核操作（创建者）

## 通知系统集成

系统会在以下场景自动发送通知：

1. **新申请通知**: 当有开发者申请悬赏时，通知发布者
2. **申请结果通知**: 当申请被接受或拒绝时，通知申请者
3. **悬赏完成通知**: 当悬赏完成后，通知相关方

## 工作流程示例

### 场景：用户需要一个PDF转Word的技能

1. **发布悬赏**
   ```
   用户A发布悬赏：
   - 标题：创建一个PDF转Word的Skill
   - 描述：需要一个能够将PDF文件转换为Word格式的Skill...
   - 要求：Python, pdf2docx库
   - 悬赏金额：¥500
   - 截止时间：2周
   ```

2. **开发者申请**
   ```
   开发者B提交申请：
   - 方案：使用pdf2docx库实现转换，支持批量处理...
   - 预计时间：5天
   - 作品集：https://github.com/devb/pdf-tools
   ```

3. **审核与分配**
   ```
   用户A查看多个申请，选择开发者B
   系统通知开发者B：申请已通过
   系统通知其他申请者：申请未通过
   ```

4. **开发与提交**
   ```
   开发者B完成开发
   提交SKILL.md和相关脚本
   ```

5. **验收与入库**
   ```
   用户A验收通过
   技能自动发布到平台
   标记悬赏为COMPLETED
   关联skillId到悬赏记录
   ```

6. **生态正循环**
   ```
   其他用户可以：
   - 搜索并使用该技能
   - 为技能评分和评论
   - 基于此技能进行二次开发
   ```

## 未来扩展

### 短期计划
1. 实现提交审核API和页面
2. 添加支付集成（支付宝、微信支付）
3. 实现技能自动生成和测试框架
4. 添加开发者信誉系统

### 中期计划
1. 多人协作开发支持
2. 技能版本管理和迭代
3. 自动化代码审查
4. 技能质量评估算法

### 长期愿景
1. AI辅助技能生成
2. 技能市场和经济系统
3. 开发者认证体系
4. 企业级定制服务

## 技术栈

- **后端**: Next.js API Routes, Prisma ORM, PostgreSQL
- **前端**: React, TypeScript, Tailwind CSS
- **认证**: NextAuth.js
- **通知**: 内置通知系统
- **存储**: 本地文件系统 + 可选云存储

## 安全考虑

1. **权限控制**: 只有悬赏创建者可以审核申请
2. **防重复申请**: 每个用户对同一悬赏只能申请一次
3. **数据验证**: 使用Zod进行请求体验证
4. **审计日志**: 记录所有重要操作
5. **防欺诈**: 未来将添加开发者信誉评分

## 贡献指南

欢迎贡献代码和改进建议！请遵循以下步骤：

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

## 许可证

本项目采用 Apache-2.0 许可证。详见 [LICENSE](../../LICENSE) 文件。

## 联系方式

- GitHub Issues: https://github.com/BigLionX/SkillHub/issues
- Email: support@skillhub.io

---

**让我们一起构建繁荣的AI Agent技能生态系统！** 🚀
