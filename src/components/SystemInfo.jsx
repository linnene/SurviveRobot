import { Clock, Zap } from 'lucide-react'

function SystemInfo({ isLoaded }) {
  const [systemStats, setSystemStats] = React.useState({
    fps: 60,
    uptime: 0,
    memoryUsage: 0,
  })

  React.useEffect(() => {
    const interval = setInterval(() => {
      // 模拟 FPS（实际应该从 Unity 获取）
      const fps = Math.round(50 + Math.random() * 20)

      // 更新运行时间
      setSystemStats(prev => ({
        ...prev,
        fps,
        uptime: prev.uptime + 1,
        memoryUsage: 60 + Math.random() * 20,
      }))
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const formatUptime = (seconds) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="glass-panel rounded-lg p-3 text-xs">
      <h4 className="font-bold text-slate-400 mb-2 flex items-center gap-2">
        <Zap size={14} />
        系统信息
      </h4>
      <div className="space-y-1">
        <div className="flex justify-between">
          <span className="text-slate-400">连接状态</span>
          <span className={`font-mono font-bold ${isLoaded ? 'text-rescue-green' : 'text-rescue-yellow'}`}>
            {isLoaded ? '已连接' : '连接中...'}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">FPS</span>
          <span className="font-mono font-bold text-rescue-blue">{systemStats.fps}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">运行时间</span>
          <span className="font-mono font-bold text-rescue-blue">{formatUptime(systemStats.uptime)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">内存占用</span>
          <span className="font-mono font-bold text-rescue-yellow">
            {systemStats.memoryUsage.toFixed(0)}MB
          </span>
        </div>
      </div>
    </div>
  )
}

export default SystemInfo
