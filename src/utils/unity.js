// Unity 消息通信的辅助函数

export const robotCommands = {
  // 移动命令
  moveForward: (unityInstance) => unityInstance.sendMessage('Robot', 'Move', 'forward'),
  moveLeft: (unityInstance) => unityInstance.sendMessage('Robot', 'Move', 'left'),
  moveBack: (unityInstance) => unityInstance.sendMessage('Robot', 'Move', 'back'),
  moveRight: (unityInstance) => unityInstance.sendMessage('Robot', 'Move', 'right'),

  // 物资投放
  dropWater: (unityInstance) => unityInstance.sendMessage('Robot', 'DropItem', 'water'),
  dropFood: (unityInstance) => unityInstance.sendMessage('Robot', 'DropItem', 'food'),

  // 工具控制
  toggleFlashlight: (unityInstance) =>
    unityInstance.sendMessage('Robot', 'ToggleTool', 'flashlight'),
  toggleNightvision: (unityInstance) =>
    unityInstance.sendMessage('Robot', 'ToggleTool', 'nightvision'),

  // 紧急停止
  emergencyStop: (unityInstance) => unityInstance.sendMessage('Robot', 'EmergencyStop', ''),
}

// 数据模拟工具
export const generateMockData = () => {
  return {
    temperature: 20 + Math.random() * 15,
    gasLevel: Math.random(),
    visibility: 0.3 + Math.random() * 0.7,
    batteryDrain: Math.random() * 0.1,
  }
}

// 音效播放（如需要）
export const playSound = (soundName) => {
  // 可以集成第三方音频库，如 Tone.js 或 Howler.js
  console.log(`Playing sound: ${soundName}`)
}

// 本地存储管理
export const saveGameState = (state) => {
  try {
    localStorage.setItem('robotState', JSON.stringify(state))
  } catch (e) {
    console.error('Failed to save state:', e)
  }
}

export const loadGameState = () => {
  try {
    const state = localStorage.getItem('robotState')
    return state ? JSON.parse(state) : null
  } catch (e) {
    console.error('Failed to load state:', e)
    return null
  }
}
