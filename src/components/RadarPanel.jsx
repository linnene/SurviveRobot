import { Map, Crosshair } from 'lucide-react'

function RadarPanel({ robotState }) {
  return (
    <div className="glass-panel rounded-lg p-4">
      <h3 className="text-lg font-bold text-rescue-orange mb-4 flex items-center">
        <span className="w-2 h-2 bg-rescue-orange rounded-full mr-2"></span>
        位置雷达
      </h3>

      {/* 雷达显示 */}
      <div className="relative w-full aspect-square bg-dark-border rounded-lg overflow-hidden mb-4">
        {/* 雷达网格 */}
        <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.3 }}>
          {/* 同心圆 */}
          <circle cx="50%" cy="50%" r="25%" fill="none" stroke="#4ade80" strokeWidth="0.5" />
          <circle cx="50%" cy="50%" r="50%" fill="none" stroke="#4ade80" strokeWidth="0.5" />
          <circle cx="50%" cy="50%" r="75%" fill="none" stroke="#4ade80" strokeWidth="0.5" />

          {/* 十字线 */}
          <line x1="50%" y1="0%" x2="50%" y2="100%" stroke="#4ade80" strokeWidth="0.5" />
          <line x1="0%" y1="50%" x2="100%" y2="50%" stroke="#4ade80" strokeWidth="0.5" />
        </svg>

        {/* 机器人位置 */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-4 h-4 bg-rescue-blue rounded-full shadow-lg shadow-rescue-blue"></div>
          <div
            className="absolute inset-0 rounded-full bg-rescue-blue animate-pulse"
            style={{
              opacity: 0.3,
              animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            }}
          ></div>
        </div>

        {/* NPC 位置（示意） */}
        {robotState.isPersonDetected && (
          <div className="absolute top-1/3 left-2/3 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-3 h-3 bg-rescue-red rounded-full shadow-lg shadow-rescue-red animate-blink"></div>
          </div>
        )}
      </div>

      {/* 位置信息 */}
      <div className="space-y-2 text-xs">
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-dark-border rounded p-2">
            <div className="text-slate-400">X</div>
            <div className="font-mono font-bold text-rescue-blue">
              {robotState.position.x.toFixed(1)}
            </div>
          </div>
          <div className="bg-dark-border rounded p-2">
            <div className="text-slate-400">Y</div>
            <div className="font-mono font-bold text-rescue-blue">
              {robotState.position.y.toFixed(1)}
            </div>
          </div>
          <div className="bg-dark-border rounded p-2 col-span-2">
            <div className="text-slate-400">Z</div>
            <div className="font-mono font-bold text-rescue-blue">
              {robotState.position.z.toFixed(1)}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RadarPanel
