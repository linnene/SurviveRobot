/**
 * JavaScript Bridge 客户端 - 与Unity WebGL通过jslib直接通信
 * 替代TCP Socket连接，使用Unity的WebGL JavaScript桥接
 */

export class JSBridgeClient {
  constructor() {
    this.listeners = new Map()
    this.isReady = false
    this.unityCallbackRegistered = false
    
    // 绑定方法上下文
    this.handleUnityMessage = this.handleUnityMessage.bind(this)
    this.handleCallbackRegistered = this.handleCallbackRegistered.bind(this)
  }

  /**
   * 初始化桥接客户端
   * 监听Unity消息和回调注册事件
   */
  init() {
    console.log('[JSBridgeClient] 初始化JavaScript Bridge客户端')

    // 监听Unity消息
    window.addEventListener('UnityPlayerStatus', this.handleUnityMessage)
    
    // 监听Unity回调注册完成事件
    window.addEventListener('UnityCallbackRegistered', this.handleCallbackRegistered)
    
    // 设置全局Unity消息回调（备用方案）
    window.onUnityMessage = this.handleUnityMessage

    // 如果Unity已经注册了回调，直接标记为就绪
    if (window.unityCallback) {
      this.unityCallbackRegistered = true
      this.checkReady()
    }

    console.log('[JSBridgeClient] JavaScript Bridge客户端初始化完成')
  }

  /**
   * 处理Unity回调注册完成事件
   */
  handleCallbackRegistered(event) {
    console.log('[JSBridgeClient] Unity回调注册完成:', event.detail)
    this.unityCallbackRegistered = true
    this.checkReady()
  }

  /**
   * 检查是否就绪
   */
  checkReady() {
    const wasReady = this.isReady
    this.isReady = this.unityCallbackRegistered && typeof window.sendToUnity === 'function'
    
    if (this.isReady && !wasReady) {
      console.log('[JSBridgeClient] Bridge连接就绪')
      this.emit('connected', { timestamp: new Date().toISOString() })
    }
  }

  /**
   * 处理来自Unity的消息
   */
  handleUnityMessage(event) {
    try {
      // 处理CustomEvent或直接调用
      const data = event.detail || event
      
      console.log('[JSBridgeClient] 原始Unity事件:', event)
      console.log('[JSBridgeClient] 解析的数据:', data)
      
      if (!data || !data.topic) {
        console.warn('[JSBridgeClient] 收到无效的Unity消息:', data)
        return
      }

      console.log(`[JSBridgeClient] 收到Unity消息 [${data.topic}]:`, data.body)

      // 分发消息到对应的监听器
      switch (data.topic) {
        case 'player_status':
          this.emit('player_status', data.body)
          break

        case 'action_result':
          this.emit('action_result', data.body)
          break

        case 'error':
          this.emit('server_error', data.body)
          console.error('[JSBridgeClient] Unity错误:', data.body)
          break

        case 'heartbeat':
          this.emit('heartbeat', data.body)
          break

        default:
          console.warn('[JSBridgeClient] 未知Unity消息类型:', data.topic)
          this.emit('unknown', data)
      }
    } catch (error) {
      console.error('[JSBridgeClient] 处理Unity消息失败:', error)
    }
  }

  /**
   * 发送消息到Unity
   */
  sendToUnity(message) {
    if (!this.isReady) {
      console.error('[JSBridgeClient] Bridge未就绪，无法发送消息')
      return false
    }

    try {
      console.log('[JSBridgeClient] 发送消息到Unity:', message)
      window.sendToUnity(message)
      return true
    } catch (error) {
      console.error('[JSBridgeClient] 发送消息到Unity失败:', error)
      return false
    }
  }

  /**
   * 发送操作指令
   */
  sendAction(action, itemType, count = 1) {
    const message = {
      topic: 'action',
      body: {
        action,
        itemType,
        count,
      },
    }

    return this.sendToUnity(message)
  }

  /**
   * 放置物品
   */
  placeItem(itemType, count = 1) {
    return this.sendAction('place_item', itemType, count)
  }

  /**
   * 重置任务
   */
  resetMission() {
    const message = {
      topic: 'reset_mission',
      body: {}
    }

    return this.sendToUnity(message)
  }

  /**
   * 订阅事件
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event).push(callback)
  }

  /**
   * 取消订阅
   */
  off(event, callback) {
    if (!this.listeners.has(event)) return

    const callbacks = this.listeners.get(event)
    const index = callbacks.indexOf(callback)
    if (index > -1) {
      callbacks.splice(index, 1)
    }
  }

  /**
   * 触发事件
   */
  emit(event, data) {
    if (!this.listeners.has(event)) return

    const callbacks = this.listeners.get(event)
    callbacks.forEach((callback) => {
      try {
        callback(data)
      } catch (error) {
        console.error(`[JSBridgeClient] 事件回调错误 [${event}]:`, error)
      }
    })
  }

  /**
   * 清理资源
   */
  cleanup() {
    console.log('[JSBridgeClient] 清理Bridge客户端资源')
    
    // 移除事件监听器
    window.removeEventListener('UnityPlayerStatus', this.handleUnityMessage)
    window.removeEventListener('UnityCallbackRegistered', this.handleCallbackRegistered)
    
    // 清理全局回调
    if (window.onUnityMessage === this.handleUnityMessage) {
      window.onUnityMessage = null
    }

    // 清理事件监听器
    this.listeners.clear()
    
    this.isReady = false
    this.unityCallbackRegistered = false
  }

  /**
   * 获取连接状态
   */
  isConnected() {
    return this.isReady
  }

  /**
   * 获取连接状态描述
   */
  getConnectionState() {
    if (this.isReady) return 'connected'
    if (this.unityCallbackRegistered) return 'connecting'
    return 'disconnected'
  }

  /**
   * 等待连接就绪（返回Promise）
   */
  waitForReady(timeoutMs = 10000) {
    return new Promise((resolve, reject) => {
      if (this.isReady) {
        resolve()
        return
      }

      const timeout = setTimeout(() => {
        cleanup()
        reject(new Error('等待Bridge连接超时'))
      }, timeoutMs)

      const onConnected = () => {
        cleanup()
        resolve()
      }

      const cleanup = () => {
        clearTimeout(timeout)
        this.off('connected', onConnected)
      }

      this.on('connected', onConnected)
    })
  }
}

// 创建单例实例
export const jsBridgeClient = new JSBridgeClient()

// 自动初始化（当DOM加载完成时）
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    jsBridgeClient.init()
  })
} else {
  // DOM已经加载完成
  jsBridgeClient.init()
}