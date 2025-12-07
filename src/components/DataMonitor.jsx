import { Activity, AlertTriangle, Gauge } from 'lucide-react'

function DataMonitor({ robotState }) {
  const getGasStatus = (level) => {
    if (level < 0.3) return { label: '优秀', color: 'rescue-green', bg: 'rescue-green/20' }
    if (level < 0.6) return { label: '良好', color: 'rescue-blue', bg: 'rescue-blue/20' }
    if (level < 0.8) return { label: '一般', color: 'rescue-yellow', bg: 'rescue-yellow/20' }
    return { label: '危险', color: 'rescue-red', bg: 'rescue-red/20' }
  }

  const getTemperatureStatus = (temp) => {
    if (temp < 25) return '正常(冷)'
    if (temp < 30) return '正常'
    return '高温警报'
  }

  const gasStatus = getGasStatus(robotState.gasLevel)

  return (
    <div className="glass-panel rounded-lg p-3">
      <h3 className="text-base font-bold text-rescue-orange mb-3 flex items-center">
        <span className="w-2 h-2 bg-rescue-orange rounded-full mr-2"></span>
        实时监测
      </h3>

      <div className="space-y-2">
        {/* 温度 */}
        <div className="bg-dark-border rounded p-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400 flex items-center gap-2">
              <Gauge size={14} />
              温度
            </span>
            <span className="font-mono text-sm font-bold text-rescue-blue">
              {robotState.temperature.toFixed(1)}°C
            </span>
          </div>
          <div className="text-xs text-slate-500">
            {getTemperatureStatus(robotState.temperature)}
          </div>
        </div>

        {/* 空气质量 */}
        <div className={`rounded p-2 ${`bg-${gasStatus.bg}`}`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400 flex items-center gap-2">
              <Activity size={14} />
              空气质量
            </span>
            <span className={`font-mono text-sm font-bold text-${gasStatus.color}`}>
              {(robotState.gasLevel * 100).toFixed(0)}%
            </span>
          </div>
          <div className={`text-xs text-${gasStatus.color}`}>
            {gasStatus.label}
          </div>
        </div>

        {/* 能见度 */}
        <div className="bg-dark-border rounded p-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400 flex items-center gap-2">
              <Activity size={14} />
              能见度
            </span>
            <span className="font-mono text-sm font-bold text-rescue-green">
              {(robotState.visibility * 100).toFixed(0)}%
            </span>
          </div>
          {robotState.visibility < 0.5 && (
            <div className="text-xs text-rescue-yellow flex items-center gap-1">
              <AlertTriangle size={12} />
              能见度过低，小心前进
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DataMonitor
