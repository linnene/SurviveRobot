import { useState, useRef, useEffect } from 'react'
import { Unity, useUnityContext } from 'react-unity-webgl'
import RobotHUD from './components/RobotHUD'
import RobotHUD_Minimal from './components/RobotHUD_Minimal'
import RobotHUD_Dashboard from './components/RobotHUD_Dashboard'
import JSBridgeTest from './components/JSBridgeTest'
import { jsBridgeClient } from './services/jsBridgeClient'
import { parsePlayerStatus } from './services/messageTypes'
import './App.css'

function App() {
  const [activeTab, setActiveTab] = useState('game') // 'game' 或 'test'
  const [uiMode, setUiMode] = useState('default') // 'default', 'minimal', 'dashboard'
  
  const { unityProvider, sendMessage, isLoaded } = useUnityContext({
    loaderUrl: '/Build/build.loader.js',
    dataUrl: '/Build/build.data',
    frameworkUrl: '/Build/build.framework.js',
    codeUrl: '/Build/build.wasm',
  })

  // JSBridge连接状态
  const [isConnected, setIsConnected] = useState(false)
  
  // 任务完成状态追踪
  const [hasShownMissionComplete, setHasShownMissionComplete] = useState(false)
  
  const [robotState, setRobotState] = useState({
    battery: 85,
    waterCount: 1,
    foodCount: 1,
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
  const lastLifeSignAtRef = useRef(0)

  // 初始化JSBridge并监听Unity数据
  useEffect(() => {
    // 连接状态监听
    const handleConnected = () => {
      console.log('[App] JSBridge连接成功')
      setIsConnected(true)
    }

    const handleDisconnected = () => {
      console.log('[App] JSBridge断开连接')
      setIsConnected(false)
    }

    // 监听玩家状态更新
    const handlePlayerStatus = (data) => {
      console.log('[App] 收到Unity数据:', data)
      
      // 解析Unity数据
      const parsed = parsePlayerStatus(data)

      const lifeSignNow = (parsed.distanceToNpc > 0 && parsed.distanceToNpc < 100) || parsed.npcIsFollowing
      if (lifeSignNow) {
        lastLifeSignAtRef.current = Date.now()
      }

      const lifeSignLatched = lifeSignNow || (Date.now() - lastLifeSignAtRef.current < 2000)
      
      // 实时更新robotState
      setRobotState((prev) => ({
        ...prev,
        // 库存
        waterCount: parsed.inventory?.items?.water || 0,
        foodCount: parsed.inventory?.items?.food || 0,
        // 位置
        position: parsed.position,
        // NPC距离
        distanceToNpc: parsed.distanceToNpc,
        // 手电筒和夜视
        isFlashlightOn: parsed.flashlightOn,
        isNightvisionOn: parsed.nightVisionOn,
        // 生命体征检测（距离<100m 或 NPC正在跟随）
        isPersonDetected: lifeSignLatched,
        // 任务状态
        missionCompleted: parsed.missionCompleted,
        npcFollowUnlocked: parsed.npcFollowUnlocked,
        npcIsFollowing: parsed.npcIsFollowing,
        npcHasReceivedWater: parsed.npcHasReceivedWater,
        npcHasReceivedFood: parsed.npcHasReceivedFood,
        playerTraveledDistance: parsed.playerTraveledDistance,
      }))
    }

    // 监听操作结果
    const handleActionResult = (data) => {
      console.log('[App] 操作结果:', data)
      if (data.status === 'error') {
        alert(`操作失败: ${data.errorMessage || '未知错误'}`)
      }
    }

    // 注册事件监听器
    jsBridgeClient.on('connected', handleConnected)
    jsBridgeClient.on('disconnected', handleDisconnected)
    jsBridgeClient.on('player_status', handlePlayerStatus)
    jsBridgeClient.on('action_result', handleActionResult)

    // 检查初始连接状态
    if (jsBridgeClient.isConnected()) {
      setIsConnected(true)
    }

    // 清理
    return () => {
      jsBridgeClient.off('connected', handleConnected)
      jsBridgeClient.off('disconnected', handleDisconnected)
      jsBridgeClient.off('player_status', handlePlayerStatus)
      jsBridgeClient.off('action_result', handleActionResult)
    }
  }, [])

  // 监听任务完成状态，显示弹窗
  useEffect(() => {
    if (robotState.missionCompleted && !hasShownMissionComplete) {
      setHasShownMissionComplete(true)
      setTimeout(() => {
        alert('🎉 任务完成！\n\n恭喜你成功找到并护送幸存者到达安全区域！')
      }, 500) // 延迟500ms显示，确保状态已更新
    }
  }, [robotState.missionCompleted, hasShownMissionComplete])

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
            // 通过 JSBridge 发送放置水的指令
            if (isConnected && robotState.waterCount > 0) {
              jsBridgeClient.placeItem('water', 1)
              console.log('[App] 发送放置水指令')
            }
            break
          case '2':
            // 通过 JSBridge 发送放置食物的指令
            if (isConnected && robotState.foodCount > 0) {
              jsBridgeClient.placeItem('food', 1)
              console.log('[App] 发送放置食物指令')
            }
            break
          // Unity自动处理手电筒和夜视切换，状态通过JSBridge同步
          // 不需要手动切换状态
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

  // 模拟数据更新 - 仅在未连接时运行，用于演示UI效果
  useEffect(() => {
    if (isConnected) return; // 如果已连接，不运行模拟数据

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

        return {
          ...prev,
          battery: newBattery,
          temperature: newTemp,
          gasLevel: newGasLevel,
          visibility: newVisibility,
          // 移除随机生命体征探测，避免干扰测试
          // isPersonDetected: isPersonDetected || prev.isPersonDetected,
        }
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isConnected])

  const handleButtonPress = (action) => {
    console.log('[App] Button Press:', action)
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
      
      // 统一处理物品放置
      case 'place_water':
      case 'water':
        if (robotState.waterCount > 0 && isConnected) {
          jsBridgeClient.placeItem('water', 1)
          console.log('[App] 按钮: 放置水')
        }
        break
      case 'place_food':
      case 'food':
        if (robotState.foodCount > 0 && isConnected) {
          jsBridgeClient.placeItem('food', 1)
          console.log('[App] 按钮: 放置食物')
        }
        break
        
      // 工具控制
      case 'toggle_flashlight':
        if (isLoaded) sendMessage('Robot', 'ToggleFlashlight')
        break
      case 'toggle_nightvision':
        if (isLoaded) sendMessage('Robot', 'ToggleNightVision')
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
      {/* 右上角控制抽屉：默认收起，悬停/聚焦展开 */}
      <div className="absolute top-4 right-4 z-[9999] pointer-events-auto">
        <div className="group relative">
          {/* 把手（始终可见） */}
          <div
            tabIndex={0}
            className="w-10 h-10 rounded-lg bg-gray-900/80 border border-gray-700 text-gray-200 shadow-md flex items-center justify-center cursor-pointer select-none backdrop-blur-sm"
            aria-label="展开控制面板"
            title="展开控制面板"
          >
            <span className="text-sm font-bold">≡</span>
          </div>

          {/* 内容（默认隐藏） */}
          <div
            className="
              absolute top-12 right-0 w-[320px]
              opacity-0 scale-95 translate-y-1 pointer-events-none
              transition-all duration-200 origin-top-right
              group-hover:opacity-100 group-hover:scale-100 group-hover:translate-y-0 group-hover:pointer-events-auto
              group-focus-within:opacity-100 group-focus-within:scale-100 group-focus-within:translate-y-0 group-focus-within:pointer-events-auto
            "
          >
            <div className="flex flex-col space-y-2 bg-gray-950/70 border border-gray-800 rounded-lg p-3 shadow-lg backdrop-blur-sm">
              <div className="text-xs text-gray-400 text-right">
                当前: {activeTab === 'game' ? '游戏界面' : '通信测试'}
              </div>
              <div className="flex space-x-2 justify-end">
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

              {/* UI 模式切换 (仅在游戏界面显示) */}
              {activeTab === 'game' && (
                <div className="flex space-x-2 mt-1 justify-end">
                  <select
                    value={uiMode}
                    onChange={(e) => setUiMode(e.target.value)}
                    className="bg-gray-800 text-white text-xs px-2 py-1 rounded border border-gray-600 pointer-events-auto cursor-pointer"
                  >
                    <option value="default">默认 UI (工业)</option>
                    <option value="minimal">极简 UI (实验A)</option>
                    <option value="dashboard">仪表盘 UI (实验B)</option>
                  </select>
                </div>
              )}
            </div>
          </div>
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

          {/* HUD 覆盖层 */}
          {uiMode === 'default' && (
            <RobotHUD
              robotState={robotState}
              isMoving={isMoving}
              onButtonPress={handleButtonPress}
              onButtonRelease={handleButtonRelease}
              isLoaded={isLoaded}
              isSocketConnected={isConnected}
              keysPressed={keysPressed.current}
            />
          )}
          {uiMode === 'minimal' && (
            <RobotHUD_Minimal
              robotState={robotState}
              isMoving={isMoving}
              onButtonPress={handleButtonPress}
              onButtonRelease={handleButtonRelease}
              isLoaded={isLoaded}
              isSocketConnected={isConnected}
              keysPressed={keysPressed.current}
            />
          )}
          {uiMode === 'dashboard' && (
            <RobotHUD_Dashboard
              robotState={robotState}
              isMoving={isMoving}
              onButtonPress={handleButtonPress}
              onButtonRelease={handleButtonRelease}
              isLoaded={isLoaded}
              isSocketConnected={isConnected}
              keysPressed={keysPressed.current}
            />
          )}
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
