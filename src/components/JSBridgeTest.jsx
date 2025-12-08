/**
 * JSBridge通信测试组件
 * 用于测试Unity WebGL与JavaScript的双向通信
 */

import React, { useState, useEffect } from 'react'
import { jsBridgeClient } from '../services/jsBridgeClient'
import { parsePlayerStatus } from '../services/messageTypes'

export default function JSBridgeTest() {
  const [isConnected, setIsConnected] = useState(false)
  const [connectionState, setConnectionState] = useState('disconnected')
  const [playerStatus, setPlayerStatus] = useState(null)
  const [lastMessage, setLastMessage] = useState(null)
  const [logs, setLogs] = useState([])

  // 添加日志
  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs(prev => [...prev.slice(-19), { timestamp, message, type }])
  }

  useEffect(() => {
    // 监听连接状态变化
    const handleConnected = () => {
      setIsConnected(true)
      setConnectionState('connected')
      addLog('JSBridge 连接成功', 'success')
    }

    const handleDisconnected = () => {
      setIsConnected(false)
      setConnectionState('disconnected')
      addLog('JSBridge 连接断开', 'warning')
    }

    const handleError = (data) => {
      addLog(`错误: ${JSON.stringify(data)}`, 'error')
    }

    // 监听玩家状态
    const handlePlayerStatus = (data) => {
      const parsed = parsePlayerStatus(data)
      setPlayerStatus(parsed)
      setLastMessage({ type: 'player_status', data: parsed, timestamp: new Date() })
      addLog('收到玩家状态更新')
    }

    // 监听操作结果
    const handleActionResult = (data) => {
      setLastMessage({ type: 'action_result', data, timestamp: new Date() })
      addLog(`操作结果: ${data.status} - ${data.action}`, data.status === 'ok' ? 'success' : 'error')
    }

    // 监听服务器错误
    const handleServerError = (data) => {
      addLog(`服务器错误: ${data.message || JSON.stringify(data)}`, 'error')
    }

    // 注册事件监听器
    jsBridgeClient.on('connected', handleConnected)
    jsBridgeClient.on('disconnected', handleDisconnected)
    jsBridgeClient.on('error', handleError)
    jsBridgeClient.on('player_status', handlePlayerStatus)
    jsBridgeClient.on('action_result', handleActionResult)
    jsBridgeClient.on('server_error', handleServerError)

    // 更新连接状态
    const stateInterval = setInterval(() => {
      const state = jsBridgeClient.getConnectionState()
      setConnectionState(state)
      setIsConnected(jsBridgeClient.isConnected())
    }, 1000)

    addLog('JSBridge 测试组件初始化')

    return () => {
      // 清理事件监听器
      jsBridgeClient.off('connected', handleConnected)
      jsBridgeClient.off('disconnected', handleDisconnected)
      jsBridgeClient.off('error', handleError)
      jsBridgeClient.off('player_status', handlePlayerStatus)
      jsBridgeClient.off('action_result', handleActionResult)
      jsBridgeClient.off('server_error', handleServerError)
      clearInterval(stateInterval)
    }
  }, [])

  // 测试功能
  const testPlaceWater = () => {
    addLog('尝试放置水...', 'info')
    jsBridgeClient.placeItem('water', 1)
  }

  const testPlaceFood = () => {
    addLog('尝试放置食物...', 'info')
    jsBridgeClient.placeItem('food', 1)
  }

  const testResetMission = () => {
    addLog('尝试重置任务...', 'info')
    jsBridgeClient.resetMission()
  }

  const testDirectMessage = () => {
    addLog('发送自定义测试消息...', 'info')
    jsBridgeClient.sendToUnity({
      topic: 'test',
      body: { message: 'Hello from React!', timestamp: new Date().toISOString() }
    })
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Unity WebGL JSBridge 通信测试</h1>

      {/* 连接状态 */}
      <div className="mb-6 p-4 border rounded-lg">
        <h2 className="text-lg font-semibold mb-2">连接状态</h2>
        <div className="flex items-center space-x-4">
          <span className={`px-2 py-1 rounded text-sm ${
            isConnected 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {connectionState}
          </span>
          <span className="text-sm text-gray-600">
            客户端类型: JSBridge
          </span>
        </div>
      </div>

      {/* 测试按钮 */}
      <div className="mb-6 p-4 border rounded-lg">
        <h2 className="text-lg font-semibold mb-2">测试功能</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <button
            onClick={testPlaceWater}
            disabled={!isConnected}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300"
          >
            放置水
          </button>
          <button
            onClick={testPlaceFood}
            disabled={!isConnected}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-300"
          >
            放置食物
          </button>
          <button
            onClick={testResetMission}
            disabled={!isConnected}
            className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:bg-gray-300"
          >
            重置任务
          </button>
          <button
            onClick={testDirectMessage}
            disabled={!isConnected}
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:bg-gray-300"
          >
            测试消息
          </button>
        </div>
      </div>

      {/* 玩家状态 */}
      {playerStatus && (
        <div className="mb-6 p-4 border rounded-lg">
          <h2 className="text-lg font-semibold mb-2">玩家状态</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="font-medium">位置:</span><br />
              {playerStatus.position ? 
                `(${playerStatus.position.x?.toFixed(1)}, ${playerStatus.position.y?.toFixed(1)}, ${playerStatus.position.z?.toFixed(1)})` 
                : 'N/A'}
            </div>
            <div>
              <span className="font-medium">与NPC距离:</span><br />
              {playerStatus.distanceToNpc?.toFixed(1) || 'N/A'} 米
            </div>
            <div>
              <span className="font-medium">背包:</span><br />
              {playerStatus.inventory ? 
                `${playerStatus.inventory.used}/${playerStatus.inventory.capacity}` 
                : 'N/A'}
            </div>
            <div>
              <span className="font-medium">物品:</span><br />
              水: {playerStatus.inventory?.items?.water || 0}, 
              食物: {playerStatus.inventory?.items?.food || 0}
            </div>
            <div>
              <span className="font-medium">手电筒:</span><br />
              {playerStatus.flashlightOn ? '开启' : '关闭'}
            </div>
            <div>
              <span className="font-medium">夜视:</span><br />
              {playerStatus.nightVisionOn ? '开启' : '关闭'}
            </div>
            <div>
              <span className="font-medium">NPC跟随:</span><br />
              {playerStatus.npcIsFollowing ? '跟随中' : '未跟随'}
            </div>
            <div>
              <span className="font-medium">任务完成:</span><br />
              {playerStatus.missionCompleted ? '已完成' : '进行中'}
            </div>
          </div>
        </div>
      )}

      {/* 最后一条消息 */}
      {lastMessage && (
        <div className="mb-6 p-4 border rounded-lg">
          <h2 className="text-lg font-semibold mb-2">最新消息</h2>
          <div className="text-sm">
            <div className="font-medium">{lastMessage.type}</div>
            <div className="text-gray-600">{lastMessage.timestamp.toLocaleTimeString()}</div>
            <pre className="mt-2 bg-gray-100 p-2 rounded text-xs overflow-auto">
              {JSON.stringify(lastMessage.data, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {/* 日志 */}
      <div className="p-4 border rounded-lg">
        <h2 className="text-lg font-semibold mb-2">通信日志</h2>
        <div className="bg-black text-green-400 p-4 rounded font-mono text-sm h-48 overflow-y-auto">
          {logs.map((log, index) => (
            <div key={index} className={`${
              log.type === 'error' ? 'text-red-400' :
              log.type === 'warning' ? 'text-yellow-400' :
              log.type === 'success' ? 'text-green-400' : 'text-white'
            }`}>
              [{log.timestamp}] {log.message}
            </div>
          ))}
          {logs.length === 0 && (
            <div className="text-gray-500">等待日志...</div>
          )}
        </div>
      </div>
    </div>
  )
}