// 常数定义

export const INITIAL_ROBOT_STATE = {
  battery: 85,
  waterCount: 10,
  foodCount: 10,
  temperature: 25,
  gasLevel: 0.3,
  visibility: 0.8,
  isFlashlightOn: false,
  isNightvisionOn: false,
  isPersonDetected: false,
  position: { x: 0, y: 0, z: 0 },
}

export const BATTERY_DRAIN_RATES = {
  idle: 0.05,
  moving: 0.15,
  toolActive: 0.10,
}

export const ENVIRONMENT_RANGES = {
  temperature: { min: 20, max: 35, initial: 25 },
  gasLevel: { min: 0, max: 1, initial: 0.3 },
  visibility: { min: 0.3, max: 1, initial: 0.8 },
}

export const COLORS = {
  rescueOrange: '#ff7043',
  rescueGreen: '#4ade80',
  rescueRed: '#ef4444',
  rescueYellow: '#facc15',
  rescueBlue: '#3b82f6',
  darkBg: '#0a0e27',
  darkPanel: '#1a1f3a',
  darkBorder: '#2d3748',
}

export const KEY_BINDINGS = {
  moveForward: 'w',
  moveLeft: 'a',
  moveBack: 's',
  moveRight: 'd',
  dropWater: '1',
  dropFood: '2',
  toggleFlashlight: 'f',
  toggleNightvision: 'n',
  emergencyStop: 'q',
}

export const ANIMATION_DURATIONS = {
  buttonClick: 95,
  colorTransition: 300,
  blinkCycle: 1000,
  dataUpdate: 1000,
}
