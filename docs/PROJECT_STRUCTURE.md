# 项目结构说明

## 📁 完整的目录树

```
/Users/woodq/Downloads/build/
├── public/
│   ├── Build/                      # Unity WebGL 构建文件
│   │   ├── build.loader.js        # Unity 加载器
│   │   ├── build.data.unityweb    # 游戏数据
│   │   ├── build.framework.js.unityweb
│   │   └── build.wasm.unityweb
│   └── TemplateData/              # 原始模板资源
│       └── style.css
│
├── src/
│   ├── main.jsx                    # React 应用入口
│   ├── index.css                   # 全局样式 + Tailwind
│   ├── App.jsx                     # 主应用组件
│   ├── App.css                     # App 组件样式
│   │
│   ├── components/                 # React 组件
│   │   ├── ControlPanel.jsx        # 操控面板（移动、物资、工具）
│   │   ├── DataMonitor.jsx         # 数据监测面板
│   │   ├── StatusBar.jsx           # 顶部状态栏
│   │   ├── AlertPanel.jsx          # ⭐ 警报面板（可选）
│   │   ├── RadarPanel.jsx          # ⭐ 位置雷达（可选）
│   │   └── SystemInfo.jsx          # ⭐ 系统信息（可选）
│   │
│   └── utils/                      # 工具函数
│       ├── unity.js                # Unity 通信辅助
│       ├── calculations.js         # 数据计算函数
│       ├── constants.js            # 常量定义
│       └── hooks.js                # 自定义 React hooks
│
├── index.html                      # HTML 入口文件
├── package.json                    # 项目配置 + 依赖
├── vite.config.js                  # Vite 配置
├── tailwind.config.js              # Tailwind CSS 配置
├── postcss.config.js               # PostCSS 配置
├── tsconfig.json                   # TypeScript 配置（可选）
├── .gitignore                      # Git 忽略文件
├── .env.example                    # 环境变量示例
├── README.md                       # 项目说明
└── QUICKSTART.md                   # 快速开始指南
```

## 📋 核心文件说明

### 入口文件

#### `index.html`
- Vite 应用的 HTML 入口点
- 定义了根 DOM 节点 `<div id="root"></div>`
- 加载 React 应用脚本

#### `src/main.jsx`
```javascript
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// 将 React 应用挂载到 DOM
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

### 主应用组件

#### `src/App.jsx` (核心)
负责以下功能：
1. **Unity 初始化**
   - 使用 `useUnityContext` 加载 WebGL 实例
   - 配置 Loader、数据、Framework、Code 路径

2. **状态管理** (`robotState`)
   - 电池、物资、传感器数据
   - 工具状态、位置信息

3. **输入处理**
   - 键盘事件监听 (W/A/S/D, 1/2, F/N)
   - 将输入转化为 Unity sendMessage 调用

4. **数据模拟**
   - 每秒更新环境数据
   - 模拟温度、气体、能见度的自然波动

5. **UI 布局**
   - 三列布局: 左控制 + 中 Canvas + 右监测
   - 顶部状态栏

### UI 组件

#### `src/components/ControlPanel.jsx`
操控界面，包含：
- **移动控制**: 4 个方向按钮 (网格 3x3)
- **物资投放**: 水、食物按钮（显示剩余数量）
- **工具控制**: 手电筒、夜视按钮（状态指示）
- **帮助信息**: 快速参考按键

**主要功能**:
```javascript
<button onMouseDown={() => handleMouseDown('forward')}>
  前进 (W)
</button>
```

#### `src/components/DataMonitor.jsx`
数据监测面板，显示：
- 温度 (20-35°C 范围)
- 空气质量 (气体浓度 0-100%)
- 能见度 (0-100%)

带有彩色进度条和危险警告。

#### `src/components/StatusBar.jsx`
顶部状态栏，包含：
- 应用标题和版本
- 连接状态（带动画）
- 系统时间
- 快速帮助提示

#### `src/components/AlertPanel.jsx` (可选)
智能警报系统：
- 低电量警告 (<20%)
- 高气体浓度警告 (>70%)
- 低能见度警告 (<50%)
- 生命体征探测提示

#### `src/components/RadarPanel.jsx` (可选)
位置追踪雷达：
- 同心圆雷达网格
- 机器人位置（蓝色脉冲点）
- NPC 位置（红色闪烁点）
- XYZ 坐标显示

#### `src/components/SystemInfo.jsx` (可选)
系统信息面板：
- FPS 显示
- 运行时间统计
- 内存占用
- 连接状态

### 工具模块

#### `src/utils/unity.js`
Unity 通信辅助：
```javascript
// 命令映射
robotCommands.moveForward(unityInstance)
robotCommands.dropWater(unityInstance)
robotCommands.toggleFlashlight(unityInstance)

