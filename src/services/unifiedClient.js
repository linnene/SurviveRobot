/**
 * 通信客户端适配器
 * 提供统一接口，可以在Socket和JSBridge之间切换
 */

import { socketClient } from './socketClient.js'
import { jsBridgeClient } from './jsBridgeClient.js'

// 检测运行环境
const isUnityWebGL = () => {
  return typeof window !== 'undefined' && 
         (window.unityInstance || 
          window.sendToUnity || 
          document.querySelector('canvas[data-pixel-ratio]')) // Unity WebGL canvas特征
}

export class UnifiedClient {
  constructor() {
    this.useJSBridge = isUnityWebGL()
    this.client = this.useJSBridge ? jsBridgeClient : socketClient
    
    console.log(`[UnifiedClient] 使用${this.useJSBridge ? 'JSBridge' : 'Socket'}客户端`)
  }

  /**
   * 连接到服务器
   */
  async connect(url) {
    if (this.useJSBridge) {
      // JSBridge不需要URL连接，直接等待初始化完成
      if (!this.client.isConnected()) {
        await this.client.waitForReady()
      }
      return Promise.resolve()
    } else {
      // Socket客户端连接
      return new Promise((resolve, reject) => {
        const onConnected = () => {
          this.client.off('connected', onConnected)
          this.client.off('error', onError)
          resolve()
        }
        
        const onError = (error) => {
          this.client.off('connected', onConnected)
          this.client.off('error', onError)
          reject(error)
        }

        this.client.on('connected', onConnected)
        this.client.on('error', onError)
        
        this.client.connect(url)
      })
    }
  }

  /**
   * 断开连接
   */
  disconnect() {
    if (this.useJSBridge) {
      this.client.cleanup()
    } else {
      this.client.disconnect()
    }
  }

  /**
   * 发送操作指令
   */
  sendAction(action, itemType, count = 1) {
    return this.client.sendAction(action, itemType, count)
  }

  /**
   * 放置物品
   */
  placeItem(itemType, count = 1) {
    return this.client.placeItem(itemType, count)
  }

  /**
   * 重置任务
   */
  resetMission() {
    if (this.useJSBridge) {
      return this.client.resetMission()
    } else {
      // Socket客户端可能需要发送特定消息
      return this.client.send({
        topic: 'reset_mission',
        body: {}
      })
    }
  }

  /**
   * 订阅事件
   */
  on(event, callback) {
    this.client.on(event, callback)
  }

  /**
   * 取消订阅
   */
  off(event, callback) {
    this.client.off(event, callback)
  }

  /**
   * 获取连接状态
   */
  isConnected() {
    return this.client.isConnected()
  }

  /**
   * 获取连接状态描述
   */
  getConnectionState() {
    return this.client.getConnectionState()
  }

  /**
   * 获取客户端类型
   */
  getClientType() {
    return this.useJSBridge ? 'jsbridge' : 'socket'
  }

  /**
   * 是否支持特定功能
   */
  supports(feature) {
    switch (feature) {
      case 'realtime':
        return true
      case 'bidirectional':
        return this.useJSBridge // JSBridge支持双向，Socket目前只支持接收
      case 'offline':
        return !this.useJSBridge // Socket可以离线工作，JSBridge需要Unity
      default:
        return false
    }
  }
}

// 创建统一客户端实例
export const unifiedClient = new UnifiedClient()

// 向后兼容：导出为socketClient别名
export { unifiedClient as socketClient }