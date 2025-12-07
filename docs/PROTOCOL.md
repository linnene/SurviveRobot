# Socket 通信协议规范

## 概述

本文档定义了前端 (React) 与 Unity 游戏服务器之间的 TCP Socket 通信协议。

## 连接信息

| 参数 | 值 |
|------|------|
| 协议 | TCP (通过 WebSocket 桥接) |
| 地址 | 127.0.0.1 |
| 端口 | 50001 (WebSocket) → 50002 (Unity TCP) |
| 编码 | UTF-8 |
| 格式 | JSON (按行分隔，以 `\n` 结尾) |

## 消息结构

所有消息采用统一的 JSON 格式：

```json
{
  "topic": "消息主题",
  "body": { /* 消息体 */ }
}
```

## 消息类型

### 1. 玩家状态推送 (服务端 → 前端)

**Topic**: `player_status`

**频率**: 定时推送 (建议 1 次/秒) 或事件驱动

**Body**:
```json
{
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
  "position": {
    "x": 10.2,
    "y": 1.0,
    "z": -3.7
  },
  "cameraYaw": 180.0,
  "cameraPitch": 12.0
}
```

**字段说明**:

| 字段 | 类型 | 必需 | 说明 |
|------|------|------|------|
| timestamp | string | ✓ | ISO 8601 格式时间戳 (UTC) |
| playerId | string | ✓ | 玩家唯一标识 |
| npcId | string | ✓ | 最近 NPC 的 ID |
| distanceToNpc | number | ✓ | 与最近 NPC 的距离 (米)，保留 2 位小数 |
| inventory.capacity | number | ✓ | 背包容量上限 (单位：件) |
| inventory.used | number | ✓ | 已用容量 |
| inventory.items | array | ✓ | 物品列表，每项包含 type 和 count |
| position | object | ✗ | 玩家位置坐标 (x, y, z) |
| cameraYaw | number | ✗ | 相机偏航角 (度) |
| cameraPitch | number | ✗ | 相机俯仰角 (度) |

---

### 2. 操作指令 (前端 → 服务端)

**Topic**: `action`

**触发**: 用户按键或 UI 按钮点击

**Body** (放置物品):
```json
{
  "action": "place_item",
  "itemType": "water",
  "count": 1
}
```

**字段说明**:

| 字段 | 类型 | 必需 | 说明 |
|------|------|------|------|
| action | string | ✓ | 操作类型，当前仅支持 `place_item` |
| itemType | string | ✓ | 物品类型: `water` 或 `food` |
| count | number | ✓ | 数量，默认 1 |

**约束**:
- `itemType` 仅支持 `water` 和 `food`
- `count` 必须 ≤ 当前库存对应项的数量
- 背包规则: `used + count ≤ capacity`

---

### 3. 操作结果 (服务端 → 前端)

**Topic**: `action_result`

**触发**: 响应前端的 `action` 指令

**Body**:
```json
{
  "action": "place_item",
  "status": "ok",
  "remaining": {
    "water": 2,
    "food": 4
  }
}
```

**字段说明**:

| 字段 | 类型 | 必需 | 说明 |
|------|------|------|------|
| action | string | ✓ | 对应的操作类型 |
| status | string | ✓ | 状态，成功为 `ok` |
| remaining | object | ✓ | 操作后剩余的物品数量 |

---

### 4. 错误响应 (服务端 → 前端)

**Topic**: `error`

**触发**: 操作失败或协议错误

**Body**:
```json
{
  "code": "INSUFFICIENT_ITEM",
  "message": "not enough water",
  "correlationId": "abc-123"
}
```

**字段说明**:

| 字段 | 类型 | 必需 | 说明 |
|------|------|------|------|
| code | string | ✓ | 错误代码 (见下表) |
| message | string | ✓ | 人类可读的错误描述 |
| correlationId | string | ✗ | 关联 ID，用于追踪请求 |

**错误代码**:

| 代码 | 说明 |
|------|------|
| `INSUFFICIENT_ITEM` | 物品数量不足 |
| `INVALID_ITEM` | 无效的物品类型 |
| `CAPACITY_EXCEEDED` | 背包容量已满 |
| `BAD_REQUEST` | 请求格式错误 |
| `INTERNAL_ERROR` | 服务器内部错误 |

---

### 5. 心跳 (可选)

**Topic**: `heartbeat`

**方向**: 服务端 → 前端 或 双向

**频率**: 建议 5-10 秒/次

**Body**:
```json
{
  "timestamp": "2025-12-07T12:34:56.789Z"
}
```

**用途**: 
- 保持连接活跃
- 检测断线

---

## 交互流程

### 完整流程示例

