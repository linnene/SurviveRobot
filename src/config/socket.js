/**
 * Socket 配置
 */

// WebSocket 服务器地址（浏览器需要通过 WebSocket 连接）
// 注意：由于浏览器不支持直接 TCP，需要配置 WebSocket-to-TCP 代理
export const SOCKET_CONFIG = {
  // 开发环境
  development: {
    url: 'ws://localhost:50001',
    reconnectInterval: 3000,
    heartbeatTimeout: 10000,
  },
  // 生产环境
  production: {
    url: 'ws://your-server.com:50001',
    reconnectInterval: 5000,
    heartbeatTimeout: 15000,
  },
}

// 获取当前环境配置
export function getSocketConfig() {
  const env = import.meta.env.MODE || 'development'
  return SOCKET_CONFIG[env] || SOCKET_CONFIG.development
}

// WebSocket 代理说明
export const PROXY_SETUP_GUIDE = `
由于浏览器安全限制，无法直接创建 TCP Socket 连接。
需要在服务端配置一个 WebSocket-to-TCP 代理。

推荐方案：

1. 使用 Node.js 创建代理服务器
   安装依赖: npm install ws net
   
   创建 proxy.js:
   
   const WebSocket = require('ws');
   const net = require('net');
   
   const wss = new WebSocket.Server({ port: 50001 });
   
   wss.on('connection', (ws) => {
     console.log('WebSocket 客户端已连接');
     
     // 连接到 Unity TCP 服务器
     const tcpClient = new net.Socket();
     tcpClient.connect(50002, '127.0.0.1', () => {
       console.log('已连接到 Unity TCP 服务器');
     });
     
     // WebSocket -> TCP
     ws.on('message', (data) => {
       tcpClient.write(data + '\\n');
     });
     
     // TCP -> WebSocket
     tcpClient.on('data', (data) => {
       ws.send(data.toString());
     });
     
     // 错误处理
     ws.on('close', () => {
       tcpClient.end();
     });
     
     tcpClient.on('close', () => {
       ws.close();
     });
   });
   
   console.log('WebSocket 代理服务器运行在 ws://localhost:50001');

2. 或者在 Unity 端直接实现 WebSocket 服务器
   使用 Unity 的 WebSocket 插件（如 websocket-sharp）

3. 运行代理
   node proxy.js
`
