# Unity WebGL JavaScript Bridge 通信架构

## 概述

本项目已升级为使用 Unity WebGL 的 JavaScript Bridge（jslib）进行双向通信，替代了之前的 TCP Socket 连接方式。这种新架构提供了更直接、更高效的 Unity 与 JavaScript 之间的通信。

## 架构组件

### 1. Unity 端 (C#)

#### PlayerStatusServer.cs

- **功能**: 玩家状态服务器，负责收集和推送游戏状态
- **新增特性**:
  - 支持接收 JavaScript 消息的`OnMessageFromJS`方法
  - 处理操作指令（放置物品、重置任务等）
  - 双向通信支持

#### WebGLBridge.jslib

- **功能**: Unity WebGL JavaScript 桥接库
- **提供方法**:
  - `SendMessageToJS`: 发送消息到 JavaScript
  - `RegisterUnityCallback`: 注册 Unity 回调方法
  - `IsWebGLPlatform`: 检测 WebGL 平台

### 2. JavaScript 端

#### JSBridgeClient.js

- **功能**: JavaScript 桥接客户端
- **特性**:
  - 监听 Unity 消息事件
  - 向 Unity 发送命令
  - 自动初始化和连接管理
  - 事件驱动架构

#### UnifiedClient.js

- **功能**: 统一客户端适配器
- **特性**:
  - 自动检测运行环境（Unity WebGL vs 普通 Web）
  - 提供统一的 API 接口
  - 向后兼容现有 Socket 客户端代码

## 通信流程

### Unity -> JavaScript

1. Unity 游戏状态更新
2. `PlayerStatusServer.BuildStatusJson()` 构建 JSON 消息
3. 通过`SendMessageToJS()`发送到 JavaScript
4. WebGLBridge.jslib 处理并分发消息
5. JavaScript 事件监听器接收并处理消息

### JavaScript -> Unity

1. JavaScript 调用`window.sendToUnity(message)`
2. WebGLBridge.jslib 接收消息
3. 通过`unityInstance.SendMessage()`调用 Unity 方法
4. Unity 的`OnMessageFromJS()`处理消息
5. 执行相应的游戏逻辑

## 消息格式

### 玩家状态消息 (Unity -> JS)

```json
{
  "topic": "player_status",
  "body": {
    "timestamp": "2025-12-08T10:30:00.000Z",
    "position": { "x": 0.0, "y": 0.0, "z": 0.0 },
    "distanceToNpc": 5.2,
    "inventory": {
      "capacity": 10,
      "used": 3,
      "items": [
        { "type": "water", "count": 2 },
        { "type": "food", "count": 1 }
      ]
    },
    "flashlightOn": true,
    "npcIsFollowing": false,
    "missionCompleted": false
    // ... 其他状态字段
  }
}
```

### 操作指令消息 (JS -> Unity)

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

### 操作结果消息 (Unity -> JS)

```json
{
  "topic": "action_result",
  "body": {
    "action": "place_item",
    "status": "ok",
    "itemType": "water",
    "count": 1,
    "remaining": {
      "water": 1,
      "food": 2
    }
  }
}
```

## 使用示例

### React 组件中使用统一客户端

```javascript
import { unifiedClient } from "../services/unifiedClient";

function GameControl() {
  useEffect(() => {
    // 监听玩家状态
    const handlePlayerStatus = (data) => {
      console.log("玩家状态:", data);
    };

    unifiedClient.on("player_status", handlePlayerStatus);

    // 连接（自动检测环境）
    unifiedClient.connect();

    return () => {
      unifiedClient.off("player_status", handlePlayerStatus);
    };
  }, []);

  const placeWater = () => {
    unifiedClient.placeItem("water", 1);
  };

  return <button onClick={placeWater}>放置水</button>;
}
```

### 直接使用 JSBridge 客户端

```javascript
import { jsBridgeClient } from "../services/jsBridgeClient";

// 等待连接就绪
await jsBridgeClient.waitForReady();

// 发送消息
jsBridgeClient.sendToUnity({
  topic: "action",
  body: { action: "place_item", itemType: "food", count: 1 },
});

// 监听响应
jsBridgeClient.on("action_result", (result) => {
  console.log("操作结果:", result);
});
```

## 环境检测

系统会自动检测运行环境：

- **Unity WebGL**: 检测到 Unity 实例时使用 JSBridge
- **普通 Web**: 使用 Socket 客户端（向后兼容）

检测条件：

- 存在`window.unityInstance`
- 存在`window.sendToUnity`
- 存在 Unity WebGL canvas 元素

## 错误处理

### 常见错误及解决方案

1. **"Unity instance not ready"**

   - 原因: Unity 还未完全加载
   - 解决: 使用`jsBridgeClient.waitForReady()`等待

2. **"Callback not registered"**

   - 原因: Unity 回调未注册
   - 解决: 确保 Unity 中`RegisterUnityCallback`被正确调用

3. **消息格式错误**
   - 原因: JSON 格式不正确
   - 解决: 使用预定义的消息创建函数

## 性能优势

相比 TCP Socket 方式：

- **延迟更低**: 直接内存通信，无网络开销
- **更稳定**: 不受网络环境影响
- **更简单**: 无需额外的代理服务器
- **更安全**: 不暴露网络端口

## 测试

使用`JSBridgeTest`组件进行功能测试：

```javascript
import JSBridgeTest from "./components/JSBridgeTest";

function App() {
  return <JSBridgeTest />;
}
```

测试功能包括：

- 连接状态监控
- 双向消息收发
- 操作指令测试
- 实时状态显示

## 迁移指南

从 Socket 客户端迁移到 JSBridge：

1. 导入改为使用`unifiedClient`
2. 现有代码无需修改（API 兼容）
3. 在 Unity WebGL 环境下自动使用 JSBridge
4. 在其他环境下继续使用 Socket

```javascript
// 旧代码
import { socketClient } from "./services/socketClient";

// 新代码（向后兼容）
import { unifiedClient as socketClient } from "./services/unifiedClient";
```
