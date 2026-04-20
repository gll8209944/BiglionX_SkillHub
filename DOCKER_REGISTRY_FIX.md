# Docker 镜像源配置问题解决方案

## ❗ 问题描述

DeerFlow启动失败，错误信息：
```
failed to resolve reference "docker.io/library/nginx:alpine": 
dialing docker.mirrors.ustc.edu.cn:443: dial tcp: lookup docker.mirrors.ustc.edu.cn: no such host
```

**原因**: Docker Desktop配置了中科大镜像源 (docker.mirrors.ustc.edu.cn)，但该镜像源目前无法访问。

---

## ✅ 解决方案

### 方案1: 重置Docker镜像源为官方源（推荐）

#### Windows用户:

1. **打开Docker Desktop设置**
   - 右键点击任务栏的Docker图标
   - 选择 "Settings" 或 "设置"

2. **进入Docker Engine配置**
   - 左侧菜单选择 "Docker Engine"

3. **修改配置文件**
   
   找到类似这样的配置：
   ```json
   {
     "registry-mirrors": [
       "https://docker.mirrors.ustc.edu.cn"
     ]
   }
   ```
   
   **修改为**（删除registry-mirrows或使用其他可用源）：
   ```json
   {
     "builder": {
       "gc": {
         "defaultKeepStorage": "20GB",
         "enabled": true
       }
     },
     "experimental": false
   }
   ```

4. **应用并重启**
   - 点击 "Apply & restart"
   - 等待Docker重启完成

5. **验证配置**
   ```powershell
   docker info | Select-String "Registry Mirrors"
   # 应该没有输出或显示为空
   ```

6. **重新拉取镜像**
   ```powershell
   cd d:\BigLionX\SkillHub\deer-flow
   .\start-deerflow.ps1
   ```

---

### 方案2: 使用其他可用的国内镜像源

如果官方源速度慢，可以尝试以下镜像源：

**阿里云镜像**（需要注册）:
```json
{
  "registry-mirrors": [
    "https://your-id.mirror.aliyuncs.com"
  ]
}
```

**腾讯云镜像**:
```json
{
  "registry-mirrors": [
    "https://mirror.ccs.tencentyun.com"
  ]
}
```

**网易镜像**:
```json
{
  "registry-mirrors": [
    "https://hub-mirror.c.163.com"
  ]
}
```

---

### 方案3: 使用代理（如果有）

如果您有HTTP/HTTPS代理：

1. **Docker Desktop设置**
   - Settings → Resources → Proxies

2. **配置代理**
   ```
   HTTP Proxy: http://your-proxy:port
   HTTPS Proxy: http://your-proxy:port
   ```

3. **应用并重试**

---

## 🔧 快速修复脚本

创建一个PowerShell脚本来检查和修复：

```powershell
# fix-docker-registry.ps1

Write-Host "🔍 检查Docker配置..." -ForegroundColor Cyan

# 获取Docker信息
$dockerInfo = docker info 2>&1

if ($dockerInfo -match "Registry Mirrors") {
    Write-Host "⚠️  发现镜像源配置" -ForegroundColor Yellow
    $dockerInfo | Select-String "Registry Mirrors" -Context 0,2
    
    Write-Host ""
    Write-Host "请手动编辑Docker Desktop设置：" -ForegroundColor Green
    Write-Host "1. 右键Docker图标 → Settings" -ForegroundColor White
    Write-Host "2. 选择 Docker Engine" -ForegroundColor White
    Write-Host "3. 删除 registry-mirrors 配置" -ForegroundColor White
    Write-Host "4. 点击 Apply & restart" -ForegroundColor White
} else {
    Write-Host "✅ 未发现镜像源配置" -ForegroundColor Green
}

Write-Host ""
Write-Host "测试连接..." -ForegroundColor Cyan
docker pull hello-world

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Docker连接正常！" -ForegroundColor Green
} else {
    Write-Host "❌ Docker连接失败，请检查网络或代理设置" -ForegroundColor Red
}
```

---

## 📝 验证步骤

修复后，按以下步骤验证：

### 1. 测试基础镜像拉取
```powershell
docker pull nginx:alpine
docker pull redis:7-alpine
docker pull postgres:16-alpine
```

### 2. 检查镜像列表
```powershell
docker images
```

应该看到：
```
REPOSITORY   TAG       IMAGE ID       CREATED        SIZE
nginx        alpine    xxxxxxx        x hours ago    xxMB
redis        7-alpine  xxxxxxx        x hours ago    xxMB
postgres     16-alpine xxxxxxx        x hours ago    xxMB
```

### 3. 重新启动DeerFlow
```powershell
cd d:\BigLionX\SkillHub\deer-flow
.\start-deerflow.ps1
```

---

## 🐛 常见问题

### Q1: 修改配置后仍然失败？
**A**: 确保完全重启Docker Desktop：
1. 右键Docker图标 → Quit Docker Desktop
2. 等待完全退出
3. 重新启动Docker Desktop
4. 等待图标变绿

### Q2: 下载速度很慢？
**A**: 
- 使用国内镜像源（方案2）
- 或配置代理（方案3）
- 或在夜间网络空闲时下载

### Q3: 磁盘空间不足？
**A**: 清理未使用的镜像和容器：
```powershell
docker system prune -a
```

---

## 📞 需要帮助？

如果以上方案都无法解决：

1. **检查网络连接**
   ```powershell
   ping docker.io
   ```

2. **查看Docker日志**
   - Docker Desktop → Troubleshoot → Get Support

3. **重装Docker Desktop**
   - 卸载当前版本
   - 从 https://www.docker.com/products/docker-desktop 下载最新版
   - 重新安装

---

## ✅ 成功标志

修复成功后，您应该能够：
- ✅ 成功拉取Docker镜像
- ✅ 运行 `docker pull nginx:alpine` 无错误
- ✅ DeerFlow正常启动
- ✅ 访问 http://localhost:2026

---

**更新日期**: 2026-04-19  
**问题**: Docker镜像源配置错误  
**状态**: 待用户修复
