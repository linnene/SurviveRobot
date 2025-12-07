# 救援机器人远程操控终端 🤖

基于 React + Vite + Tailwind CSS 开发的 Unity WebGL 游戏操控界面，通过 **TCP Socket (WebSocket 桥接)** 实现实时双向通信。

## ✨ 新特性 (v2.0)

### 🔌 实时 Socket 通信
- **TCP Socket 连接**: 通过 WebSocket 代理连接到 Unity 服务器 (127.0.0.1:50001)
- **双向数据流**: 实时接收玩家状态 + 发送操作指令
- **自动重连**: 断线自动重连机制
- **错误处理**: 完善的错误提示和日志系统

### 📊 实时数据同步
- 玩家位置、背包物品实时更新
- NPC 距离探测和生命体征警报
- 服务器状态实时监控

## 功能特性

### 1. Unity 集成
- 使用 `react-unity-webgl` 加载 Unity WebGL 实例
- 完整的消息传递系统 (sendMessage to Robot GameObject)
- 自适应 Canvas 容器

### 2. Socket 通信系统 (⭐ 新增)
- **协议**: TCP over WebSocket
- **地址**: 127.0.0.1:50001
- **编码**: UTF-8
- **格式**: JSON (按行分隔)
- **消息类型**:
  - `player_status`: 玩家状态推送
  - `action`: 操作指令
  - `action_result`: 操作结果
  - `error`: 错误响应
  - `heartbeat`: 心跳检测

### 3. 操控系统
#### 键盘控制
- **移动**: W/A/S/D (前左后右)
- **投放**: 1=水 / 2=食物
- **工具**: F=手电筒 / N=夜视

#### UI 按钮控制
- 方向按钮 (手机友好)
- 物资投放按钮 (显示剩余数量)
- 工具切换按钮 (状态指示)

### 3. 数据监测面板
- **环境监测**: 温度、空气质量、能见度 (实时模拟数据)
- **机器人状态**: 电池电量、携带物资、工具状态
- **生命体征探测**: NPC 存在警告

### 4. UI/UX 特色
- 工业风深色主题 (救援橙、荧光绿、警示红)
- 玻璃态毛玻璃效果 (glass morphism)
- 按钮反馈动画 (按压、阴影、动画)
- 实时数据变化增加沉浸感

## 项目结构

```
src/
├── main.jsx              # 入口文件
├── index.css             # 全局样式 + Tailwind
├── App.jsx               # 主应用组件 (Unity + 布局)
└── components/
    ├── ControlPanel.jsx  # 操控面板
    ├── DataMonitor.jsx   # 数据监测
    └── StatusBar.jsx     # 顶部状态栏
```

## 安装 & 运行

### 步骤 1: 安装依赖

```bash
npm install
```

### 步骤 2: 启动 WebSocket 代理服务器

由于浏览器无法直接创建 TCP 连接，需要先启动代理服务器：

```bash
# 单独启动代理
npm run proxy

# 或者同时启动前端和代理
npm run dev:all
```

代理服务器会监听 `ws://localhost:50001`，并转发到 Unity TCP 服务器 (127.0.0.1:50002)。

详细配置请参考：[PROXY_SETUP.md](./PROXY_SETUP.md)

### 步骤 3: 启动前端开发服务器

```bash
npm run dev
# 访问 http://localhost:5173
```

### 生产构建

```bash
npm run build
npm run preview
```

## Unity 集成说明

### WebGL 接口 (保留旧方式)

在 Unity 场景中创建名为 "Robot" 的 GameObject：

```csharp
public class Robot : MonoBehaviour {
    // 移动: forward | left | back | right
    public void Move(string direction) { }
    
    // 投放: water | food
    public void DropItem(string itemType) { }
    
    // 工具切换: flashlight | nightvision
    public void ToggleTool(string toolName) { }
}
```

### TCP Socket 服务器 (⭐ 新增)

Unity 需要实现 TCP 服务器，监听 **50002** 端口（或根据配置修改）：

