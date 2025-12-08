import { useState, useEffect, useCallback } from 'react'
import { unifiedClient as socketClient } from '../services/unifiedClient'
import { parsePlayerStatus, formatError } from '../services/messageTypes'

/**
 * 自定义 Hook: 使用 Socket 连接
 */
export function useSocket(url = 'ws://localhost:50001') {
  const [isConnected, setIsConnected] = useState(false)
  const [connectionState, setConnectionState] = useState('disconnected')
  const [lastError, setLastError] = useState(null)

  useEffect(() => {
    // 连接状态监听
    const handleConnected = () => {
      setIsConnected(true)
      setConnectionState('connected')
    }

    const handleDisconnected = () => {
      setIsConnected(false)
      setConnectionState('disconnected')
    }

    const handleError = (data) => {
      setLastError(data.error)
    }

    socketClient.on('connected', handleConnected)
    socketClient.on('disconnected', handleDisconnected)
    socketClient.on('error', handleError)

    // 初始连接
    socketClient.connect(url).catch(err => {
      console.error('[useSocket] 连接失败:', err)
      setLastError(err)
    })

    // 更新连接状态
    const stateInterval = setInterval(() => {
      setConnectionState(socketClient.getConnectionState())
    }, 1000)

    return () => {
      socketClient.off('connected', handleConnected)
      socketClient.off('disconnected', handleDisconnected)
      socketClient.off('error', handleError)
      clearInterval(stateInterval)
      socketClient.disconnect()
    }
  }, [url])

  return { isConnected, connectionState, lastError }
}

/**
 * 自定义 Hook: 监听玩家状态
 */
export function usePlayerStatus() {
  const [playerStatus, setPlayerStatus] = useState(null)

  useEffect(() => {
    const handlePlayerStatus = (data) => {
      const parsed = parsePlayerStatus(data)
      setPlayerStatus(parsed)
    }

    socketClient.on('player_status', handlePlayerStatus)

    return () => {
      socketClient.off('player_status', handlePlayerStatus)
    }
  }, [])

  return playerStatus
}

/**
 * 自定义 Hook: 发送操作并监听结果
 */
export function useAction() {
  const [lastResult, setLastResult] = useState(null)
  const [lastError, setLastError] = useState(null)
  const [isPending, setIsPending] = useState(false)

  useEffect(() => {
    const handleActionResult = (data) => {
      setLastResult(data)
      setIsPending(false)
    }

    const handleServerError = (data) => {
      const error = formatError(data)
      setLastError(error)
      setIsPending(false)
    }

    socketClient.on('action_result', handleActionResult)
    socketClient.on('server_error', handleServerError)

    return () => {
      socketClient.off('action_result', handleActionResult)
      socketClient.off('server_error', handleServerError)
    }
  }, [])

  const placeItem = useCallback((itemType, count = 1) => {
    setIsPending(true)
    setLastResult(null)
    setLastError(null)
    socketClient.placeItem(itemType, count)
  }, [])

  const clearError = useCallback(() => {
    setLastError(null)
  }, [])

  return {
    placeItem,
    lastResult,
    lastError,
    isPending,
    clearError,
  }
}

/**
 * 自定义 Hook: 心跳监测
 */
export function useHeartbeat() {
  const [lastHeartbeat, setLastHeartbeat] = useState(null)
  const [isAlive, setIsAlive] = useState(true)

  useEffect(() => {
    const handleHeartbeat = (data) => {
      setLastHeartbeat(data.timestamp)
      setIsAlive(true)
    }

    socketClient.on('heartbeat', handleHeartbeat)

    // 超时检测（10秒没有心跳则认为断线）
    const timeoutInterval = setInterval(() => {
      if (lastHeartbeat) {
        const now = new Date()
        const lastBeat = new Date(lastHeartbeat)
        const diff = now - lastBeat
        if (diff > 10000) {
          setIsAlive(false)
        }
      }
    }, 1000)

    return () => {
      socketClient.off('heartbeat', handleHeartbeat)
      clearInterval(timeoutInterval)
    }
  }, [lastHeartbeat])

  return { lastHeartbeat, isAlive }
}
