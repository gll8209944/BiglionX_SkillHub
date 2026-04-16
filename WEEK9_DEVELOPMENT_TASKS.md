# Week 9 开发任务清单 - Web 应用开发 + 性能优化

> **周期**: 2026-04-17 至 2026-04-23 (7天)
> **目标**: 完成 Web 应用核心功能开发和性能优化
> **优先级**: 🔴 高（核心业务功能）

---

## 📋 Week 9 概览

### 主要任务
1. ✅ **Web 应用初始化** (Day 1-2)
2. ✅ **数据库设计与实现** (Day 2-3)
3. ✅ **认证系统** (Day 3-4)
4. ✅ **核心 API 开发** (Day 4-5)
5. ✅ **前端页面开发** (Day 5-6)
6. ✅ **性能优化** (Day 6-7)

---

## 🗓️ Day 1-2: Web 应用初始化

### Task 9.1.1: 创建 Next.js 项目

**优先级**: 🔴 P0  
**预计时间**: 2小时

#### 执行步骤

```bash
# 1. 进入 apps/web 目录
cd apps/web

# 2. 初始化 Next.js 项目
npx create-next-app@latest . --typescript --tailwind --app --no-src-dir --import-alias "@/*"

# 3. 安装依赖
npm install @mui/material @emotion/react @emotion/styled @mui/icons-material
npm install @prisma/client prisma
npm install next-auth @auth/prisma-adapter
npm install zustand @tanstack/react-query
npm install axios
npm install recharts  # 图表库
npm install react-markdown remark-gfm  # Markdown 渲染
npm install date-fns  # 日期处理
npm install zod  # 表单验证
npm install react-hook-form @hookform/resolvers  # 表单管理

# 4. 安装开发依赖
npm install -D @types/node @types/react @types/react-dom
npm install -D eslint eslint-config-next
npm install -D prettier
```

#### 验收标准
- [ ] `npm run dev` 成功启动
- [ ] 访问 http://localhost:3000 显示默认页面
- [ ] TypeScript 编译无错误
- [ ] Tailwind CSS 正常工作

---

### Task 9.1.2: 配置项目结构

**优先级**: 🔴 P0  
**预计时间**: 1小时

#### 目录结构

```
apps/web/
├── app/                    # Next.js App Router
│   ├── (auth)/            # 认证相关路由组
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/       # Dashboard 路由组
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── skills/
│   │   ├── namespaces/
│   │   └── analytics/
│   ├── api/               # API Routes
│   │   ├── auth/
│   │   ├── skills/
│   │   ├── namespaces/
│   │   └── reviews/
│   ├── skills/            # 公开页面
│   │   ├── [id]/
│   │   └── page.tsx
│   ├── layout.tsx
│   └── page.tsx
├── components/            # React 组件
│   ├── ui/               # 基础 UI 组件
│   ├── skills/           # Skill 相关组件
│   ├── namespaces/       # 命名空间组件
│   └── layout/           # 布局组件
├── lib/                  # 工具库
│   ├── prisma.ts
│   ├── auth.ts
│   └── utils.ts
├── hooks/                # 自定义 Hooks
│   ├── useSkills.ts
│   └── useNamespaces.ts
├── stores/               # Zustand stores
│   └── userStore.ts
├── types/                # TypeScript 类型
│   ├── skill.ts
│   ├── namespace.ts
│   └── index.ts
├── prisma/               # Prisma Schema
│   └── schema.prisma
├── public/               # 静态资源
└── styles/               # 全局样式
```

#### 执行步骤

```bash
# 创建目录结构
mkdir -p app/\(auth\)/login
mkdir -p app/\(auth\)/register
mkdir -p app/\(dashboard\)
mkdir -p app/\(dashboard\)/skills
mkdir -p app/\(dashboard\)/namespaces
mkdir -p app/\(dashboard\)/analytics
mkdir -p app/api/auth/\[...nextauth\]
mkdir -p app/api/skills
mkdir -p app/api/namespaces
mkdir -p app/api/reviews
mkdir -p app/skills/\[id\]
mkdir -p components/ui
mkdir -p components/skills
mkdir -p components/namespaces
mkdir -p components/layout
mkdir -p lib
mkdir -p hooks
mkdir -p stores
mkdir -p types
mkdir -p prisma
mkdir -p styles
```

