import { useState, useEffect } from 'react'
import { 
  Zap,
  Target,
  Radio,
  Navigation,
  Eye,
  Droplet,
  Package
} from 'lucide-react'

// 仪表盘风格按钮
const DashboardButton = ({ onClick, label, active, color = 'blue', icon: Icon, disabled, shortcut }) => {
  const colors = {
    blue: 'bg-blue-600 border-blue-400 shadow-blue-500/50',
    red: 'bg-red-600 border-red-400 shadow-red-500/50',
    green: 'bg-emerald-600 border-emerald-400 shadow-emerald-500/50',
    amber: 'bg-amber-600 border-amber-400 shadow-amber-500/50',
    gray: 'bg-gray-600 border-gray-400 shadow-gray-500/50',
  }
  
  const baseColor = disabled ? colors.gray : (colors[color] || colors.blue)

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        relative group overflow-hidden rounded-lg border-b-4 active:border-b-0 active:translate-y-1 transition-all
        ${active ? 'brightness-125' : 'brightness-90 hover:brightness-110'}
        ${baseColor}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        p-3 min-w-[100px]
      `}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
      {shortcut && (
        <div className="absolute top-1 right-1 text-[10px] font-mono font-bold text-white/70 border border-white/20 rounded px-1.5 bg-black/40 shadow-sm">
          {shortcut}
        </div>
      )}
      <div className="relative flex flex-col items-center justify-center gap-1 text-white shadow-black drop-shadow-md">
        {Icon && <Icon size={24} />}
        <span className="text-xs font-bold uppercase tracking-wider">{label}</span>
      </div>
    </button>
  )
}

// 移动控制指示器
const MovementControl = ({ keysPressed }) => (
  <div className="flex flex-col items-center gap-1 bg-black/20 p-3 rounded-xl border border-white/5 backdrop-blur-sm mr-4">
    <div className={`w-10 h-10 flex items-center justify-center rounded-lg border-b-4 transition-all ${keysPressed['w'] ? 'bg-blue-600 border-blue-800 translate-y-1 border-b-0 brightness-125 shadow-[0_0_15px_rgba(37,99,235,0.6)]' : 'bg-gray-800 border-gray-950 text-gray-500'}`}>
      <span className="font-mono font-bold text-white">W</span>
    </div>
    <div className="flex gap-1">
      <div className={`w-10 h-10 flex items-center justify-center rounded-lg border-b-4 transition-all ${keysPressed['a'] ? 'bg-blue-600 border-blue-800 translate-y-1 border-b-0 brightness-125 shadow-[0_0_15px_rgba(37,99,235,0.6)]' : 'bg-gray-800 border-gray-950 text-gray-500'}`}>
        <span className="font-mono font-bold text-white">A</span>
      </div>
      <div className={`w-10 h-10 flex items-center justify-center rounded-lg border-b-4 transition-all ${keysPressed['s'] ? 'bg-blue-600 border-blue-800 translate-y-1 border-b-0 brightness-125 shadow-[0_0_15px_rgba(37,99,235,0.6)]' : 'bg-gray-800 border-gray-950 text-gray-500'}`}>
        <span className="font-mono font-bold text-white">S</span>
      </div>
      <div className={`w-10 h-10 flex items-center justify-center rounded-lg border-b-4 transition-all ${keysPressed['d'] ? 'bg-blue-600 border-blue-800 translate-y-1 border-b-0 brightness-125 shadow-[0_0_15px_rgba(37,99,235,0.6)]' : 'bg-gray-800 border-gray-950 text-gray-500'}`}>
        <span className="font-mono font-bold text-white">D</span>
      </div>
    </div>
    <span className="text-[10px] text-gray-400 font-mono mt-1 tracking-widest">MANUAL</span>
  </div>
)

// 圆形仪表
const Gauge = ({ value, max = 100, label, unit = '', color = '#3b82f6', warningThreshold }) => {
  const radius = 36
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (value / max) * circumference
  
  // 警告颜色逻辑
  const isWarning = warningThreshold && value > warningThreshold
  const displayColor = isWarning ? '#ef4444' : color

  return (
    <div className="relative flex flex-col items-center group">
      <div className="relative w-24 h-24">
        {/* 刻度线背景 */}
        <div className="absolute inset-0 rounded-full border-4 border-gray-800 border-dashed opacity-30"></div>
        
        {/* 背景圆环 */}
        <svg className="w-full h-full transform -rotate-90 drop-shadow-lg">
          <circle
            cx="48"
            cy="48"
            r={radius}
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="8"
            fill="transparent"
          />
          {/* 进度圆环 */}
          <circle
            cx="48"
            cy="48"
            r={radius}
            stroke={displayColor}
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className={`transition-all duration-500 ease-out ${isWarning ? 'animate-pulse' : ''}`}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
          <span className={`text-xl font-bold font-mono ${isWarning ? 'text-red-500' : ''}`}>{Math.round(value)}</span>
          <span className="text-[10px] text-gray-400 uppercase">{unit}</span>
        </div>
      </div>
      <div className="flex items-center gap-1 mt-1">
        <div className={`w-1.5 h-1.5 rounded-full ${isWarning ? 'bg-red-500' : 'bg-gray-600'}`}></div>
        <span className="text-xs font-bold text-gray-400 uppercase">{label}</span>
      </div>
    </div>
  )
}

// 侧边数据条
const SideBar = ({ label, value, max = 100, color = "bg-blue-500", align = "left" }) => (
  <div className={`flex items-center gap-2 ${align === 'right' ? 'flex-row-reverse' : ''}`}>
    <span className="text-[10px] font-bold text-gray-400 w-8 text-center">{label}</span>
    <div className="w-32 h-2 bg-gray-800 rounded-full overflow-hidden border border-gray-700">
      <div 
        className={`h-full ${color} transition-all duration-500`} 
        style={{ width: `${(value / max) * 100}%` }}
      ></div>
    </div>
    <span className="text-xs font-mono text-white w-8 text-center">{Math.round(value)}</span>
  </div>
)

const RobotHUD_Dashboard = ({ 
  robotState, 
  isMoving, 
  onButtonPress, 
  onButtonRelease, 
  isLoaded, 
  isSocketConnected,
  keysPressed 
}) => {
  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between text-white font-sans overflow-hidden">
      {/* 驾驶舱玻璃纹理覆盖 */}
      <div className="absolute inset-0 pointer-events-none z-0 opacity-30 bg-[radial-gradient(circle_at_center,transparent_50%,rgba(0,0,0,0.8)_100%)]"></div>
      
      {/* 顶部遮罩 - 模拟头盔/驾驶舱顶部 */}
      <div className="w-full h-24 bg-gradient-to-b from-black via-black/90 to-transparent pointer-events-none flex justify-between items-start px-8 pt-4 z-10">
        {/* 左上：环境数据 */}
        <div className="flex flex-col gap-2 pointer-events-auto">
          <SideBar label="TEMP" value={robotState.temperature} max={50} color={robotState.temperature > 35 ? "bg-red-500" : "bg-amber-500"} />
          <SideBar label="GAS" value={robotState.gasLevel * 100} max={100} color={robotState.gasLevel > 0.5 ? "bg-red-500" : "bg-purple-500"} />
          <SideBar label="VIS" value={robotState.visibility * 100} max={100} color="bg-cyan-500" />
        </div>

        {/* 中上：状态栏 */}
        <div className="bg-black/60 backdrop-blur border border-white/10 px-6 py-2 rounded-full flex items-center gap-6 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isSocketConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
            <span className="text-xs font-mono text-gray-300">LINK: {isSocketConnected ? 'ESTABLISHED' : 'LOST'}</span>
          </div>
          <div className="w-px h-4 bg-white/20"></div>
          <div className="flex items-center gap-2">
            <Navigation size={14} className="text-blue-400" />
            <span className="text-xs font-mono text-gray-300">
              POS: {robotState.position.x.toFixed(1)}, {robotState.position.z.toFixed(1)}
            </span>
          </div>
        </div>

        {/* 右上：辅助状态 */}
        <div className="flex flex-col gap-2 items-end pointer-events-auto">
          <div className={`flex items-center gap-2 px-3 py-1 rounded border ${robotState.isFlashlightOn ? 'bg-yellow-500/20 border-yellow-500 text-yellow-500' : 'bg-black/40 border-gray-700 text-gray-500'}`}>
            <span className="text-[10px] font-bold">FLASHLIGHT</span>
            <Zap size={14} className={robotState.isFlashlightOn ? 'fill-current' : ''} />
          </div>
          <div className={`flex items-center gap-2 px-3 py-1 rounded border ${robotState.isNightvisionOn ? 'bg-green-500/20 border-green-500 text-green-500' : 'bg-black/40 border-gray-700 text-gray-500'}`}>
            <span className="text-[10px] font-bold">NIGHT VISION</span>
            <Eye size={14} className={robotState.isNightvisionOn ? 'fill-current' : ''} />
          </div>
        </div>
      </div>

      {/* 底部控制台 - 模拟驾驶舱仪表板 */}
      <div className="relative w-full h-72 bg-gradient-to-t from-gray-900 via-gray-900/95 to-transparent pointer-events-auto flex items-end justify-center pb-8 px-12 gap-16 z-10">
        {/* 装饰性边框 */}
        <div className="absolute top-10 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent"></div>

        {/* 左侧仪表组 */}
        <div className="flex gap-8 items-end mb-4 bg-black/20 p-4 rounded-xl border border-white/5 backdrop-blur-sm">
          <Gauge value={robotState.battery} label="BATTERY" unit="%" color={robotState.battery < 20 ? '#ef4444' : '#10b981'} />
          <Gauge value={robotState.temperature} max={50} label="TEMP" unit="°C" color="#f59e0b" warningThreshold={35} />
        </div>

        {/* 移动控制指示器 (新增) */}
        <div className="mb-4">
          <MovementControl keysPressed={keysPressed} />
        </div>

        {/* 中央雷达与主控 */}
        <div className="flex flex-col items-center gap-6 mb-2">
          {/* 雷达显示 */}
          <div className="relative w-64 h-32 overflow-hidden rounded-t-full border-t-2 border-x-2 border-blue-500/30 bg-blue-900/20 backdrop-blur-md shadow-[0_0_30px_rgba(59,130,246,0.2)]">
            {/* 网格线 */}
            <div className="absolute inset-0" 
                 style={{ 
                   backgroundImage: 'radial-gradient(circle, rgba(59,130,246,0.2) 1px, transparent 1px)',
                   backgroundSize: '20px 20px'
                 }}>
            </div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-full border border-blue-500/10 rounded-full"></div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2/3 h-2/3 border border-blue-500/10 rounded-full"></div>
            
            {/* 扫描线动画 */}
            <div className="absolute inset-0 origin-bottom animate-[spin_3s_linear_infinite] border-r border-blue-400/50 bg-gradient-to-r from-transparent to-blue-500/10" 
                 style={{ transformOrigin: '50% 100%' }}></div>
            
            {/* 目标点 */}
            {robotState.isPersonDetected && (
              <div className="absolute bottom-0 left-1/2 w-full h-full flex items-end justify-center">
                <div 
                  className="absolute w-4 h-4 bg-red-500 rounded-full shadow-[0_0_15px_rgba(239,68,68,1)] animate-ping"
                  style={{ 
                    bottom: `${Math.min(90, (100 - robotState.distanceToNpc))}%`,
                    transform: `translateX(${(Math.random() - 0.5) * 40}px)` 
                  }}
                ></div>
                <div 
                  className="absolute w-2 h-2 bg-white rounded-full"
                  style={{ 
                    bottom: `${Math.min(90, (100 - robotState.distanceToNpc))}%`,
                    transform: `translateX(${(Math.random() - 0.5) * 40}px)` 
                  }}
                ></div>
              </div>
            )}
            
            {/* 距离读数 */}
            <div className="absolute bottom-4 w-full text-center">
              <div className={`text-2xl font-mono font-bold tracking-widest ${robotState.isPersonDetected ? 'text-red-400 animate-pulse' : 'text-blue-400/50'}`}>
                {robotState.isPersonDetected ? robotState.distanceToNpc.toFixed(1) : '--.-'} <span className="text-sm">M</span>
              </div>
              {robotState.isPersonDetected && (
                <div className="text-[10px] text-red-500 font-bold animate-bounce mt-1">TARGET DETECTED</div>
              )}
            </div>
          </div>

          {/* 主控按钮组 */}
          <div className="flex gap-4 bg-gray-800/90 p-4 rounded-2xl border-t border-gray-600 shadow-2xl transform translate-y-2">
            <DashboardButton 
              label={`投放水 (${robotState.waterCount})`}
              icon={Droplet} 
              color="blue"
              disabled={robotState.waterCount <= 0}
              onClick={() => onButtonPress('place_water')}
              shortcut="1"
            />
            <DashboardButton 
              label={`投放食物 (${robotState.foodCount})`}
              icon={Package} 
              color="amber"
              disabled={robotState.foodCount <= 0}
              onClick={() => onButtonPress('place_food')}
              shortcut="2"
            />
            <div className="w-px bg-gray-600 mx-2"></div>
            <DashboardButton 
              label="手电筒" 
              icon={Zap} 
              color={robotState.isFlashlightOn ? "green" : "gray"}
              active={robotState.isFlashlightOn}
              onClick={() => onButtonPress('toggle_flashlight')}
              shortcut="M"
            />
            <DashboardButton 
              label="夜视仪" 
              icon={Eye} 
              color={robotState.isNightvisionOn ? "green" : "gray"}
              active={robotState.isNightvisionOn}
              onClick={() => onButtonPress('toggle_nightvision')}
              shortcut="N"
            />
          </div>
        </div>

        {/* 右侧仪表组 */}
        <div className="flex gap-8 items-end mb-4 bg-black/20 p-4 rounded-xl border border-white/5 backdrop-blur-sm">
          <Gauge value={robotState.waterCount * 10} max={100} label="WATER" unit="%" color="#3b82f6" />
          <Gauge value={robotState.foodCount * 10} max={100} label="FOOD" unit="%" color="#f59e0b" />
        </div>
      </div>

      {/* 装饰性网格线 */}
      <div className="absolute inset-0 pointer-events-none opacity-5" 
           style={{ 
             backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
             backgroundSize: '60px 60px'
           }}>
      </div>
    </div>
  )
}

export default RobotHUD_Dashboard
