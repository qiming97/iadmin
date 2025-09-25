# 环境变量配置说明

## Railway 部署环境变量

在 Railway 项目设置中添加以下环境变量：

```bash
# API 接口地址 - 必须配置
VITE_API_BASE_URL=https://your-backend-api-url.railway.app

# API 超时时间（可选，默认10000ms）
VITE_API_TIMEOUT=10000

# 环境标识（自动设置）
NODE_ENV=production
```

## 本地开发环境变量

创建 `.env` 文件（不会被提交到 git）：

```bash
# API Configuration
VITE_API_BASE_URL=http://localhost:3000
VITE_API_TIMEOUT=10000

# Environment
NODE_ENV=development
```

## 使用方法

1. 在 Railway 项目的 Variables 面板中设置 `VITE_API_BASE_URL`
2. 构建时 Vite 会自动替换 `import.meta.env.VITE_API_BASE_URL`
3. 静态文件部署后会使用配置的 API 地址
