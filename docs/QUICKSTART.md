# 快速开始指南

## 项目说明

这是一个专业的救援机器人远程操控终端 Web 应用，集成了 Unity WebGL 游戏，提供实时的机器人控制和数据监测功能。

## 🚀 快速开始

### 1. 检查 Unity WebGL 文件

确保你的 Unity WebGL 构建文件位于以下位置：
```
/public/Build/
├── build.loader.js
├── build.data.unityweb
├── build.framework.js.unityweb
└── build.wasm.unityweb
```

### 2. 安装依赖
```bash
npm install
```

### 3. 启动开发服务器
```bash
npm run dev
```

访问 `http://localhost:5173` 在浏览器中查看。

### 4. 生产构建
```bash
npm run build
npm run preview  # 本地预览构建结果
```

## 🎮 操控方式

### 键盘快捷键

| 按键 | 功能 |
|------|------|
| **W** | 前进 |
| **A** | 左转 |
| **S** | 后退 |
| **D** | 右转 |
| **1** | 投放水资源 |
| **2** | 投放食物 |
| **F** | 切换手电筒 |
| **N** | 切换夜视仪 |

### UI 按钮操作

- **方向按钮**: 点击控制机器人移动（鼠标或触屏）
- **物资投放**: 点击对应按钮投放（需要有足够物资）
- **工具切换**: 点击工具按钮启用/禁用

## 📊 UI 布局说明

### 顶部状态栏
- 应用标题和版本
- 连接状态指示 (实时)
- 当前时间

### 左侧控制面板
- **移动控制**: 方向按钮或键盘
- **物资投放**: 水和食物按钮（显示剩余数量）
- **工具控制**: 手电筒和夜视
- **快速状态**: 工具启用/禁用指示

### 中央 Unity Canvas
- Unity WebGL 游戏主视图
- 所有游戏内容在此显示

### 右侧数据监测
- **环境监测**: 温度、空气质量、能见度
- **机器人状态**: 电池、物资剩余
- **生命体征探测**: NPC 检测警告

## ⚙️ 技术细节

### 配色方案
- **背景**: #0a0e27 (深灰蓝)
- **面板**: #1a1f3a (深蓝)
- **强调色**: 
  - 救援橙: #ff7043
  - 荧光绿: #4ade80
  - 警示红: #ef4444
  - 警告黄: #facc15
  - 提示蓝: #3b82f6

### 核心组件

#### App.jsx
主应用组件，处理：
- Unity 上下文初始化
- 键盘事件绑定
- 模拟数据生成
- 状态管理和消息传递

#### ControlPanel.jsx
操控界面，包含：
- 方向控制按钮
- 物资投放界面
- 工具切换开关
- 帮助提示

#### DataMonitor.jsx
数据实时监测，显示：
- 环境参数（温度、气体、能见度）
- 机器人健康状态
- 气体浓度等级判定

#### StatusBar.jsx
顶部状态栏：
- 连接状态动画指示
- 系统时间显示
- 快速帮助

### 数据流

```
键盘/按钮输入
    ↓
React 事件处理
    ↓
调用 Unity sendMessage()
    ↓
Robot GameObject 执行方法
    ↓
游戏逻辑处理
    ↓
发回反馈 (可选)
    ↓
更新 React 状态
    ↓
UI 重新渲染
```

## 🔧 自定义指南

### 修改 Unity Loader 路径

编辑 `src/App.jsx`:
```javascript
const { unityProvider } = useUnityContext({
  loaderUrl: '/Build/build.loader.js',  // ← 修改这里
  dataUrl: '/Build/build.data.unityweb',
  frameworkUrl: '/Build/build.framework.js.unityweb',
  codeUrl: '/Build/build.wasm.unityweb',
})
```

### 添加新的控制指令

在 `App.jsx` 的 `handleKeyDown` 函数中添加新的 case:
```javascript
case 'Q':
  sendMessage('Robot', 'EmergencyStop', '')
  break
```

在 `ControlPanel.jsx` 中添加对应按钮。

### 修改配色方案

编辑 `tailwind.config.js` 中的 colors 部分：
```javascript
colors: {
  'rescue-orange': '#ff7043',  // ← 修改这里
  // ...
}
```

### 添加新的数据监测项

在 `robotState` 中添加新字段，在 `DataMonitor.jsx` 中添加显示组件。

## 📱 响应式设计

应用支持三个断点：
- **桌面** (1024px+): 三列布局 (侧+中+侧)
- **平板** (768px-1024px): 优化的两列布局
- **手机** (<768px): 竖向堆叠布局

## 🐛 常见问题

### Unity 画布无法加载

1. 检查 `/public/Build/` 目录中是否有所有必需文件
2. 检查文件名是否与代码中配置的路径匹配
3. 在浏览器控制台检查 CORS 错误

### 按键无响应

1. 确保 Unity 实例已加载 (`isLoaded === true`)
2. 检查 Robot GameObject 是否在 Unity 场景中存在
3. 检查浏览器控制台是否有 JavaScript 错误

### 数据显示不更新

1. 确保 `useEffect` 依赖数组正确
2. 检查 `setInterval` 是否在组件卸载时被清除

## 📚 Unity 集成参考

### 必需的 C# 脚本

在 Unity 中创建以下脚本：

```csharp
using UnityEngine;

public class Robot : MonoBehaviour
{
    // 移动方法
    public void Move(string direction)
    {
        switch(direction)
        {
            case "forward":
                // 前进逻辑
                break;
            case "left":
                // 左转逻辑
                break;
            case "back":
                // 后退逻辑
                break;
            case "right":
                // 右转逻辑
                break;
        }
    }

    // 物资投放
    public void DropItem(string itemType)
    {
        if(itemType == "water")
        {
            // 投放水的逻辑
        }
        else if(itemType == "food")
        {
            // 投放食物的逻辑
        }
    }

    // 工具控制
    public void ToggleTool(string toolName)
    {
        if(toolName == "flashlight")
        {
            // 切换手电筒
        }
        else if(toolName == "nightvision")
        {
            // 切换夜视仪
        }
    }
}
```

## 📄 许可证

MIT License - 可自由使用和修改

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

**最后更新**: 2024年
**版本**: 1.0.0