// 数据模拟
generateMockData()

// 本地存储
saveGameState(state)
loadGameState()
```

#### `src/utils/calculations.js`
数据计算函数：
- `getTemperatureStatus()` - 温度等级判定
- `getGasQualityStatus()` - 气体质量评估
- `getBatteryStatus()` - 电池状态分类
- `calculateBatteryDrain()` - 电量消耗计算

#### `src/utils/constants.js`
常数定义：
```javascript
INITIAL_ROBOT_STATE      // 初始机器人状态
BATTERY_DRAIN_RATES      // 耗电率
ENVIRONMENT_RANGES       // 环境参数范围
COLORS                   // 配色方案
KEY_BINDINGS             // 按键绑定
ANIMATION_DURATIONS      // 动画时长
```

#### `src/utils/hooks.js`
自定义 React Hooks：
```javascript
useMediaQuery(query)     // 响应式布局检测
breakpoints              // 响应式断点定义
```

## 🎨 样式系统

### `src/index.css`
全局样式：
- Tailwind 指令
- 自定义滚动条
- 玻璃态效果 (`.glass-panel`)
- 按钮动画 (`.btn-active`)
- Unity Canvas 容器样式

### `src/App.css`
应用级样式：
- 布局 Flex 设置
- 响应式断点
- 加载动画
- 主题适配

### `tailwind.config.js`
Tailwind 配置：
- **颜色扩展**: 救援系列色彩
- **字体**: Monaco 等宽字体
- **动画**: 脉冲、闪烁等自定义动画

## ⚙️ 配置文件

### `package.json`
依赖管理：
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-unity-webgl": "^9.3.0",
    "lucide-react": "^0.344.0"
  },
  "devDependencies": {
    "vite": "^5.0.8",
    "tailwindcss": "^3.3.6",
    ...
  }
}
```

### `vite.config.js`
Vite 配置：
- React 插件
- 开发服务器端口: 5173
- 构建输出目录: dist

### `tailwind.config.js`
Tailwind 定制：
- 颜色深定制
- 字体扩展
- 动画定义

## 🔄 数据流向

```
用户输入 (键盘/鼠标)
    ↓
React 事件处理器
    ↓
setState 更新本地状态
    ↓
sendMessage 发送给 Unity
    ↓
Robot GameObject 执行操作
    ↓
游戏逻辑处理 (移动、投放等)
    ↓
UI 重新渲染 (基于新状态)
```

## 🚀 开发工作流

### 添加新功能的步骤

1. **定义新命令** (`src/utils/constants.js`)
   ```javascript
   KEY_BINDINGS.newCommand = 'x'
   ```

2. **实现 Unity 通信** (`src/utils/unity.js`)
   ```javascript
   robotCommands.newCommand = (instance) => 
     instance.sendMessage('Robot', 'NewMethod', '')
   ```

3. **添加 UI 按钮** (`src/components/ControlPanel.jsx`)
   ```javascript
   <button onClick={() => handleMouseDown('newCommand')}>
     新功能
   </button>
   ```

4. **处理输入** (`src/App.jsx`)
   ```javascript
   case 'X':
     sendMessage('Robot', 'NewMethod', '')
     break
   ```

5. **更新状态和显示**
   ```javascript
   setRobotState(prev => ({ ...prev, newField: value }))
   ```

## 📱 响应式断点

| 设备 | 宽度 | 布局 |
|------|------|------|
| 手机 | <640px | 竖向堆叠 |
| 平板 | 640-1024px | 两列优化 |
| 桌面 | >1024px | 三列标准 |

## 🎯 性能优化建议

1. **代码分割**: 使用 `React.lazy()` 和 `Suspense`
2. **图片优化**: 使用 SVG 图标而不是位图
3. **状态管理**: 考虑使用 `useCallback` 避免重渲染
4. **动画优化**: 使用 CSS transforms 而不是 position 改变

## 📚 扩展指南

### 集成数据库
```javascript
// 保存游戏数据到服务器
await fetch('/api/save-state', {
  method: 'POST',
  body: JSON.stringify(robotState)
})
```

### 添加多人联网
```javascript
// 使用 WebSocket
const ws = new WebSocket('wss://server/robot-control')
ws.onmessage = (msg) => updateRemoteState(JSON.parse(msg.data))
```

### 集成语音控制
```javascript
// 使用 Web Speech API
const recognition = new webkitSpeechRecognition()
recognition.onresult = (event) => {
  const command = event.results[0][0].transcript
  executeCommand(command)
}
```

---

**最后更新**: 2024年
**维护者**: 你的名字
