# WebSocket 代理服务器

由于浏览器安全限制，无法直接创建 TCP Socket 连接到 Unity 服务器（127.0.0.1:50001）。  
因此需要一个 **WebSocket-to-TCP 代理服务器** 作为桥梁。

## 架构

```
前端 (浏览器)  <--WebSocket-->  代理服务器  <--TCP-->  Unity 游戏服务器
   (React)     ws://localhost:50001          127.0.0.1:50002
```

## 方案选择

### 方案 A: Node.js 代理服务器 (推荐)

已提供完整的代理服务器代码：`proxy-server.js`

#### 1. 安装依赖

```bash
npm install ws
# 'net' 模块是 Node.js 内置的，无需安装
```

#### 2. 配置 Unity 端口

Unity TCP 服务器默认监听 **50002** 端口（可在代码中修改）。

#### 3. 启动代理服务器

```bash
node proxy-server.js
```

输出：
```
[Proxy] WebSocket 服务器运行在 ws://localhost:50001
[Proxy] 将转发到 TCP 服务器 127.0.0.1:50002
```

#### 4. 测试连接

启动前端应用：
```bash
npm run dev
```

前端会自动尝试连接 `ws://localhost:50001`。

---

### 方案 B: Unity 直接实现 WebSocket 服务器

如果不想运行额外的代理，可以让 Unity 直接使用 WebSocket 协议。

#### 使用 Unity WebSocket 插件

推荐插件：
- **websocket-sharp**: https://github.com/sta/websocket-sharp
- **NativeWebSocket**: https://github.com/endel/NativeWebSocket

示例代码（C#）：
```csharp
using WebSocketSharp;
using WebSocketSharp.Server;

public class RobotWebSocketServer : MonoBehaviour {
    private WebSocketServer wss;

    void Start() {
        wss = new WebSocketServer(50001);
        wss.AddWebSocketService<RobotService>("/");
        wss.Start();
        Debug.Log("WebSocket 服务器启动: ws://localhost:50001");
    }

    void OnApplicationQuit() {
        wss?.Stop();
    }
}

public class RobotService : WebSocketBehavior {
    protected override void OnMessage(MessageEventArgs e) {
        // 处理前端消息
        string json = e.Data;
        // ... 解析 JSON 并执行操作
        
        // 发送响应
        Send("{\"topic\":\"action_result\",\"body\":{\"status\":\"ok\"}}");
    }
}
```

---

## 消息协议

### 前端 -> 服务器

```json
{
  "topic": "action",
  "body": {
    "action": "place_item",
    "itemType": "water",
    "count": 1
  }
}
```

### 服务器 -> 前端

```json
{
  "topic": "player_status",
  "body": {
    "timestamp": "2025-12-07T12:34:56.789Z",
    "playerId": "player-001",
    "npcId": "npc-closest",
    "distanceToNpc": 12.34,
    "inventory": {
      "capacity": 20,
      "used": 7,
      "items": [
        {"type": "water", "count": 3},
        {"type": "food", "count": 4}
      ]
    },
    "position": {"x": 10.2, "y": 1.0, "z": -3.7}
  }
}
```

---

## 调试

### 查看代理日志

代理服务器会打印所有转发的消息：
```
[Proxy] WS -> TCP: {"topic":"action","body":{"action":"place_item",...}}
[Proxy] TCP -> WS: {"topic":"action_result","body":{"status":"ok",...}}
```

### 使用 Postman 测试

1. 打开 Postman
2. 新建 WebSocket 请求
3. 连接到 `ws://localhost:50001`
4. 发送测试消息

### Chrome DevTools

1. 打开浏览器控制台 (F12)
2. 切换到 Network -> WS 标签
3. 查看 WebSocket 连接和消息

---

## 生产部署

### 使用 PM2 管理代理进程

```bash
# 安装 PM2
npm install -g pm2

# 启动代理服务器
pm2 start proxy-server.js --name robot-proxy

# 查看日志
pm2 logs robot-proxy

# 开机自启动
pm2 startup
pm2 save
```

### Docker 容器化

创建 `Dockerfile.proxy`:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY proxy-server.js package.json ./
RUN npm install ws
EXPOSE 50001
CMD ["node", "proxy-server.js"]
```

构建和运行：
```bash
docker build -f Dockerfile.proxy -t robot-proxy .
docker run -d -p 50001:50001 --name robot-proxy robot-proxy
```

---

## 常见问题

### Q: 前端显示 "连接中..." 但无法连接？

**A**: 检查：
1. 代理服务器是否运行 (`node proxy-server.js`)
2. Unity TCP 服务器是否在 50002 端口监听
3. 防火墙是否阻止连接

### Q: 连接成功但没有数据？

**A**: 
1. 检查 Unity 是否定时推送 `player_status` 消息
2. 查看代理服务器日志，确认有数据转发
3. 检查消息格式是否符合协议规范

### Q: 能否跨域连接？

**A**: 
可以。修改 `proxy-server.js` 中的 `TCP_HOST` 和 `TCP_PORT` 指向远程服务器。  
注意防火墙和网络安全配置。

---

## 性能优化

1. **消息批处理**: 合并多条小消息
2. **压缩**: 使用 permessage-deflate 扩展
3. **心跳优化**: 调整心跳间隔避免过于频繁

---

**最后更新**: 2024年  
**维护者**: 你的名字
