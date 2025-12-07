import { useState, useEffect } from 'react'
import { 
  Wifi, 
  WifiOff, 
  Clock, 
  Thermometer, 
  Wind, 
  Eye,
  Droplet,
  Zap,
  Battery,
  AlertTriangle,
  Crosshair,
  Target,
  Activity,
  Radio
} from 'lucide-react'

// 辅助组件：分段式进度条
const SegmentedBar = ({ value, max = 100, color = 'bg-tech-cyan', segments = 20 }) => {
  const activeSegments = Math.floor((value / max) * segments)
  
  return (
    <div className="flex gap-0.5 h-2 w-full">
      {[...Array(segments)].map((_, i) => (
        <div
          key={i}
          className={`flex-1 transform skew-x-[-20deg] ${
            i < activeSegments ? color : 'bg-white/10'
          } ${i < activeSegments && i > activeSegments - 2 ? 'animate-pulse' : ''}`}
        />
      ))}
    </div>
  )
}

// 辅助组件：科技感面板容器
const TechPanel = ({ children, className = "", title, align = "left" }) => (
  <div className={`relative group ${className}`}>
    {/* 装饰性边框 - 括号样式 */}
    <div className={`absolute top-0 ${align === 'right' ? 'right-0 border-r-2' : 'left-0 border-l-2'} w-2 h-2 border-t-2 border-tech-cyan opacity-60`}></div>
    <div className={`absolute bottom-0 ${align === 'right' ? 'right-0 border-r-2' : 'left-0 border-l-2'} w-2 h-2 border-b-2 border-tech-cyan opacity-60`}></div>
    
    {/* 背景渐变 */}
    <div className={`absolute inset-0 bg-gradient-to-${align === 'right' ? 'l' : 'r'} from-black/80 to-transparent backdrop-blur-sm -skew-x-6 border-${align === 'right' ? 'r' : 'l'} border-white/10`}></div>

    {/* 内容 */}
    <div className="relative p-3 z-10">
      {title && (
        <div className={`flex items-center gap-2 mb-2 ${align === 'right' ? 'flex-row-reverse' : ''}`}>
          <div className="w-1 h-1 bg-tech-cyan"></div>
          <h3 className="text-tech-cyan text-xs font-mono tracking-widest uppercase">{title}</h3>
          <div className="flex-1 h-px bg-gradient-to-r from-tech-cyan/50 to-transparent"></div>
        </div>
      )}
      {children}
    </div>
  </div>
)

// 辅助组件：战术按钮
const TacticalButton = ({ onClick, disabled, active, label, subLabel, icon: Icon, color = "cyan" }) => {
  const colorClass = color === 'amber' ? 'text-tech-amber border-tech-amber' : 'text-tech-cyan border-tech-cyan'
  const bgClass = color === 'amber' ? 'bg-tech-amber' : 'bg-tech-cyan'
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`relative group w-full h-full min-h-[60px] px-4 py-2 transition-all duration-200
        ${disabled ? 'opacity-40 cursor-not-allowed' : 'hover:brightness-110 active:scale-95'}
      `}
      style={{
        clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)'
      }}
    >
      {/* 按钮背景 */}
      <div className={`absolute inset-0 border ${active ? 'border-transparent' : 'border-white/20'} ${colorClass} transition-all`}></div>
      <div className={`absolute inset-0 opacity-10 ${active ? bgClass : 'bg-black'}`}></div>
      
      {/* 激活状态填充 */}
      {active && (
        <div className={`absolute inset-0 ${bgClass} opacity-20`}></div>
      )}

      {/* 内容 */}
      <div className="relative flex flex-col items-center justify-center gap-1">
        {Icon && <Icon size={20} className={active ? 'text-white' : colorClass.split(' ')[0]} />}
        <span className={`text-xs font-bold tracking-wider ${active ? 'text-white' : 'text-white/80'}`}>{label}</span>
        {subLabel && (
          <span className="absolute top-1 right-1 text-[10px] font-mono opacity-60">{subLabel}</span>
        )}
      </div>
      
      {/* 角落装饰 */}
      <div className={`absolute bottom-0 right-0 w-2 h-2 ${bgClass} opacity-50`}></div>
    </button>
  )
}

