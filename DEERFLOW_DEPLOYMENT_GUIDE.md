# DeerFlow 部署指南

**日期**: 2026-04-19  
**状态**: 环境准备完成，等待Docker启动

---

## ✅ 已完成的工作

### 1. 仓库克隆
- ✅ DeerFlow仓库已成功克隆到 `d:/BigLionX/SkillHub/deer-flow`
- ✅ 包含所有必要的文件和脚本

### 2. 环境配置
- ✅ 创建了 `.env` 文件（从 `.env.example` 复制）
- ✅ 添加了SkillHub相关的API Keys配置：
  - OPENAI_API_KEY (占位符)
  - GITHUB_TOKEN (已配置)
  - SKILLSMP_API_KEY (已配置)
  - SKILLHUB_DATABASE_URL (已配置)

### 3. Docker检查
- ✅ Docker已安装 (版本 29.2.0)
- ⚠️ Docker Desktop未运行（需要手动启动）

---

## 🚀 下一步操作

### 步骤1: 启动Docker Desktop (用户操作)

**Windows用户**:
1. 在开始菜单中找到 "Docker Desktop"
2. 点击启动
3. 等待Docker图标变为绿色（表示正在运行）
4. 通常需要1-2分钟

**验证Docker是否运行**:
```bash
docker info
# 应该看到服务器信息，而不是错误消息
```

---

### 步骤2: 生成DeerFlow配置文件

Docker启动后，运行以下命令：

```bash
cd d:/BigLionX/SkillHub/deer-flow
make config
```

这将：
- 从 `config.example.yaml` 创建 `config.yaml`
- 设置默认配置
- 您可以后续编辑 `config.yaml` 自定义设置

---

### 步骤3: 初始化Docker环境

```bash
make docker-init
```

这将：
- 拉取必要的Docker镜像
- 准备沙盒环境
- 可能需要几分钟时间（取决于网络速度）

---

### 步骤4: 配置OpenAI API Key

编辑 `deer-flow/.env` 文件：

```bash
notepad .env
```

找到这一行：
```
OPENAI_API_KEY=your-openai-api-key-here
```

替换为您的真实API Key：
```
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxx
```

**获取API Key**: https://platform.openai.com/api-keys

---

### 步骤5: 启动DeerFlow

```bash
make docker-start
```

这将启动：
- Backend服务 (LangGraph服务器)
- Frontend服务 (Web界面)
- Gateway服务 (API网关)

**访问地址**: http://localhost:2026

---

## 📋 配置说明

### 当前.env配置

```env
# SkillHub集成配置
OPENAI_API_KEY=your-openai-api-key-here  # ← 需要替换
GITHUB_TOKEN=ghp_YOUR_GITHUB_TOKEN_HERE  # ← 需要替换
SKILLSMP_API_KEY=sk_live_skillsmp_YOUR_API_KEY_HERE  # ← 需要替换
SKILLHUB_DATABASE_URL=postgresql://...  # ← 需要替换
```

### config.yaml (待生成)

运行 `make config` 后会生成此文件，主要配置项包括：
- **models**: LLM模型配置
- **agents**: Agent编排设置
- **tools**: 工具配置（搜索、爬虫等）
- **storage**: 存储后端配置

---

## 🔧 常用命令

### 开发模式
```bash
make dev              # 启动开发模式（热重载）
make dev-daemon       # 后台运行开发模式
make stop             # 停止所有服务
```

### Docker模式
```bash
make docker-start     # 启动Docker服务
make docker-stop      # 停止Docker服务
make docker-logs      # 查看日志
make down             # 停止并移除容器
```

### 诊断和维护
```bash
make doctor           # 检查系统要求
make check            # 检查依赖
make clean            # 清理临时文件
```

---

## 🎯 SkillHub集成计划

一旦DeerFlow运行起来，我们将：

### 1. 创建自定义Skills
在 `deer-flow/skills/` 目录创建：
- `skillhub-discovery.ts` - 技能发现Agent
- `skillhub-crawler.ts` - 数据抓取Agent
- `skillhub-validator.ts` - 质量验证Agent
- `skillhub-indexer.ts` - 索引构建Agent

### 2. 实现发现流水线
创建 `SkillDiscoveryPipeline` 类：
- 定时任务调度
- 自动化技能发现
- 数据验证和索引

### 3. 与SkillHub集成
- 通过API将发现的skills写入SkillHub数据库
- 使用现有的EmbeddingService生成向量
- 实现双向同步机制

---

## ⚠️ 注意事项

### 资源需求
- **内存**: 至少8GB RAM（推荐16GB）
- **磁盘**: 至少10GB可用空间
- **CPU**: 多核处理器推荐

### 网络要求
- 首次启动需要下载Docker镜像（~2-5GB）
- 需要访问OpenAI API
- 需要访问GitHub API

### 成本估算
- **OpenAI API**: $10-30/月（取决于使用量）
- **Docker**: 免费
- **其他APIs**: 可选

---

## 🐛 故障排查

### 问题1: Docker无法启动
**症状**: `docker info` 显示连接错误

**解决**:
1. 确保Docker Desktop已安装
2. 重启Docker Desktop应用
3. 检查Windows Hyper-V是否启用
4. 以管理员身份运行Docker

### 问题2: make命令不可用
**症状**: `'make' is not recognized`

**解决**:
选项A: 安装Make for Windows
```bash
# 使用Chocolatey
choco install make

# 或使用Scoop
scoop install make
```

选项B: 直接运行脚本
```bash
# 替代 make config
python scripts/configure.py

# 替代 make docker-init
bash scripts/docker.sh init
```

### 问题3: 端口冲突
**症状**: 端口2026已被占用

**解决**:
```bash
# 查看谁在使用端口2026
netstat -ano | findstr :2026

# 杀死进程或更改端口
# 编辑 config.yaml 修改端口配置
```

---

## 📞 需要帮助?

### 官方资源
- GitHub: https://github.com/bytedance/deer-flow
- 文档: https://deerflow.tech/docs
- Issues: https://github.com/bytedance/deer-flow/issues

### SkillHub相关
- 查看 `docs/DEERFLOW_INTEGRATION_GUIDE.md` 了解详细集成方案
- 参考 `TASK_8_9_IMPLEMENTATION_SUMMARY.md` 了解整体进度

---

## ✅ 检查清单

在继续之前，请确认：

- [ ] Docker Desktop已启动并运行
- [ ] 运行 `docker info` 无错误
- [ ] OpenAI API Key已配置到 `.env`
- [ ] 已运行 `make config` 生成配置文件
- [ ] 已运行 `make docker-init` 完成初始化
- [ ] 可以访问 http://localhost:2026

---

**下一步**: 启动Docker Desktop后，按照上述步骤2-5执行

**预计时间**: 
- Docker启动: 1-2分钟
- 配置生成: 30秒
- Docker初始化: 5-10分钟（首次）
- 服务启动: 2-3分钟

**总计**: 约10-15分钟
