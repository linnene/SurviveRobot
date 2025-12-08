import { useState, useRef, useEffect } from 'react'
import { Unity, useUnityContext } from 'react-unity-webgl'
import RobotHUD from './components/RobotHUD'
import JSBridgeTest from './components/JSBridgeTest'
import { useSocket, usePlayerStatus, useAction } from './hooks/useSocket'
import { ITEM_TYPES } from './services/messageTypes'
import './App.css'

function App() {
  const [activeTab, setActiveTab] = useState('game') // 'game' 或 'test'
  
  const { unityProvider, sendMessage, isLoaded } = useUnityContext({
    loaderUrl: '/Build/build.loader.js',
    dataUrl: '/Build/build.data',
    frameworkUrl: '/Build/build.framework.js',
    codeUrl: '/Build/build.wasm',
  })

  // 统一客户端连接 (自动检测JSBridge或Socket)
  const { isConnected: isSocketConnected, connectionState } = useSocket('ws://localhost:50001')
  const playerStatus = usePlayerStatus()
  const { placeItem, lastError, clearError } = useAction()

  const [robotState, setRobotState] = useState({
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
    distanceToNpc: 0,
    npcId: null,
    playerId: null,
  })

  const [isMoving, setIsMoving] = useState({
    forward: false,
    left: false,
    back: false,
    right: false,
  })

  const keysPressed = useRef({})

  // 同步统一客户端数据到 robotState
  useEffect(() => {
    if (playerStatus) {
      console.log('[App] 更新robotState，playerStatus:', playerStatus)
      setRobotState((prev) => ({
        ...prev,
        waterCount: playerStatus.inventory?.items?.water || 0,
        foodCount: playerStatus.inventory?.items?.food || 0,
        position: playerStatus.position || prev.position,
        distanceToNpc: playerStatus.distanceToNpc || 0,
        npcId: playerStatus.npcId || prev.npcId,
        playerId: playerStatus.playerId || prev.playerId,
        // 从Unity数据同步手电筒和夜视状态
        isFlashlightOn: playerStatus.flashlightOn || false,
        isNightvisionOn: playerStatus.nightVisionOn || false,
        // 根据距离和Unity数据判断是否检测到幸存者
        isPersonDetected: (playerStatus.distanceToNpc > 0 && playerStatus.distanceToNpc < 15) || playerStatus.npcIsFollowing,
        // 添加任务相关状态
        missionCompleted: playerStatus.missionCompleted || false,
        npcFollowUnlocked: playerStatus.npcFollowUnlocked || false,
        npcIsFollowing: playerStatus.npcIsFollowing || false,
        playerTraveledDistance: playerStatus.playerTraveledDistance || 0,
      }))
    }
  }, [playerStatus])

  // 显示错误提示
  useEffect(() => {
    if (lastError) {
      alert(`错误: ${lastError.message}\n详情: ${lastError.details || '无'}`)
      clearError()
    }
  }, [lastError, clearError])

  // 初始化键盘监听
  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key.toUpperCase()
      keysPressed.current[key] = true

      if (isLoaded) {
        switch (key) {
          case 'W':
            setIsMoving(prev => ({ ...prev, forward: true }))
            sendMessage('Robot', 'Move', 'forward')
            break
          case 'A':
            setIsMoving(prev => ({ ...prev, left: true }))
            sendMessage('Robot', 'Move', 'left')
            break
          case 'S':
            setIsMoving(prev => ({ ...prev, back: true }))
            sendMessage('Robot', 'Move', 'back')
            break
          case 'D':
            setIsMoving(prev => ({ ...prev, right: true }))
            sendMessage('Robot', 'Move', 'right')
            break
          case '1':
            // 通过 Socket 发送放置指令
            if (isSocketConnected && robotState.waterCount > 0) {
              placeItem(ITEM_TYPES.WATER, 1)
            }
            // 同时通知 Unity（如果需要）
            if (isLoaded) {
              sendMessage('Robot', 'DropItem', 'water')
            }
            break
          case '2':
            // 通过 Socket 发送放置指令
            if (isSocketConnected && robotState.foodCount > 0) {
              placeItem(ITEM_TYPES.FOOD, 1)
            }
            // 同时通知 Unity（如果需要）
            if (isLoaded) {
              sendMessage('Robot', 'DropItem', 'food')
            }
            break
          case 'F':
            sendMessage('Robot', 'ToggleTool', 'flashlight')
            setRobotState(prev => ({
              ...prev,
              isFlashlightOn: !prev.isFlashlightOn,
            }))
            break
          case 'N':
            sendMessage('Robot', 'ToggleTool', 'nightvision')
            setRobotState(prev => ({
              ...prev,
              isNightvisionOn: !prev.isNightvisionOn,
            }))
            break
          default:
            break
        }
      }
    }

    const handleKeyUp = (e) => {
      const key = e.key.toUpperCase()
      keysPressed.current[key] = false

      if (isLoaded) {
        switch (key) {
          case 'W':
            setIsMoving(prev => ({ ...prev, forward: false }))
            break
          case 'A':
            setIsMoving(prev => ({ ...prev, left: false }))
            break
          case 'S':
            setIsMoving(prev => ({ ...prev, back: false }))
            break
          case 'D':
            setIsMoving(prev => ({ ...prev, right: false }))
            break
          default:
            break
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [isLoaded, sendMessage])

  // 模拟数据更新
  useEffect(() => {
    const interval = setInterval(() => {
      setRobotState(prev => {
        // 电池缓慢下降
        let newBattery = prev.battery - Math.random() * 0.1
        if (newBattery < 0) newBattery = 0

        // 温度波动
        let newTemp = prev.temperature + (Math.random() - 0.5) * 0.5
        newTemp = Math.max(20, Math.min(35, newTemp))

        // 气体浓度波动
        let newGasLevel = prev.gasLevel + (Math.random() - 0.5) * 0.02
        newGasLevel = Math.max(0, Math.min(1, newGasLevel))

        // 能见度波动
        let newVisibility = prev.visibility + (Math.random() - 0.5) * 0.01
        newVisibility = Math.max(0.3, Math.min(1, newVisibility))

        // 模拟随机生命体征探测
        const isPersonDetected = Math.random() > 0.95

        return {
          ...prev,
          battery: newBattery,
          temperature: newTemp,
          gasLevel: newGasLevel,
          visibility: newVisibility,
          isPersonDetected: isPersonDetected || prev.isPersonDetected,
        }
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const handleDropItem = (type) => {
    setRobotState(prev => {
      if (type === 'water' && prev.waterCount > 0) {
        return { ...prev, waterCount: prev.waterCount - 1 }
      }
      if (type === 'food' && prev.foodCount > 0) {
        return { ...prev, foodCount: prev.foodCount - 1 }
      }
      return prev
    })
  }

  const handleButtonPress = (action) => {
    switch (action) {
      case 'forward':
        if (isLoaded) sendMessage('Robot', 'Move', 'forward')
        setIsMoving(prev => ({ ...prev, forward: true }))
        break
      case 'left':
        if (isLoaded) sendMessage('Robot', 'Move', 'left')
        setIsMoving(prev => ({ ...prev, left: true }))
        break
      case 'back':
        if (isLoaded) sendMessage('Robot', 'Move', 'back')
        setIsMoving(prev => ({ ...prev, back: true }))
        break
      case 'right':
        if (isLoaded) sendMessage('Robot', 'Move', 'right')
        setIsMoving(prev => ({ ...prev, right: true }))
        break
      case 'water':
        if (robotState.waterCount > 0) {
          // 通过 Socket 发送
          if (isSocketConnected) {
            placeItem(ITEM_TYPES.WATER, 1)
          }
          // 通知 Unity
          if (isLoaded) {
            sendMessage('Robot', 'DropItem', 'water')
          }
        }
        break
      case 'food':
        if (robotState.foodCount > 0) {
          // 通过 Socket 发送
          if (isSocketConnected) {
            placeItem(ITEM_TYPES.FOOD, 1)
          }
          // 通知 Unity
          if (isLoaded) {
            sendMessage('Robot', 'DropItem', 'food')
          }
        }
        break
      case 'flashlight':
        sendMessage('Robot', 'ToggleTool', 'flashlight')
        setRobotState(prev => ({
          ...prev,
          isFlashlightOn: !prev.isFlashlightOn,
        }))
        break
      case 'nightvision':
        sendMessage('Robot', 'ToggleTool', 'nightvision')
        setRobotState(prev => ({
          ...prev,
          isNightvisionOn: !prev.isNightvisionOn,
        }))
        break
      default:
        break
    }
  }

  const handleButtonRelease = (action) => {
    switch (action) {
      case 'forward':
        setIsMoving(prev => ({ ...prev, forward: false }))
        break
      case 'left':
        setIsMoving(prev => ({ ...prev, left: false }))
        break
      case 'back':
        setIsMoving(prev => ({ ...prev, back: false }))
        break
      case 'right':
        setIsMoving(prev => ({ ...prev, right: false }))
        break
      default:
        break
    }
  }

  return (
    <div className="w-screen h-screen bg-dark-bg text-white relative overflow-hidden">
      {/* Tab 切换按钮 */}
      <div className="absolute top-4 right-4 z-[9999] flex flex-col space-y-2 pointer-events-auto">
        <div className="text-xs text-gray-400 text-right">
          当前: {activeTab === 'game' ? '游戏界面' : '通信测试'}
        </div>
        <div className="flex space-x-2">
        <button
          onClick={() => {
            console.log('切换到游戏界面')
            setActiveTab('game')
          }}
          className={`px-4 py-2 rounded text-sm font-medium transition-all duration-200 pointer-events-auto cursor-pointer ${
            activeTab === 'game' 
              ? 'bg-blue-600 text-white shadow-lg' 
              : 'bg-gray-800 text-gray-200 hover:bg-gray-700 hover:text-white shadow-md'
          }`}
        >
          🎮 游戏界面
        </button>
        <button
          onClick={() => {
            console.log('切换到通信测试界面')
            setActiveTab('test')
          }}
          className={`px-4 py-2 rounded text-sm font-medium transition-all duration-200 pointer-events-auto cursor-pointer ${
            activeTab === 'test' 
              ? 'bg-blue-600 text-white shadow-lg' 
              : 'bg-gray-800 text-gray-200 hover:bg-gray-700 hover:text-white shadow-md'
          }`}
        >
          🔧 通信测试
        </button>
        </div>
      </div>

      {activeTab === 'game' ? (
        <>
          {/* Unity Canvas - 全屏底层 */}
          <div className="absolute inset-0 w-full h-full pointer-events-auto">
            <Unity 
              unityProvider={unityProvider} 
              style={{ width: '100%', height: '100%', pointerEvents: 'auto' }}
            />
          </div>

          {/* 调试信息面板 */}
          <div className="absolute top-20 right-4 z-[9998] bg-black/70 text-white p-2 rounded text-xs max-w-xs">
            <div>连接: {isSocketConnected ? '✓' : '✗'}</div>
            <div>距离NPC: {robotState.distanceToNpc?.toFixed(1)}m</div>
            <div>检测到生命: {robotState.isPersonDetected ? '✓' : '✗'}</div>
            <div>手电筒: {robotState.isFlashlightOn ? '开' : '关'}</div>
            <div>夜视: {robotState.isNightvisionOn ? '开' : '关'}</div>
            <div>水: {robotState.waterCount} 食物: {robotState.foodCount}</div>
            <div>任务完成: {robotState.missionCompleted ? '✓' : '✗'}</div>
          </div>

          {/* HUD 覆盖层 */}
          <RobotHUD
            robotState={robotState}
            isMoving={isMoving}
            onButtonPress={handleButtonPress}
            onButtonRelease={handleButtonRelease}
            isLoaded={isLoaded}
            isSocketConnected={isSocketConnected}
            keysPressed={keysPressed.current}
          />
        </>
      ) : (
        /* JSBridge 测试界面 */
        <div className="absolute inset-0 w-full h-full bg-gray-900 overflow-auto">
          <JSBridgeTest />
        </div>
      )}
    </div>
  )
}

export default App