#### 验收标准
- [ ] 目录结构完整
- [ ] 可以正常导入模块
- [ ] 路径别名 `@/*` 工作正常

---

### Task 9.1.3: 配置基础文件

**优先级**: 🔴 P0  
**预计时间**: 1小时

#### 需要创建的文件

1. **`app/layout.tsx`** - 根布局
2. **`app/page.tsx`** - 首页
3. **`components/layout/Header.tsx`** - 导航栏
4. **`components/layout/Footer.tsx`** - 页脚
5. **`styles/globals.css`** - 全局样式
6. **`lib/utils.ts`** - 工具函数
7. **`types/index.ts`** - 类型导出

#### 示例代码片段

```tsx
// app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@/styles/globals.css';
import { ThemeProvider } from '@/components/providers/ThemeProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Skill Hub - AI Agent Skills Registry',
  description: 'Enterprise-grade, open-source AI agent skill registry',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

#### 验收标准
- [ ] 页面正常渲染
- [ ] MUI 主题生效
- [ ] 响应式布局工作正常

---

## 🗓️ Day 2-3: 数据库设计与实现

### Task 9.2.1: 设计 Prisma Schema

**优先级**: 🔴 P0  
**预计时间**: 3小时

#### 执行步骤

创建 `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// 用户表
model User {
  id            String    @id @default(uuid())
  email         String    @unique
  name          String?
  image         String?
  emailVerified DateTime?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // 关系
  accounts      Account[]
  sessions      Session[]
  skills        Skill[]
  namespaces    NamespaceMember[]
  reviews       Review[]
  auditLogs     AuditLog[]

  @@map("users")
}

// Skill 表
model Skill {
  id            String    @id @default(uuid())
  name          String
  slug          String    @unique
  description   String
  version       String
  category      String
  tags          String[]
  
  // 文件
  packageUrl    String
  iconUrl       String?
  screenshots   String[]
  readme        String?
  
  // 状态
  status        SkillStatus @default(DRAFT)
  isPublic      Boolean   @default(false)
  price         Decimal   @default(0)
  currency      String    @default("CNY")
  
  // 统计
  downloadCount Int       @default(0)
  rating        Float     @default(0)
  reviewCount   Int       @default(0)
  
  // 关联
  authorId      String
  author        User      @relation(fields: [authorId], references: [id])
  namespaceId   String?
  namespace     Namespace? @relation(fields: [namespaceId], references: [id])
  
  versions      SkillVersion[]
  reviews       Review[]
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  @@index([slug])
  @@index([category])
  @@index([status])
  @@map("skills")
}

enum SkillStatus {
  DRAFT
  PENDING_REVIEW
  UNDER_REVIEW
  APPROVED
  REJECTED
  ARCHIVED
}

// Skill 版本历史
model SkillVersion {
  id          String   @id @default(uuid())
  skillId     String
  skill       Skill    @relation(fields: [skillId], references: [id], onDelete: Cascade)
  version     String
  changelog   String?
  packageUrl  String
  manifest    Json
  createdAt   DateTime @default(now())

  @@index([skillId])
  @@map("skill_versions")
}

// 命名空间表
model Namespace {
  id                  String    @id @default(uuid())
  name                String
  slug                String    @unique
  type                NamespaceType
  description         String?
  avatarUrl           String?
  
  visibility          String    @default("public")
  allowPublicPublish  Boolean   @default(false)
  
  ownerId             String
  owner               User      @relation(fields: [ownerId], references: [id])
  
  members             NamespaceMember[]
  skills              Skill[]
  policy              NamespacePolicy?
  
  skillCount          Int       @default(0)
  memberCount         Int       @default(1)
  downloadCount       Int       @default(0)
  
  createdAt           DateTime  @default(now())
  updatedAt           DateTime  @updatedAt

  @@index([slug])
  @@map("namespaces")
}

enum NamespaceType {
  PERSONAL
  TEAM
  GLOBAL
}

