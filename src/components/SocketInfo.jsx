import { Activity, Users, MapPin, Signal } from 'lucide-react'

function SocketInfo({ robotState, isSocketConnected }) {
  return (
    <div className="glass-panel rounded-lg p-3">
      <h3 className="text-base font-bold text-rescue-orange mb-3 flex items-center">
        <span className="w-2 h-2 bg-rescue-orange rounded-full mr-2"></span>
        实时连接信息
      </h3>

      <div className="space-y-2">
        {/* 连接状态 */}
        <div className="bg-dark-border rounded p-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400 flex items-center gap-2">
              <Signal size={14} />
              TCP 连接
            </span>
            <span
              className={`font-mono text-xs font-bold ${
                isSocketConnected ? 'text-rescue-green' : 'text-rescue-red'
              }`}
            >
              {isSocketConnected ? '● 127.0.0.1:50001' : '○ 断开'}
            </span>
          </div>
          <div className="text-xs text-slate-500">
            {isSocketConnected ? 'WebSocket 活动连接' : '等待连接...'}
          </div>
        </div>

        {/* 玩家 ID */}
        {robotState.playerId && (
          <div className="bg-dark-border rounded p-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-400 flex items-center gap-2">
                <Activity size={14} />
                玩家 ID
              </span>
              <span className="font-mono text-xs font-bold text-rescue-blue">
                {robotState.playerId}
              </span>
            </div>
          </div>
        )}

        {/* NPC 距离 */}
        {robotState.npcId && (
          <div className="bg-dark-border rounded p-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-400 flex items-center gap-2">
                <Users size={14} />
                最近 NPC
              </span>
              <span className="font-mono text-xs font-bold text-rescue-yellow">
                {robotState.npcId}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">距离</span>
              <span
                className={`font-mono font-bold ${
                  robotState.distanceToNpc < 5
                    ? 'text-rescue-green'
                    : robotState.distanceToNpc < 15
                      ? 'text-rescue-yellow'
                      : 'text-slate-400'
                }`}
              >
                {robotState.distanceToNpc.toFixed(2)} m
              </span>
            </div>
          </div>
        )}

        {/* 位置坐标 */}
        <div className="bg-dark-border rounded p-2">
          <div className="flex items-center mb-2">
            <span className="text-sm text-slate-400 flex items-center gap-2">
              <MapPin size={14} />
              位置坐标
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="text-center">
              <div className="text-slate-500">X</div>
              <div className="font-mono font-bold text-rescue-blue">
                {robotState.position.x.toFixed(1)}
              </div>
            </div>
            <div className="text-center">
              <div className="text-slate-500">Y</div>
              <div className="font-mono font-bold text-rescue-blue">
                {robotState.position.y.toFixed(1)}
              </div>
            </div>
            <div className="text-center">
              <div className="text-slate-500">Z</div>
              <div className="font-mono font-bold text-rescue-blue">
                {robotState.position.z.toFixed(1)}
              </div>
            </div>
          </div>
        </div>

        {/* 背包容量 */}
        {robotState.playerId && (
          <div className="bg-dark-border rounded p-2">
            <div className="text-sm text-slate-400 mb-2">背包容量</div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">使用情况</span>
              <span className="font-mono font-bold text-rescue-blue">
                {robotState.waterCount + robotState.foodCount} / 20
              </span>
            </div>
            <div className="w-full bg-dark-bg rounded-full h-2 mt-2">
              <div
                className="bg-gradient-to-r from-rescue-blue to-rescue-green h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${((robotState.waterCount + robotState.foodCount) / 20) * 100}%`,
                }}
              ></div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default SocketInfo