function RobotHUD({ 
  robotState, 
  isMoving, 
  onButtonPress, 
  onButtonRelease,
  isLoaded,
  isSocketConnected,
  keysPressed = {}
}) {
  const [missionTime, setMissionTime] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => setMissionTime(prev => prev + 1), 1000)
    return () => clearInterval(timer)
  }, [])

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  return (
    <div className="absolute inset-0 z-10 pointer-events-none font-mono select-none overflow-hidden">
      {/* 顶部装饰线 */}
      <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-black/80 to-transparent flex justify-between items-start px-4 pt-1">
        <div className="flex gap-1">
          <div className="w-16 h-1 bg-tech-cyan"></div>
          <div className="w-4 h-1 bg-tech-cyan/50"></div>
          <div className="w-2 h-1 bg-tech-cyan/30"></div>
        </div>
        <div className="text-[10px] text-tech-cyan/60 tracking-[0.5em]">TACTICAL INTERFACE V2.0</div>
        <div className="flex gap-1 flex-row-reverse">
          <div className="w-16 h-1 bg-tech-amber"></div>
          <div className="w-4 h-1 bg-tech-amber/50"></div>
          <div className="w-2 h-1 bg-tech-amber/30"></div>
        </div>
      </div>

      {/* 左上角 - 系统状态 */}
      <div className="absolute top-12 left-4 w-64 space-y-4 pointer-events-auto">
        <TechPanel title="SYSTEM STATUS">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Activity size={16} className={isSocketConnected ? "text-tech-cyan" : "text-red-500"} />
              <span className="text-sm text-white/80">UPLINK</span>
            </div>
            <span className={`text-sm font-bold ${isSocketConnected ? "text-tech-cyan" : "text-red-500 animate-pulse"}`}>
              {isSocketConnected ? "ONLINE" : "OFFLINE"}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-tech-cyan" />
              <span className="text-sm text-white/80">MISSION</span>
            </div>
            <span className="text-lg text-white font-bold tracking-widest">
              {formatTime(missionTime)}
            </span>
          </div>
        </TechPanel>

        {!isLoaded && (
          <div className="border border-tech-amber/50 bg-black/60 p-2 text-center animate-pulse">
            <span className="text-tech-amber font-bold">INITIALIZING VIDEO FEED...</span>
          </div>
        )}
      </div>

      {/* 右侧 - 环境监测 (避开右上角地图区域) */}
      {/* 地图区域预留: top-4 right-4 w-[300px] h-[200px] */}
      <div className="absolute top-[240px] right-4 w-56 space-y-2 pointer-events-auto">
        <TechPanel title="ENVIRONMENT" align="right">
          <div className="space-y-4">
            {/* 温度 */}
            <div>
              <div className="flex justify-between text-xs mb-1 text-white/60">
                <span>TEMP</span>
                <span className={robotState.temperature > 30 ? "text-red-500 blink" : "text-tech-cyan"}>
                  {robotState.temperature.toFixed(1)}°C
                </span>
              </div>
              <SegmentedBar 
                value={robotState.temperature} 
                max={50} 
                color={robotState.temperature > 30 ? "bg-red-500" : "bg-tech-cyan"} 
              />
            </div>

            {/* 气体 */}
            <div>
              <div className="flex justify-between text-xs mb-1 text-white/60">
                <span>TOXIN</span>
                <span className={robotState.gasLevel > 0.7 ? "text-red-500 blink" : "text-tech-amber"}>
                  {(robotState.gasLevel * 100).toFixed(0)}%
                </span>
              </div>
              <SegmentedBar 
                value={robotState.gasLevel * 100} 
                max={100} 
                color={robotState.gasLevel > 0.7 ? "bg-red-500" : "bg-tech-amber"} 
              />
            </div>

            {/* 能见度 */}
            <div>
              <div className="flex justify-between text-xs mb-1 text-white/60">
                <span>VISIBILITY</span>
                <span className="text-tech-cyan">
                  {(robotState.visibility * 100).toFixed(0)}%
                </span>
              </div>
              <SegmentedBar 
                value={robotState.visibility * 100} 
                max={100} 
                color="bg-tech-cyan" 
              />
            </div>
          </div>
        </TechPanel>

        {/* 生命体征警告 */}
        {robotState.isPersonDetected && (
          <div className="relative overflow-hidden bg-red-900/40 border-l-4 border-red-500 p-3 animate-pulse">
            <div className="flex items-center gap-2 text-red-500">
              <Target className="animate-spin-slow" />
              <div className="font-bold tracking-widest">LIFE SIGN DETECTED</div>
            </div>
            <div className="text-right text-2xl font-bold text-white mt-1">
              {robotState.distanceToNpc?.toFixed(1)}m
            </div>
            {/* 扫描线动画 */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-red-500/20 to-transparent h-[200%] w-full animate-scan"></div>
          </div>
        )}
      </div>

      {/* 中心准星 */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-60">
        <div className="relative">
          <Crosshair size={48} className="text-tech-cyan" strokeWidth={1} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-tech-cyan rounded-full"></div>
          {/* 动态圆环 */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 border border-tech-cyan/20 rounded-full animate-ping-slow"></div>
        </div>
      </div>

      {/* 左下角 - 机动状态 */}
      <div className="absolute bottom-8 left-8 flex gap-6 items-end pointer-events-auto">
        {/* 电池 */}
        <div className="w-48">
          <TechPanel title="POWER CELL">
            <div className="flex items-end gap-2 mb-2">
              <span className="text-3xl font-bold text-white leading-none">
                {robotState.battery.toFixed(0)}
              </span>
              <span className="text-sm text-tech-cyan mb-1">%</span>
            </div>
            <SegmentedBar 
              value={robotState.battery} 
              max={100} 
              segments={15}
              color={robotState.battery < 20 ? "bg-red-500" : "bg-tech-cyan"} 
            />
          </TechPanel>
        </div>

        {/* WASD 指示器 */}
        <div className="grid grid-cols-3 gap-1">
          <div></div>
          <div className={`w-10 h-10 border border-tech-cyan/30 flex items-center justify-center text-sm font-bold transition-all ${
            isMoving.forward || keysPressed['W'] ? 'bg-tech-cyan text-black shadow-[0_0_10px_rgba(0,240,255,0.5)]' : 'text-white/20'
          }`} style={{ clipPath: 'polygon(20% 0, 80% 0, 100% 20%, 100% 100%, 0 100%, 0 20%)' }}>W</div>
          <div></div>
          
          <div className={`w-10 h-10 border border-tech-cyan/30 flex items-center justify-center text-sm font-bold transition-all ${
            isMoving.left || keysPressed['A'] ? 'bg-tech-cyan text-black shadow-[0_0_10px_rgba(0,240,255,0.5)]' : 'text-white/20'
          }`} style={{ clipPath: 'polygon(0 0, 100% 0, 100% 80%, 80% 100%, 0 100%)' }}>A</div>
          
          <div className={`w-10 h-10 border border-tech-cyan/30 flex items-center justify-center text-sm font-bold transition-all ${
            isMoving.back || keysPressed['S'] ? 'bg-tech-cyan text-black shadow-[0_0_10px_rgba(0,240,255,0.5)]' : 'text-white/20'
          }`}>S</div>
          
          <div className={`w-10 h-10 border border-tech-cyan/30 flex items-center justify-center text-sm font-bold transition-all ${
            isMoving.right || keysPressed['D'] ? 'bg-tech-cyan text-black shadow-[0_0_10px_rgba(0,240,255,0.5)]' : 'text-white/20'
          }`} style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 20% 100%, 0 80%)' }}>D</div>
        </div>
      </div>

      {/* 右下角 - 交互操作 */}
      <div className="absolute bottom-8 right-8 flex gap-4 pointer-events-auto items-end">
        {/* 工具栏 */}
        <div className="flex flex-col gap-2 w-32">
          <TacticalButton 
            label="LIGHT" 
            subLabel="[F]"
            icon={Zap}
            active={robotState.isFlashlightOn}
            onClick={() => onButtonPress('flashlight')}
            color="amber"
          />
          <TacticalButton 
            label="NIGHT" 
            subLabel="[N]"
            icon={Eye}
            active={robotState.isNightvisionOn}
            onClick={() => onButtonPress('nightvision')}
            color="cyan"
          />
        </div>

        {/* 投放控制 */}
        <div className="flex gap-2">
          <div className="w-24 h-24">
            <TacticalButton 
              label="WATER" 
              subLabel="[1]"
              icon={Droplet}
              disabled={robotState.waterCount === 0}
              onClick={() => onButtonPress('water')}
              color="cyan"
            />
            <div className="text-center mt-1 text-xs text-tech-cyan font-bold tracking-widest">
              QTY: {robotState.waterCount}
            </div>
          </div>
          
          <div className="w-24 h-24">
            <TacticalButton 
              label="RATION" 
              subLabel="[2]"
              icon={Radio}
              disabled={robotState.foodCount === 0}
              onClick={() => onButtonPress('food')}
              color="amber"
            />
            <div className="text-center mt-1 text-tech-amber text-xs font-bold tracking-widest">
              QTY: {robotState.foodCount}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RobotHUD
