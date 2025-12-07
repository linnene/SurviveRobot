# 部署指南

## 🚀 快速部署

### 本地开发环境

```bash
# 1. 安装依赖
npm install

# 2. 启动开发服务器
npm run dev

# 3. 打开浏览器访问
# http://localhost:5173
```

### 生产构建

```bash
# 1. 创建优化的构建
npm run build

# 2. 检查构建输出
ls -la dist/

# 3. 本地测试构建结果
npm run preview

# 4. 访问预览
# http://localhost:4173
```

## 📦 部署到服务器

### 方案 A: Vercel (推荐)

```bash
# 1. 安装 Vercel CLI
npm i -g vercel

# 2. 部署
vercel

# 3. 跟随提示完成部署
```

**优点**: 
- 零配置部署
- 自动 HTTPS
- CDN 加速
- 环境变量管理

### 方案 B: Netlify

```bash
# 1. 连接 GitHub
# 在 https://app.netlify.com 连接仓库

# 2. 配置构建设置
# 构建命令: npm run build
# 发布目录: dist
```

### 方案 C: 传统 VPS (阿里云/腾讯云)

```bash
# 1. SSH 连接服务器
ssh user@your-server.com

# 2. 克隆项目
git clone <your-repo-url>
cd build

# 3. 安装依赖
npm install

# 4. 构建
npm run build

# 5. 使用 Nginx 作为反向代理
sudo cp -r dist/* /var/www/robot-terminal/
```

**Nginx 配置** (`/etc/nginx/sites-available/robot-terminal`):
```nginx
server {
    listen 80;
    server_name your-domain.com;

    root /var/www/robot-terminal;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # 缓存静态文件
    location ~* \.(js|css|woff|woff2)$ {
        expires 365d;
        add_header Cache-Control "public, immutable";
    }

    # Unity WebGL 文件
    location /Build/ {
        expires 30d;
        add_header Cache-Control "public";
        add_header 'Access-Control-Allow-Origin' '*';
    }
}
```

启用站点:
```bash
sudo ln -s /etc/nginx/sites-available/robot-terminal /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 方案 D: Docker 容器化

创建 `Dockerfile`:
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=0 /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

构建和运行:
```bash
# 构建镜像
docker build -t rescue-robot-terminal:1.0 .

# 运行容器
docker run -d -p 80:80 --name robot-terminal rescue-robot-terminal:1.0

# 查看日志
docker logs -f robot-terminal

# 停止容器
docker stop robot-terminal
```

## 🔒 安全配置

### HTTPS 配置 (使用 Let's Encrypt)

```bash
# 1. 安装 Certbot
sudo apt-get install certbot python3-certbot-nginx

# 2. 获取证书
sudo certbot certonly --nginx -d your-domain.com

# 3. Nginx 配置 HTTPS
server {
    listen 443 ssl;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # 其他配置...
}

# 4. 重定向 HTTP 到 HTTPS
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}
```

### CORS 配置

如果 Unity WebGL 文件在其他域:
```javascript
// vite.config.js
export default {
  server: {
    proxy: {
      '/Build': {
        target: 'https://cdn.example.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/Build/, '')
      }
    }
  }
}
```

## 📊 性能优化

### 1. CDN 加速

对于大型 Unity WebGL 文件，使用 CDN:
- **Cloudflare**: 免费 CDN
- **七牛云**: 国内高速
- **AWS CloudFront**: 全球加速

配置 Vite:
```javascript
// vite.config.js
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'unity': ['react-unity-webgl'],
        }
      }
    }
  }
}
```

### 2. 代码分割

```javascript
// App.jsx
const ControlPanel = React.lazy(() => import('./components/ControlPanel'))
const DataMonitor = React.lazy(() => import('./components/DataMonitor'))

<Suspense fallback={<Loading />}>
  <ControlPanel {...props} />
</Suspense>
```

### 3. 图片优化

使用 WebP 格式:
```html
<picture>
  <source srcset="image.webp" type="image/webp">
  <img src="image.png" alt="description">
</picture>
```

## 📈 监控和日志

### Google Analytics

```javascript
// main.jsx
import ReactGA from 'react-ga4'

ReactGA.initialize('G-XXXXXXXXXX')
ReactGA.send('pageview')
```

### 错误追踪 (Sentry)

```javascript
import * as Sentry from "@sentry/react"

Sentry.init({
  dsn: "https://xxx@sentry.io/yyy",
  environment: process.env.NODE_ENV,
})
```

### 日志系统

```javascript
// 创建 logger.js
export const logger = {
  error: (msg, err) => console.error(`[ERROR] ${msg}`, err),
  warn: (msg) => console.warn(`[WARN] ${msg}`),
  info: (msg) => console.log(`[INFO] ${msg}`),
}
```

## 🔄 CI/CD 流程

### GitHub Actions 配置

创建 `.github/workflows/deploy.yml`:
```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Install dependencies
        run: npm install
      
      - name: Build
        run: npm run build
      
      - name: Deploy to Vercel
        uses: vercel/action@master
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

## 📝 环境变量

创建 `.env.production`:
```env
VITE_API_URL=https://api.example.com
VITE_SOCKET_URL=wss://socket.example.com
VITE_ANALYTICS_ID=G-XXXXXXXXXX
```

在代码中使用:
```javascript
const API_URL = import.meta.env.VITE_API_URL
```

## 🧪 预部署检查清单

- [ ] 所有依赖已更新到最新版本
- [ ] 构建成功，无警告或错误
- [ ] Unity WebGL 文件正确位置
- [ ] 环境变量已配置
- [ ] HTTPS 已启用
- [ ] CORS 策略已配置
- [ ] 性能指标满足要求 (LCP < 2.5s)
- [ ] 响应式设计在各设备上正常
- [ ] 错误日志收集已配置
- [ ] 备份计划已制定

## 🚨 故障排查

### 构建失败

```bash
# 1. 清除缓存
rm -rf node_modules package-lock.json
npm install

# 2. 重新构建
npm run build

# 3. 检查错误日志
npm run build --verbose
```

### 页面加载缓慢

1. 使用 DevTools 检查网络瀑布图
2. 检查 Unity WebGL 文件大小
3. 启用 Gzip 压缩
4. 使用 CDN

### Unity 无法加载

1. 检查浏览器控制台错误
2. 验证文件 MIME 类型
3. 检查 CORS 头
4. 确认路径正确

## 📞 支持

- 文档: `README.md`
- 快速开始: `QUICKSTART.md`
- 项目结构: `PROJECT_STRUCTURE.md`

---

**最后更新**: 2024年