```csharp
using System;
using System.Net;
using System.Net.Sockets;
using System.Text;
using UnityEngine;
using Newtonsoft.Json;

public class TcpServer : MonoBehaviour {
    private TcpListener listener;
    private TcpClient client;
    private NetworkStream stream;
    
    void Start() {
        listener = new TcpListener(IPAddress.Parse("127.0.0.1"), 50002);
        listener.Start();
        Debug.Log("TCP 服务器启动: 127.0.0.1:50002");
        
        // 异步接受连接
        listener.BeginAcceptTcpClient(OnClientConnect, null);
    }
    
    void OnClientConnect(IAsyncResult result) {
        client = listener.EndAcceptTcpClient(result);
        stream = client.GetStream();
        Debug.Log("客户端已连接");
        
        // 开始读取数据
        BeginRead();
    }
    
    void BeginRead() {
        byte[] buffer = new byte[4096];
        stream.BeginRead(buffer, 0, buffer.Length, OnDataReceived, buffer);
    }
    
    void OnDataReceived(IAsyncResult result) {
        byte[] buffer = (byte[])result.AsyncState;
        int bytesRead = stream.EndRead(result);
        
        if (bytesRead > 0) {
            string json = Encoding.UTF8.GetString(buffer, 0, bytesRead);
            HandleMessage(json);
            BeginRead(); // 继续读取
        }
    }
    
    void HandleMessage(string json) {
        var msg = JsonConvert.DeserializeObject<Message>(json);
        
        if (msg.topic == "action") {
            var body = msg.body;
            if (body.action == "place_item") {
                PlaceItem(body.itemType, body.count);
            }
        }
    }
    
    void PlaceItem(string itemType, int count) {
        // 实现物品放置逻辑
        Debug.Log($"放置物品: {itemType} x{count}");
        
        // 发送响应
        SendActionResult("place_item", "ok");
    }
    
    void SendActionResult(string action, string status) {
        var response = new {
            topic = "action_result",
            body = new {
                action = action,
                status = status,
                remaining = new {
                    water = 3,
                    food = 2
                }
            }
        };
        
        string json = JsonConvert.SerializeObject(response) + "\n";
        byte[] data = Encoding.UTF8.GetBytes(json);
        stream.Write(data, 0, data.length);
    }
    
    // 定时推送玩家状态
    void Update() {
        if (Time.frameCount % 60 == 0) { // 每秒推送
            SendPlayerStatus();
        }
    }
    
    void SendPlayerStatus() {
        var status = new {
            topic = "player_status",
            body = new {
                timestamp = DateTime.UtcNow.ToString("o"),
                playerId = "player-001",
                npcId = "npc-closest",
                distanceToNpc = 12.34f,
                inventory = new {
                    capacity = 20,
                    used = 7,
                    items = new[] {
                        new { type = "water", count = 3 },
                        new { type = "food", count = 4 }
                    }
                },
                position = new {
                    x = transform.position.x,
                    y = transform.position.y,
                    z = transform.position.z
                }
            }
        };
        
        string json = JsonConvert.SerializeObject(status) + "\n";
        byte[] data = Encoding.UTF8.GetBytes(json);
        stream?.Write(data, 0, data.Length);
    }
}

[Serializable]
public class Message {
    public string topic;
    public MessageBody body;
}

[Serializable]
public class MessageBody {
    public string action;
    public string itemType;
    public int count;
}
```

## 配置项

### Loader 路径
编辑 `src/App.jsx` 中的 `useUnityContext` 配置:
```javascript
const { unityProvider } = useUnityContext({
  loaderUrl: '/Build/build.loader.js',
  dataUrl: '/Build/build.data.unityweb',
  frameworkUrl: '/Build/build.framework.js.unityweb',
  codeUrl: '/Build/build.wasm.unityweb',
})
```

## 响应式设计

- 布局采用 flexbox，支持各种屏幕尺寸
- 侧边栏在小屏幕上可隐藏 (可扩展功能)
- 按钮大小符合费茨定律 (可触碰区域 ≥ 44x44px)

## 动画与过渡

- 按钮按压: `scale(0.95)` 
- 状态变化: 色彩平滑过渡 (300ms)
- 警告闪烁: `animate-blink` (1s 周期)
- 加载动画: `animate-pulse-slow` (2s 周期)

## 技术栈

- **React 18**: UI 框架
- **Vite 5**: 构建工具
- **Tailwind CSS 3**: 样式框架
- **Lucide React**: 图标库
- **react-unity-webgl**: Unity 桥接库

## 浏览器兼容性

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 许可证

MIT
