import { AlertCircle, Wifi, WifiOff, Radio } from 'lucide-react'
import { useState, useEffect } from 'react'

function StatusBar({ isLoaded, isSocketConnected, connectionState }) {
  const [timeString, setTimeString] = useState('')

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setTimeString(
        now.toLocaleTimeString('zh-CN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      )
    }

    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  const getConnectionStateText = (state) => {
    const stateMap = {
      connected: '已连接',
      connecting: '连接中...',
      disconnected: '已断开',
      closing: '关闭中...',
    }
    return stateMap[state] || '未知'
  }

  const getConnectionColor = (state) => {
    const colorMap = {
      connected: 'text-rescue-green',
      connecting: 'text-rescue-yellow',
      disconnected: 'text-rescue-red',
      closing: 'text-slate-400',
    }
    return colorMap[state] || 'text-slate-400'
  }

  return (
    <div className="bg-dark-panel border-b border-dark-border px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="text-lg font-bold text-rescue-orange">🤖</div>
        <div>
          <h1 className="text-xl font-bold">救援机器人远程操控终端</h1>
          <p className="text-xs text-slate-400">GXX-Mine Rescue Robot Control System v2.0</p>
        </div>
      </div>

      <div className="flex items-center gap-6">
        {/* Unity 连接状态 */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-400">Unity:</span>
          {isLoaded ? (
            <div className="flex items-center gap-2 text-rescue-green font-semibold text-sm">
              <Wifi size={16} className="animate-pulse" />
              已加载
            </div>
          ) : (
            <div className="flex items-center gap-2 text-rescue-yellow font-semibold text-sm">
              <WifiOff size={16} />
              加载中
            </div>
          )}
        </div>

        {/* Socket 连接状态 */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-400">服务器:</span>
          <div className={`flex items-center gap-2 font-semibold text-sm ${getConnectionColor(connectionState)}`}>
            {connectionState === 'connected' ? (
              <Radio size={16} className="animate-pulse" />
            ) : (
              <WifiOff size={16} />
            )}
            {getConnectionStateText(connectionState)}
          </div>
        </div>

        <div className="text-sm font-mono text-slate-300">{timeString}</div>

        <div className="text-xs text-slate-500 flex items-center gap-1">
          <AlertCircle size={14} />
          紧急求助: 按 Q 键
        </div>
      </div>
    </div>
  )
}

export default StatusBar
