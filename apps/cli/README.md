# Skill Hub CLI

命令行工具，用于管理 Skill Hub 中的 AI Agent 技能。

## 安装

```bash
npm install -g @skillhub/cli
```

## 使用方法

### 发布技能

```bash
# 发布当前目录的技能
skillhub publish

# 发布指定路径的技能
skillhub publish ./my-skill

# 指定命名空间
skillhub publish -n my-namespace

# 仅验证而不发布
skillhub publish --dry-run
```

### 安装技能

```bash
# 安装技能
skillhub install skill-name

# 安装特定版本
skillhub install skill-name -v 1.0.0

# 全局安装（待实现）
skillhub install skill-name -g
```

### 搜索技能

```bash
# 搜索技能
skillhub search "inventory"

# 按标签筛选
skillhub search "replenishment" --tag ai

# 按命名空间筛选
skillhub search "smart" --namespace my-team
```

### 配置管理

```bash
# 查看当前配置
skillhub config

# 设置 API URL
skillhub config apiUrl https://your-skillhub.com

# 设置认证令牌
skillhub config token your-api-token

# 设置默认命名空间
skillhub config defaultNamespace my-namespace
```

## 配置

CLI 会将配置保存在 `~/.skillhub/config.json` 文件中。

也可以通过环境变量设置：
- `SKILLHUB_API_URL`: API 地址
- `SKILLHUB_TOKEN`: 认证令牌

## 开发

```bash
# 安装依赖
npm install

# 构建
npm run build

# 开发模式
npm run dev
```

## 许可证

Apache-2.0
