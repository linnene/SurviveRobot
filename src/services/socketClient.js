/**
 * TCP Socket 客户端 - 连接到 Unity 游戏服务器
 * 地址: 127.0.0.1:50001
 * 协议: TCP (通过 WebSocket 或 HTTP 代理)
 */

// 由于浏览器不支持直接 TCP 连接，我们使用 WebSocket 作为桥接
// 需要在服务端配置一个 WebSocket-to-TCP 代理

export class SocketClient {
  constructor() {
    this.ws = null
    this.listeners = new Map()
    this.reconnectInterval = 3000
    this.reconnectTimer = null
    this.isConnecting = false
    this.isManualClose = false
  }

  /**
   * 连接到服务器
   * @param {string} url - WebSocket URL (默认: ws://localhost:50001)
   */
  connect(url = 'ws://localhost:50001') {
    if (this.isConnecting || (this.ws && this.ws.readyState === WebSocket.OPEN)) {
      console.warn('[SocketClient] 已经连接或正在连接中')
      return
    }

    this.isConnecting = true
    this.isManualClose = false

    try {
      this.ws = new WebSocket(url)

      this.ws.onopen = () => {
        console.log('[SocketClient] 连接成功')
        this.isConnecting = false
        this.emit('connected', { timestamp: new Date().toISOString() })
      }

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data)
          this.handleMessage(message)
        } catch (error) {
          console.error('[SocketClient] 解析消息失败:', error)
        }
      }

      this.ws.onerror = (error) => {
        console.error('[SocketClient] 连接错误:', error)
        this.emit('error', { error })
      }

      this.ws.onclose = (event) => {
        console.log('[SocketClient] 连接关闭:', event.code, event.reason)
        this.isConnecting = false
        this.emit('disconnected', { code: event.code, reason: event.reason })

        // 自动重连（如果不是手动关闭）
        if (!this.isManualClose) {
          this.scheduleReconnect(url)
        }
      }
    } catch (error) {
      console.error('[SocketClient] 创建连接失败:', error)
      this.isConnecting = false
      this.emit('error', { error })
    }
  }

  /**
   * 处理接收到的消息
   */
  handleMessage(message) {
    const { topic, body } = message

    console.log(`[SocketClient] 接收消息 [${topic}]:`, body)

    switch (topic) {
      case 'player_status':
        this.emit('player_status', body)
        break

      case 'action_result':
        this.emit('action_result', body)
        break

      case 'error':
        this.emit('server_error', body)
        console.error('[SocketClient] 服务端错误:', body)
        break

      case 'heartbeat':
        this.emit('heartbeat', body)
        break

      default:
        console.warn('[SocketClient] 未知消息类型:', topic)
        this.emit('unknown', message)
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

    this.send(message)
  }

  /**
   * 放置物品
   */
  placeItem(itemType, count = 1) {
    this.sendAction('place_item', itemType, count)
  }

  /**
   * 发送原始消息
   */
  send(message) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.error('[SocketClient] 连接未就绪，无法发送消息')
      return false
    }

    try {
      const data = JSON.stringify(message)
      this.ws.send(data)
      console.log('[SocketClient] 发送消息:', message)
      return true
    } catch (error) {
      console.error('[SocketClient] 发送消息失败:', error)
      return false
    }
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
        console.error(`[SocketClient] 事件回调错误 [${event}]:`, error)
      }
    })
  }

  /**
   * 安排重连
   */
  scheduleReconnect(url) {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
    }

    console.log(`[SocketClient] ${this.reconnectInterval / 1000}秒后尝试重连...`)

    this.reconnectTimer = setTimeout(() => {
      console.log('[SocketClient] 尝试重新连接...')
      this.connect(url)
    }, this.reconnectInterval)
  }

  /**
   * 断开连接
   */
  disconnect() {
    this.isManualClose = true

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }

    if (this.ws) {
      this.ws.close()
      this.ws = null
    }

    console.log('[SocketClient] 已手动断开连接')
  }

  /**
   * 获取连接状态
   */
  isConnected() {
    return this.ws && this.ws.readyState === WebSocket.OPEN
  }

  /**
   * 获取连接状态描述
   */
  getConnectionState() {
    if (!this.ws) return 'disconnected'

    switch (this.ws.readyState) {
      case WebSocket.CONNECTING:
        return 'connecting'
      case WebSocket.OPEN:
        return 'connected'
      case WebSocket.CLOSING:
        return 'closing'
      case WebSocket.CLOSED:
        return 'disconnected'
      default:
        return 'unknown'
    }
  }
}

// 创建单例实例
export const socketClient = new SocketClient()
