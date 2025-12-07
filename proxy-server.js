// WebSocket-to-TCP 代理服务器
// 用于将浏览器的 WebSocket 连接转发到 Unity 的 TCP 服务器

import { WebSocketServer } from 'ws'
import net from 'net'

// 配置
const WS_PORT = 50001 // WebSocket 监听端口（前端连接此端口）
const TCP_HOST = '127.0.0.1'
const TCP_PORT = 50002 // Unity TCP 服务器端口（需要与 Unity 配置一致）

// 创建 WebSocket 服务器
const wss = new WebSocketServer({ port: WS_PORT })

console.log(`[Proxy] WebSocket 服务器运行在 ws://localhost:${WS_PORT}`)
console.log(`[Proxy] 将转发到 TCP 服务器 ${TCP_HOST}:${TCP_PORT}`)

wss.on('connection', (ws, req) => {
  const clientIp = req.socket.remoteAddress
  console.log(`[Proxy] WebSocket 客户端已连接: ${clientIp}`)

  // 创建到 Unity TCP 服务器的连接
  const tcpClient = new net.Socket()
  let isConnected = false

  tcpClient.connect(TCP_PORT, TCP_HOST, () => {
    isConnected = true
    console.log(`[Proxy] 已连接到 Unity TCP 服务器`)
  })

  // WebSocket 消息 -> TCP
  ws.on('message', (data) => {
    if (isConnected) {
      const message = data.toString()
      console.log(`[Proxy] WS -> TCP: ${message}`)
      tcpClient.write(message + '\n')
    } else {
      console.warn('[Proxy] TCP 未连接，无法转发消息')
    }
  })

  // TCP 数据 -> WebSocket
  let buffer = ''
  tcpClient.on('data', (data) => {
    buffer += data.toString()
    const lines = buffer.split('\n')
    buffer = lines.pop() // 保留不完整的行

    lines.forEach((line) => {
      if (line.trim()) {
        console.log(`[Proxy] TCP -> WS: ${line}`)
        ws.send(line)
      }
    })
  })

  // 错误处理
  ws.on('error', (error) => {
    console.error('[Proxy] WebSocket 错误:', error.message)
  })

  ws.on('close', () => {
    console.log('[Proxy] WebSocket 客户端断开连接')
    if (tcpClient) {
      tcpClient.end()
    }
  })

  tcpClient.on('error', (error) => {
    console.error('[Proxy] TCP 错误:', error.message)
    ws.close()
  })

  tcpClient.on('close', () => {
    console.log('[Proxy] TCP 连接已关闭')
    ws.close()
  })
})

// 全局错误处理
process.on('uncaughtException', (error) => {
  console.error('[Proxy] 未捕获的异常:', error)
})

process.on('SIGINT', () => {
  console.log('\n[Proxy] 正在关闭服务器...')
  wss.close(() => {
    console.log('[Proxy] 服务器已关闭')
    process.exit(0)
  })
})
