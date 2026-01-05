import { useState, useEffect } from 'react'
import { 
  Wifi, 
  Battery,
  Zap,
  Target,
  Radio,
  Crosshair,
  Navigation,
  Power
} from 'lucide-react'

// 仪表盘风格按钮
const DashboardButton = ({ onClick, label, active, color = 'blue', icon: Icon }) => {
  const colors = {
    blue: 'bg-blue-600 border-blue-400 shadow-blue-500/50',
    red: 'bg-red-600 border-red-400 shadow-red-500/50',
    green: 'bg-emerald-600 border-emerald-400 shadow-emerald-500/50',
    amber: 'bg-amber-600 border-amber-400 shadow-amber-500/50',
  }
  
  const baseColor = colors[color] || colors.blue

  return (
    <button
      onClick={onClick}
      className={`
        relative group overflow-hidden rounded-lg border-b-4 active:border-b-0 active:translate-y-1 transition-all
        ${active ? 'brightness-125' : 'brightness-90 hover:brightness-110'}
        ${baseColor}
        p-3 min-w-[100px]
      `}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
      <div className="relative flex flex-col items-center justify-center gap-1 text-white shadow-black drop-shadow-md">
        {Icon && <Icon size={24} />}
        <span className="text-xs font-bold uppercase tracking-wider">{label}</span>
      </div>
    </button>
  )
}

// 圆形仪表
const Gauge = ({ value, max = 100, label, unit = '', color = '#3b82f6' }) => {
  const radius = 36
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (value / max) * circumference

  return (
    <div className="relative flex flex-col items-center">
      <div className="relative w-24 h-24">
        {/* 背景圆环 */}
        <svg className="w-full h-full transform -rotate-90">
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
            stroke={color}
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-500 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
          <span className="text-xl font-bold font-mono">{Math.round(value)}</span>
          <span className="text-[10px] text-gray-400 uppercase">{unit}</span>
        </div>
      </div>
      <span className="text-xs font-bold text-gray-400 uppercase mt-1">{label}</span>
    </div>
  )
}

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
      {/* 顶部遮罩 - 模拟头盔/驾驶舱顶部 */}
      <div className="w-full h-24 bg-gradient-to-b from-black via-black/80 to-transparent pointer-events-none flex justify-center pt-4">
        <div className="bg-black/60 backdrop-blur border border-white/10 px-6 py-2 rounded-full flex items-center gap-6">
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
      </div>

      {/* 底部控制台 - 模拟驾驶舱仪表板 */}
      <div className="relative w-full h-64 bg-gradient-to-t from-gray-900 via-gray-900/95 to-transparent pointer-events-auto flex items-end justify-center pb-6 px-8 gap-12">
        
        {/* 左侧仪表组 */}
        <div className="flex gap-6 items-end mb-4">
          <Gauge value={robotState.battery} label="BATTERY" unit="%" color={robotState.battery < 20 ? '#ef4444' : '#10b981'} />
          <Gauge value={robotState.temperature} max={50} label="TEMP" unit="°C" color="#f59e0b" />
        </div>

        {/* 中央雷达与主控 */}
        <div className="flex flex-col items-center gap-4 mb-2">
          {/* 雷达显示 */}
          <div className="relative w-48 h-24 overflow-hidden rounded-t-full border-t-2 border-x-2 border-blue-500/30 bg-blue-900/20 backdrop-blur-sm">
            {/* 扫描线动画 */}
            <div className="absolute inset-0 origin-bottom animate-[spin_4s_linear_infinite] border-r border-blue-400/50 bg-gradient-to-r from-transparent to-blue-500/10" 
                 style={{ transformOrigin: '50% 100%' }}></div>
            
            {/* 目标点 */}
            {robotState.isPersonDetected && (
              <div className="absolute bottom-0 left-1/2 w-full h-full flex items-end justify-center">
                <div 
                  className="absolute w-3 h-3 bg-red-500 rounded-full shadow-[0_0_10px_rgba(239,68,68,1)] animate-ping"
                  style={{ 
                    bottom: `${Math.min(90, (100 - robotState.distanceToNpc))}%`,
                    transform: `translateX(${(Math.random() - 0.5) * 20}px)` // 简单的随机抖动模拟方位
                  }}
                ></div>
              </div>
            )}
            
            {/* 距离读数 */}
            <div className="absolute bottom-2 w-full text-center">
              <span className={`text-lg font-mono font-bold ${robotState.isPersonDetected ? 'text-red-400' : 'text-blue-400/50'}`}>
                {robotState.isPersonDetected ? robotState.distanceToNpc.toFixed(1) : '--.-'} M
              </span>
            </div>
          </div>

          {/* 主控按钮组 */}
          <div className="flex gap-3 bg-gray-800/80 p-3 rounded-xl border border-gray-700 shadow-2xl">
            <DashboardButton 
              label="投放水" 
              icon={Radio} 
              color="blue"
              onClick={() => onButtonPress('place_water')}
            />
            <DashboardButton 
              label="投放食物" 
              icon={Target} 
              color="amber"
              onClick={() => onButtonPress('place_food')}
            />
            <div className="w-px bg-gray-600 mx-1"></div>
            <DashboardButton 
              label="手电筒" 
              icon={Zap} 
              color={robotState.isFlashlightOn ? "green" : "blue"}
              active={robotState.isFlashlightOn}
              onClick={() => onButtonPress('toggle_flashlight')}
            />
          </div>
        </div>

        {/* 右侧仪表组 */}
        <div className="flex gap-6 items-end mb-4">
          <Gauge value={robotState.waterCount} max={10} label="WATER" unit="QTY" color="#3b82f6" />
          <Gauge value={robotState.foodCount} max={10} label="FOOD" unit="QTY" color="#f59e0b" />
        </div>
      </div>

      {/* 装饰性网格线 */}
      <div className="absolute inset-0 pointer-events-none opacity-10" 
           style={{ 
             backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
             backgroundSize: '40px 40px'
           }}>
      </div>
    </div>
  )
}

export default RobotHUD_Dashboard
