import { useState } from 'react'
import {
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Droplet,
  Zap,
  Eye,
  EyeOff,
} from 'lucide-react'

function ControlPanel({ robotState, isMoving, onButtonPress, onButtonRelease }) {
  const [showHelp, setShowHelp] = useState(false)

  const handleMouseDown = (action) => {
    onButtonPress(action)
  }

  const handleMouseUp = (action) => {
    onButtonRelease(action)
  }

  return (
    <div className="glass-panel rounded-lg p-3 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-rescue-orange flex items-center">
          <span className="w-2 h-2 bg-rescue-orange rounded-full mr-2"></span>
          操控面板
        </h2>
        <button
          onClick={() => setShowHelp(!showHelp)}
          className="text-xs bg-dark-border px-2 py-1 rounded hover:bg-rescue-blue/20 transition"
        >
          ℹ️ {showHelp ? '隐藏' : '帮助'}
        </button>
      </div>

      {showHelp && (
        <div className="bg-dark-border rounded p-3 text-xs space-y-1 border-l-2 border-rescue-blue">
          <p><strong>移动:</strong> W/A/S/D 或 方向按钮</p>
          <p><strong>投放:</strong> 1=水 / 2=食物</p>
          <p><strong>工具:</strong> F=手电筒 / N=夜视</p>
        </div>
      )}

      {/* 移动控制 */}
      <div>
        <h3 className="text-sm font-semibold mb-2 text-slate-300">移动控制</h3>
        <div className="grid grid-cols-3 gap-1.5 mb-2">
          <div></div>
          <button
            onMouseDown={() => handleMouseDown('forward')}
            onMouseUp={() => handleMouseUp('forward')}
            onTouchStart={() => handleMouseDown('forward')}
            onTouchEnd={() => handleMouseUp('forward')}
            className={`p-2 rounded-lg font-bold transition-all ${
              isMoving.forward
                ? 'bg-rescue-blue/80 scale-95 shadow-lg shadow-rescue-blue/50'
                : 'bg-rescue-blue/30 hover:bg-rescue-blue/50'
            }`}
          >
            <ChevronUp size={20} className="mx-auto" />
          </button>
          <div></div>

          <button
            onMouseDown={() => handleMouseDown('left')}
            onMouseUp={() => handleMouseUp('left')}
            onTouchStart={() => handleMouseDown('left')}
            onTouchEnd={() => handleMouseUp('left')}
            className={`p-2 rounded-lg font-bold transition-all ${
              isMoving.left
                ? 'bg-rescue-blue/80 scale-95 shadow-lg shadow-rescue-blue/50'
                : 'bg-rescue-blue/30 hover:bg-rescue-blue/50'
            }`}
          >
            <ChevronLeft size={20} className="mx-auto" />
          </button>

          <button
            onMouseDown={() => handleMouseDown('back')}
            onMouseUp={() => handleMouseUp('back')}
            onTouchStart={() => handleMouseDown('back')}
            onTouchEnd={() => handleMouseUp('back')}
            className={`p-2 rounded-lg font-bold transition-all ${
              isMoving.back
                ? 'bg-rescue-blue/80 scale-95 shadow-lg shadow-rescue-blue/50'
                : 'bg-rescue-blue/30 hover:bg-rescue-blue/50'
            }`}
          >
            <ChevronDown size={20} className="mx-auto" />
          </button>

          <button
            onMouseDown={() => handleMouseDown('right')}
            onMouseUp={() => handleMouseUp('right')}
            onTouchStart={() => handleMouseDown('right')}
            onTouchEnd={() => handleMouseUp('right')}
            className={`p-2 rounded-lg font-bold transition-all ${
              isMoving.right
                ? 'bg-rescue-blue/80 scale-95 shadow-lg shadow-rescue-blue/50'
                : 'bg-rescue-blue/30 hover:bg-rescue-blue/50'
            }`}
          >
            <ChevronRight size={20} className="mx-auto" />
          </button>
        </div>
        <div className="text-xs text-slate-400 text-center">
          按键: <kbd className="bg-dark-border px-1 rounded">W/A/S/D</kbd>
        </div>
      </div>

      {/* 物资投放 */}
      <div>
        <h3 className="text-sm font-semibold mb-2 text-slate-300">物资投放</h3>
        <div className="grid grid-cols-2 gap-1.5">
          <button
            onClick={() => handleMouseDown('water')}
            disabled={robotState.waterCount === 0}
            className={`p-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2 ${
              robotState.waterCount === 0
                ? 'bg-dark-border text-slate-500 cursor-not-allowed'
                : 'bg-rescue-blue/30 hover:bg-rescue-blue/50 active:scale-95 active:shadow-lg active:shadow-rescue-blue/50'
            }`}
          >
            <Droplet size={16} />
            <div>
              <div className="text-xs">水</div>
              <div className="text-xs font-mono">{robotState.waterCount}</div>
            </div>
          </button>
          <button
            onClick={() => handleMouseDown('food')}
            disabled={robotState.foodCount === 0}
            className={`p-2 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 ${
              robotState.foodCount === 0
                ? 'bg-dark-border text-slate-500 cursor-not-allowed'
                : 'bg-rescue-yellow/30 hover:bg-rescue-yellow/50 active:scale-95 active:shadow-lg active:shadow-rescue-yellow/50'
            }`}
          >
            <Zap size={16} />
            <div>
              <div className="text-xs">食物</div>
              <div className="text-xs font-mono">{robotState.foodCount}</div>
            </div>
          </button>
        </div>
        <div className="text-xs text-slate-400 text-center mt-2">
          按键: <kbd className="bg-dark-border px-1 rounded">1</kbd> / <kbd className="bg-dark-border px-1 rounded">2</kbd>
        </div>
      </div>

      {/* 工具控制 */}
      <div>
        <h3 className="text-sm font-semibold mb-2 text-slate-300">工具控制</h3>
        <div className="grid grid-cols-2 gap-1.5">
          <button
            onClick={() => handleMouseDown('flashlight')}
            className={`p-2 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 ${
              robotState.isFlashlightOn
                ? 'bg-rescue-yellow/80 text-dark-bg shadow-lg shadow-rescue-yellow/50'
                : 'bg-rescue-yellow/30 hover:bg-rescue-yellow/50 active:scale-95'
            }`}
          >
            <Eye size={16} />
            <div className="text-xs">手电筒</div>
          </button>
          <button
            onClick={() => handleMouseDown('nightvision')}
            className={`p-2 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 ${
              robotState.isNightvisionOn
                ? 'bg-rescue-green/80 text-dark-bg shadow-lg shadow-rescue-green/50'
                : 'bg-rescue-green/30 hover:bg-rescue-green/50 active:scale-95'
            }`}
          >
            <EyeOff size={16} />
            <div className="text-xs">夜视</div>
          </button>
        </div>
        <div className="text-xs text-slate-400 text-center mt-2">
          按键: <kbd className="bg-dark-border px-1 rounded">F</kbd> / <kbd className="bg-dark-border px-1 rounded">N</kbd>
        </div>
      </div>

      {/* 快速状态指示 */}
      <div className="border-t border-dark-border pt-3">
        <div className="text-xs font-semibold text-slate-400 mb-2">快速状态</div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className={`p-2 rounded text-center ${
            robotState.isFlashlightOn
              ? 'bg-rescue-yellow/20 text-rescue-yellow border border-rescue-yellow'
              : 'bg-dark-border text-slate-500'
          }`}>
            手电: {robotState.isFlashlightOn ? 'ON' : 'OFF'}
          </div>
          <div className={`p-2 rounded text-center ${
            robotState.isNightvisionOn
              ? 'bg-rescue-green/20 text-rescue-green border border-rescue-green'
              : 'bg-dark-border text-slate-500'
          }`}>
            夜视: {robotState.isNightvisionOn ? 'ON' : 'OFF'}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ControlPanel