// 命名空间成员
model NamespaceMember {
  namespaceId   String
  namespace     Namespace @relation(fields: [namespaceId], references: [id], onDelete: Cascade)
  userId        String
  user          User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  role          NamespaceRole
  invitedBy     String?
  joinedAt      DateTime  @default(now())

  @@id([namespaceId, userId])
  @@map("namespace_members")
}

enum NamespaceRole {
  OWNER
  ADMIN
  MEMBER
  VIEWER
}

// 命名空间策略
model NamespacePolicy {
  namespaceId         String   @id
  namespace           Namespace @relation(fields: [namespaceId], references: [id], onDelete: Cascade)
  requireReview       Boolean  @default(true)
  autoApproveMembers  Boolean  @default(false)
  allowedVersions     String[] @default(["*"])
  maxPackageSizeMb    Int      @default(50)
  updatedAt           DateTime @updatedAt

  @@map("namespace_policies")
}

// 审核记录
model Review {
  id              String      @id @default(uuid())
  skillId         String
  skill           Skill       @relation(fields: [skillId], references: [id])
  version         String
  
  status          ReviewStatus @default(PENDING_REVIEW)
  previousStatus  ReviewStatus?
  
  reviewerId      String?
  reviewer        User?       @relation(fields: [reviewerId], references: [id])
  reviewNotes     String?
  rejectionReason String?
  
  automatedChecks Json?
  
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
  completedAt     DateTime?

  @@index([skillId])
  @@index([status])
  @@map("reviews")
}

enum ReviewStatus {
  DRAFT
  PENDING_REVIEW
  UNDER_REVIEW
  AUTO_APPROVED
  APPROVED
  REJECTED
  REQUIRES_CHANGES
  ARCHIVED
}

// 审计日志
model AuditLog {
  id            String   @id @default(uuid())
  action        String
  resourceType  String
  resourceId    String
  
  actorId       String?
  actor         User?    @relation(fields: [actorId], references: [id])
  actorIp       String?
  userAgent     String?
  
  metadata      Json?
  changes       Json?
  
  status        String   @default("success")
  errorMessage  String?
  
  createdAt     DateTime @default(now())

  @@index([actorId])
  @@index([resourceType, resourceId])
  @@index([action])
  @@index([createdAt(sort: Desc)])
  @@map("audit_logs")
}

// NextAuth 所需表
model Account {
  id                String  @id @default(uuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@map("accounts")
}

model Session {
  id           String   @id @default(uuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("sessions")
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
  @@map("verification_tokens")
}
```

#### 验收标准
- [ ] Schema 语法正确
- [ ] 所有关系定义完整
- [ ] 索引配置合理

---

### Task 9.2.2: 生成 Prisma Client

**优先级**: 🔴 P0  
**预计时间**: 30分钟

#### 执行步骤

```bash
# 1. 创建 .env 文件
cat > .env << EOF
DATABASE_URL="postgresql://postgres:password@localhost:5432/skillhub?schema=public"
NEXTAUTH_SECRET="your-secret-key-change-in-production"
NEXTAUTH_URL="http://localhost:3000"
EOF

# 2. 生成 Prisma Client
npx prisma generate

# 3. 推送数据库 Schema（如果有本地数据库）
npx prisma db push

# 4. 生成迁移文件（生产环境推荐）
npx prisma migrate dev --name init
```

#### 验收标准
- [ ] Prisma Client 生成成功
- [ ] 数据库表创建成功
- [ ] 可以在代码中导入 `@prisma/client`

---

### Task 9.2.3: 创建 Prisma 客户端单例

**优先级**: 🔴 P0  
**预计时间**: 30分钟

#### 创建文件：`lib/prisma.ts`

```typescript
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
```

#### 验收标准
- [ ] 可以成功导入 prisma 实例
- [ ] 开发环境不会创建多个实例
- [ ] TypeScript 类型提示正常

---

## 🗓️ Day 3-4: 认证系统

### Task 9.3.1: 配置 NextAuth

**优先级**: 🔴 P0  
**预计时间**: 2小时

#### 创建文件：`lib/auth.ts`

```typescript
import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import GitHub from 'next-auth/providers/github';
import Credentials from 'next-auth/providers/credentials';
import { prisma } from './prisma';

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        // TODO: 实现邮箱密码登录逻辑
        return null;
      },
    }),
  ],
  pages: {
    signIn: '/login',
    signOut: '/logout',
    error: '/auth/error',
  },
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
});
```

#### 创建文件：`app/api/auth/[...nextauth]/route.ts`

```typescript
import { handlers } from '@/lib/auth';

