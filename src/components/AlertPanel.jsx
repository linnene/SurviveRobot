import { AlertCircle, AlertTriangle, CheckCircle } from 'lucide-react'

function AlertPanel({ robotState }) {
  const alerts = []

  // 电池低电量警告
  if (robotState.battery < 20) {
    alerts.push({
      id: 'battery-low',
      type: 'critical',
      title: '🔋 电池低电量',
      message: `电池仅剩 ${robotState.battery.toFixed(0)}%`,
      icon: AlertCircle,
    })
  }

  // 气体浓度过高
  if (robotState.gasLevel > 0.7) {
    alerts.push({
      id: 'gas-high',
      type: 'warning',
      title: '⚠️ 气体浓度过高',
      message: `气体浓度 ${(robotState.gasLevel * 100).toFixed(0)}%`,
      icon: AlertTriangle,
    })
  }

  // 能见度过低
  if (robotState.visibility < 0.5) {
    alerts.push({
      id: 'visibility-low',
      type: 'warning',
      title: '👁️ 能见度过低',
      message: `能见度仅 ${(robotState.visibility * 100).toFixed(0)}%`,
      icon: AlertTriangle,
    })
  }

  // 生命体征探测
  if (robotState.isPersonDetected) {
    alerts.push({
      id: 'person-detected',
      type: 'success',
      title: '🚨 发现生命体征',
      message: '检测到幸存者信号',
      icon: CheckCircle,
    })
  }

  if (alerts.length === 0) {
    return null
  }

  return (
    <div className="glass-panel rounded-lg p-4">
      <h3 className="text-lg font-bold text-rescue-orange mb-3 flex items-center">
        <span className="w-2 h-2 bg-rescue-orange rounded-full mr-2"></span>
        警报面板
      </h3>
      <div className="space-y-2">
        {alerts.map(alert => {
          const bgColor =
            alert.type === 'critical'
              ? 'bg-rescue-red/10 border-rescue-red'
              : alert.type === 'warning'
                ? 'bg-rescue-yellow/10 border-rescue-yellow'
                : 'bg-rescue-green/10 border-rescue-green'

          const textColor =
            alert.type === 'critical'
              ? 'text-rescue-red'
              : alert.type === 'warning'
                ? 'text-rescue-yellow'
                : 'text-rescue-green'

          return (
            <div key={alert.id} className={`rounded p-3 border ${bgColor}`}>
              <div className={`font-semibold text-sm ${textColor}`}>{alert.title}</div>
              <div className="text-xs text-slate-300 mt-1">{alert.message}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default AlertPanel