```
1. 前端连接到 ws://localhost:50001
   ↓
2. WebSocket 代理转发到 Unity TCP (127.0.0.1:50002)
   ↓
3. Unity 定时推送玩家状态
   {"topic":"player_status","body":{...}}
   ↓
4. 前端接收并更新 UI
   ↓
5. 用户点击"投放水"按钮
   ↓
6. 前端发送操作指令
   {"topic":"action","body":{"action":"place_item","itemType":"water","count":1}}
   ↓
7. Unity 处理请求并返回结果
   {"topic":"action_result","body":{"status":"ok","remaining":{"water":2,"food":4}}}
   ↓
8. 前端更新物品数量显示
```

### 错误处理流程

```
1. 用户尝试投放水 (但库存为 0)
   ↓
2. 前端发送指令
   {"topic":"action","body":{"action":"place_item","itemType":"water","count":1}}
   ↓
3. Unity 检测到库存不足
   ↓
4. Unity 返回错误
   {"topic":"error","body":{"code":"INSUFFICIENT_ITEM","message":"not enough water"}}
   ↓
5. 前端显示错误提示
```

---

## 数据规则

### 背包容量计算

- **容量上限**: `capacity` 字段定义 (默认 20)
- **已用容量**: `used = sum(items[].count)`
- **可用容量**: `capacity - used`

### 距离计算

- **3D 距离**: `sqrt((x2-x1)² + (y2-y1)² + (z2-z1)²)`
- **水平距离**: `sqrt((x2-x1)² + (z2-z1)²)` (忽略 Y 轴)

前端默认使用 3D 距离，Unity 可根据需求调整。

### 时间戳格式

- **标准**: ISO 8601 (UTC)
- **示例**: `2025-12-07T12:34:56.789Z`
- **JavaScript**: `new Date().toISOString()`
- **C#**: `DateTime.UtcNow.ToString("o")`

### 数值精度

| 数据 | 精度 |
|------|------|
| 距离 (distanceToNpc) | 2 位小数 |
| 位置坐标 (x, y, z) | 1 位小数 |
| 角度 (yaw, pitch) | 1 位小数 |

---

## 示例消息

### 示例 1: 服务端推送状态

```json
{
  "topic": "player_status",
  "body": {
    "timestamp": "2025-12-07T12:34:56.789Z",
    "playerId": "player-001",
    "npcId": "npc-closest",
    "distanceToNpc": 8.52,
    "inventory": {
      "capacity": 20,
      "used": 6,
      "items": [
        {"type": "water", "count": 3},
        {"type": "food", "count": 3}
      ]
    },
    "position": {"x": 10.2, "y": 1.0, "z": -3.7},
    "cameraYaw": 180.0,
    "cameraPitch": 12.0
  }
}
```

### 示例 2: 前端请求放置食物

```json
{
  "topic": "action",
  "body": {
    "action": "place_item",
    "itemType": "food",
    "count": 1
  }
}
```

### 示例 3: 服务端成功响应

```json
{
  "topic": "action_result",
  "body": {
    "action": "place_item",
    "status": "ok",
    "remaining": {
      "water": 3,
      "food": 2
    }
  }
}
```

### 示例 4: 服务端错误响应

```json
{
  "topic": "error",
  "body": {
    "code": "INSUFFICIENT_ITEM",
    "message": "not enough food",
    "correlationId": "abc-123"
  }
}
```

---

## 实现参考

### 前端 (React)

```javascript
import { socketClient } from './services/socketClient'

// 连接服务器
socketClient.connect('ws://localhost:50001')

// 监听玩家状态
socketClient.on('player_status', (data) => {
  console.log('玩家状态:', data)
  updateUI(data)
})

// 发送放置指令
socketClient.placeItem('water', 1)

// 监听结果
socketClient.on('action_result', (data) => {
  console.log('操作成功:', data)
})

// 监听错误
socketClient.on('server_error', (data) => {
  console.error('错误:', data.message)
})
```

### Unity (C#)

参考 README.md 中的 Unity TCP 服务器实现。

---

## 调试工具

### Chrome DevTools

1. 打开控制台 (F12)
2. 切换到 Network → WS
3. 查看 WebSocket 消息

### Postman

1. 新建 WebSocket 请求
2. 连接到 `ws://localhost:50001`
3. 发送测试消息

### 日志

代理服务器会打印所有消息：
```
[Proxy] WS -> TCP: {"topic":"action",...}
[Proxy] TCP -> WS: {"topic":"action_result",...}
```

---

## 版本历史

| 版本 | 日期 | 变更 |
|------|------|------|
| 1.0 | 2024-12-07 | 初始版本 |

---

**维护者**: 你的名字  
**最后更新**: 2024年12月7日