export const { GET, POST } = handlers;
```

#### 验收标准
- [ ] GitHub OAuth 登录可用
- [ ] Session 管理正常
- [ ] 受保护路由可以检查登录状态

---

### Task 9.3.2: 创建登录页面

**优先级**: 🟡 P1  
**预计时间**: 2小时

#### 创建文件：`app/(auth)/login/page.tsx`

```tsx
'use client';

import { signIn } from 'next-auth/react';
import { Button, Box, Typography, Divider } from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';

export default function LoginPage() {
  const handleGitHubLogin = () => {
    signIn('github', { callbackUrl: '/dashboard' });
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Box
        sx={{
          maxWidth: 400,
          width: '100%',
          p: 4,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
        }}
      >
        <Typography variant="h4" align="center" gutterBottom>
          登录 Skill Hub
        </Typography>
        
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
          使用 GitHub 账号快速登录
        </Typography>

        <Button
          fullWidth
          variant="outlined"
          startIcon={<GitHubIcon />}
          onClick={handleGitHubLogin}
          sx={{ mb: 2 }}
        >
          使用 GitHub 登录
        </Button>

        <Divider sx={{ my: 2 }}>
          <Typography variant="caption" color="text.secondary">
            或
          </Typography>
        </Divider>

        <Typography variant="caption" color="text.secondary" align="center" display="block">
          邮箱密码登录即将推出
        </Typography>
      </Box>
    </Box>
  );
}
```

#### 验收标准
- [ ] 登录页面正常显示
- [ ] GitHub 登录按钮可点击
- [ ] 登录后跳转到 Dashboard

---

### Task 9.3.3: 创建认证中间件

**优先级**: 🟡 P1  
**预计时间**: 1小时

#### 创建文件：`middleware.ts`

```typescript
import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isOnDashboard = req.nextUrl.pathname.startsWith('/dashboard');
  const isOnAuthPage = req.nextUrl.pathname.startsWith('/login') || 
                       req.nextUrl.pathname.startsWith('/register');

  // 未登录用户访问 Dashboard，重定向到登录页
  if (isOnDashboard && !isLoggedIn) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // 已登录用户访问登录页，重定向到 Dashboard
  if (isOnAuthPage && isLoggedIn) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/register'],
};
```

#### 验收标准
- [ ] 未登录用户无法访问 /dashboard
- [ ] 已登录用户自动跳转到 Dashboard
- [ ] 中间件不影响公开页面

---

## 🗓️ Day 4-5: 核心 API 开发

### Task 9.4.1: Skills API

**优先级**: 🔴 P0  
**预计时间**: 3小时

#### 创建文件：`app/api/skills/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

// GET /api/skills - 获取技能列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const namespace = searchParams.get('namespace');

    const skip = (page - 1) * limit;

    const where: any = {
      status: 'APPROVED',
      isPublic: true,
    };

    if (category) {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (namespace) {
      where.namespace = {
        slug: namespace,
      };
    }

    const [skills, total] = await Promise.all([
      prisma.skill.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          namespace: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      }),
      prisma.skill.count({ where }),
    ]);

    return NextResponse.json({
      skills,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Failed to fetch skills:', error);
    return NextResponse.json(
      { error: 'Failed to fetch skills' },
      { status: 500 }
    );
  }
}

// POST /api/skills - 创建技能
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, description, category, tags, namespaceSlug } = body;

    // 验证必填字段
    if (!name || !description || !category) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // 生成 slug
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // 查找命名空间
    let namespaceId: string | null = null;
    if (namespaceSlug) {
      const namespace = await prisma.namespace.findUnique({
        where: { slug: namespaceSlug },
      });
      
      if (!namespace) {
        return NextResponse.json(
          { error: 'Namespace not found' },
          { status: 404 }
        );
      }
      
      namespaceId = namespace.id;
    }

    const skill = await prisma.skill.create({
      data: {
        name,
        slug,
        description,
        category,
        tags: tags || [],
        version: '1.0.0',
        status: 'DRAFT',
        authorId: session.user.id,
        namespaceId,
      },
    });

    return NextResponse.json(skill, { status: 201 });
  } catch (error) {
    console.error('Failed to create skill:', error);
    return NextResponse.json(
      { error: 'Failed to create skill' },
      { status: 500 }
    );
  }
}
```

#### 验收标准
- [ ] GET /api/skills 返回技能列表
- [ ] 支持分页、搜索、筛选
- [ ] POST /api/skills 创建新技能
- [ ] 权限验证正确

---

### Task 9.4.2: Namespaces API

**优先级**: 🔴 P0  
**预计时间**: 2小时

#### 创建文件：`app/api/namespaces/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

// GET /api/namespaces - 获取命名空间列表
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const namespaces = await prisma.namespace.findMany({
      where: {
        OR: [
          { ownerId: session.user.id },
          {
            members: {
              some: {
                userId: session.user.id,
              },
            },
          },
        ],
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        _count: {
          select: {
            members: true,
            skills: true,
          },
        },
      },
    });

    return NextResponse.json(namespaces);
  } catch (error) {
    console.error('Failed to fetch namespaces:', error);
    return NextResponse.json(
      { error: 'Failed to fetch namespaces' },
      { status: 500 }
    );
  }
}

// POST /api/namespaces - 创建命名空间
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, type, description } = body;

    if (!name || !type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // 检查 slug 是否已存在
    const existing = await prisma.namespace.findUnique({
      where: { slug },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Namespace slug already exists' },
        { status: 409 }
      );
    }

    const namespace = await prisma.namespace.create({
      data: {
        name,
        slug,
        type,
        description,
        ownerId: session.user.id,
        members: {
          create: {
            userId: session.user.id,
            role: 'OWNER',
          },
        },
        policy: {
          create: {},
        },
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json(namespace, { status: 201 });
  } catch (error) {
    console.error('Failed to create namespace:', error);
    return NextResponse.json(
      { error: 'Failed to create namespace' },
      { status: 500 }
    );
  }
}
```

#### 验收标准
- [ ] 可以获取用户的命名空间列表
- [ ] 可以创建新的命名空间
- [ ] slug 唯一性验证生效

---

## 🗓️ Day 5-6: 前端页面开发

### Task 9.5.1: Dashboard 首页

**优先级**: 🔴 P0  
**预计时间**: 3小时

#### 创建文件：`app/(dashboard)/page.tsx`

```tsx
'use client';

import { useSession } from 'next-auth/react';
import { Box, Typography, Grid, Paper, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const { data: session } = useSession();
  const router = useRouter();

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          欢迎回来，{session?.user?.name}! 👋
        </Typography>
        <Typography variant="body1" color="text.secondary">
          管理你的 AI Skills 和命名空间
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* 统计卡片 */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" color="text.secondary">
              我的 Skills
            </Typography>
            <Typography variant="h3" sx={{ mt: 2 }}>
              0
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" color="text.secondary">
              总下载量
            </Typography>
            <Typography variant="h3" sx={{ mt: 2 }}>
              0
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" color="text.secondary">
              总收入
            </Typography>
            <Typography variant="h3" sx={{ mt: 2 }}>
              ¥0
            </Typography>
          </Paper>
        </Grid>

        {/* 快捷操作 */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              快捷操作
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => router.push('/dashboard/skills/new')}
              >
                发布新 Skill
              </Button>
              <Button
                variant="outlined"
                onClick={() => router.push('/dashboard/namespaces')}
              >
                管理命名空间
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
```

#### 验收标准
- [ ] Dashboard 页面正常显示
- [ ] 统计数据展示（暂时为0）
- [ ] 快捷操作按钮可用

---

### Task 9.5.2: Skills 列表页面

**优先级**: 🟡 P1  
**预计时间**: 2小时

#### 创建文件：`app/(dashboard)/skills/page.tsx`

```tsx
'use client';

import { useEffect, useState } from 'react';
import { Box, Typography, Card, CardContent, Grid, Chip } from '@mui/material';
import axios from 'axios';

interface Skill {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  downloadCount: number;
  rating: number;
  createdAt: string;
}

export default function SkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    try {
      const response = await axios.get('/api/skills');
      setSkills(response.data.skills);
    } catch (error) {
      console.error('Failed to fetch skills:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Typography>加载中...</Typography>;
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        我的 Skills
      </Typography>

      <Grid container spacing={3}>
        {skills.map((skill) => (
          <Grid item xs={12} md={6} lg={4} key={skill.id}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {skill.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {skill.description}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                  <Chip label={skill.category} size="small" />
                  {skill.tags.slice(0, 3).map((tag) => (
                    <Chip key={tag} label={tag} size="small" variant="outlined" />
                  ))}
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="caption" color="text.secondary">
                    ⬇️ {skill.downloadCount} 次下载
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    ⭐ {skill.rating.toFixed(1)}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {skills.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary">
            还没有发布任何 Skills
          </Typography>
        </Box>
      )}
    </Box>
  );
}
```

#### 验收标准
- [ ] Skills 列表正常显示
- [ ] 空状态提示友好
- [ ] 加载状态处理正确

---

## 🗓️ Day 6-7: 性能优化

### Task 9.6.1: 图片优化

**优先级**: 🟡 P1  
**预计时间**: 1小时

#### 配置 Next.js Image 优化

在 `next.config.js` 中添加：

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },
};

module.exports = nextConfig;
```

#### 验收标准
- [ ] 图片自动优化格式
- [ ] 懒加载生效
- [ ] 外部图片域名白名单配置

---

### Task 9.6.2: API 缓存配置

**优先级**: 🟢 P2  
**预计时间**: 1小时

#### 在 API Route 中添加缓存

```typescript
// app/api/skills/route.ts
export const dynamic = 'force-dynamic';
export const revalidate = 60; // 60秒缓存
```

#### 验收标准
- [ ] API 响应有缓存头
- [ ] 缓存时间配置正确

---

### Task 9.6.3: Lighthouse 优化

**优先级**: 🟢 P2  
**预计时间**: 2小时

#### 执行步骤

```bash
# 1. 构建生产版本
npm run build

# 2. 启动生产服务器
npm start

# 3. 运行 Lighthouse
# 在 Chrome DevTools 中运行 Lighthouse 审计
```

#### 优化目标
- [ ] Performance > 90
- [ ] Accessibility > 90
- [ ] Best Practices > 90
- [ ] SEO > 90

---

## ✅ Week 9 验收清单

### 必须完成（P0）
- [ ] Next.js 项目初始化并运行
- [ ] Prisma Schema 设计完成
- [ ] 数据库表创建成功
- [ ] NextAuth 配置完成
- [ ] GitHub OAuth 登录可用
- [ ] Skills API 基本功能
- [ ] Namespaces API 基本功能
- [ ] Dashboard 首页
- [ ] Skills 列表页面

### 建议完成（P1）
- [ ] 登录页面美化
- [ ] 认证中间件
- [ ] 图片优化配置
- [ ] API 缓存

### 可选完成（P2）
- [ ] Lighthouse 评分优化
- [ ] 更多前端页面
- [ ] 完整的 CRUD 操作

---

## 📊 预期成果

完成 Week 9 后，你将拥有：

✅ **可运行的 Web 应用**
- 用户可以登录/注册
- 查看和管理 Skills
- 创建和管理命名空间

✅ **完整的后端 API**
- RESTful API 设计
- 权限验证
- 数据持久化

✅ **性能优化基础**
- 图片优化
- API 缓存
- 良好的 Lighthouse 评分

---

## 🚀 下一步（Week 10）

Week 10 将专注于：
- 完善剩余前端页面
- 实现审核系统 UI
- Beta 测试
- 文档完善
- 准备开源发布

---

**开始时间**: 2026-04-17  
**预计完成**: 2026-04-23  
**当前状态**: 📋 待开始

需要我立即开始执行 Day 1 的任务吗？
