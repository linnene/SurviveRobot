import { 
  Wifi, 
  WifiOff, 
  Battery,
  MapPin,
  User,
  Package,
  Flashlight,
  Eye,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Thermometer,
  Wind,
  Droplet
} from 'lucide-react'

const MinimalButton = ({ onClick, disabled, active, label, icon: Icon, color = 'gray', shortcut }) => {
  const activeClass = color === 'red' ? 'bg-red-900/80 text-white border-red-500' : 'bg-gray-200 text-black border-white'
  const baseClass = 'bg-gray-800/80 text-gray-300 border-gray-600 hover:bg-gray-700'
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        relative flex items-center justify-center gap-2 px-4 py-3 rounded border transition-all font-bold min-w-[140px]
        ${disabled 
          ? 'bg-gray-900/50 text-gray-600 border-gray-800 cursor-not-allowed' 
          : active
            ? activeClass
            : baseClass
        }
      `}
    >
      {Icon && <Icon size={20} />}
      <span className="text-sm">{label}</span>
      {shortcut && (
        <span className="absolute top-1 right-1 text-[10px] font-mono opacity-50 border border-current px-1 rounded">
          {shortcut}
        </span>
      )}
    </button>
  )
}

const DataItem = ({ label, value, unit, alert }) => (
  <div className={`flex flex-col ${alert ? 'text-red-500 animate-pulse' : 'text-gray-300'}`}>
    <span className="text-[10px] font-bold uppercase text-gray-500">{label}</span>
    <span className="text-xl font-mono font-bold leading-none">
      {value}<span className="text-xs ml-0.5 font-normal text-gray-500">{unit}</span>
    </span>
  </div>
)

const RobotHUD_Minimal = ({ 
  robotState, 
  isMoving, 
  onButtonPress, 
  onButtonRelease, 
  isLoaded, 
  isSocketConnected,
  keysPressed 
}) => {
  // 格式化距离显示
  const formatDistance = (dist) => {
    if (dist <= 0) return '--'
    return dist.toFixed(1)
  }

  return (
    <div className="absolute inset-0 pointer-events-none p-6 flex flex-col justify-between font-sans bg-black/20">
      {/* 顶部栏：关键状态 */}
      <div className="flex justify-between items-start pointer-events-auto">
        {/* 左上：系统状态 */}
        <div className="bg-gray-900/90 border border-gray-700 p-4 rounded-lg shadow-lg flex gap-6 backdrop-blur-sm">
          <div className="flex items-center gap-3 border-r border-gray-700 pr-6">
            {isSocketConnected ? <Wifi size={24} className="text-emerald-500" /> : <WifiOff size={24} className="text-red-500" />}
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-gray-500 uppercase">LINK STATUS</span>
              <span className={`text-sm font-bold ${isSocketConnected ? 'text-emerald-500' : 'text-red-500'}`}>
                {isSocketConnected ? 'ONLINE' : 'OFFLINE'}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Battery size={24} className={robotState.battery < 20 ? 'text-red-500' : 'text-gray-300'} />
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-gray-500 uppercase">BATTERY</span>
              <span className={`text-sm font-bold ${robotState.battery < 20 ? 'text-red-500' : 'text-gray-300'}`}>
                {robotState.battery.toFixed(0)}%
              </span>
            </div>
          </div>
        </div>

        {/* 中上：环境数据 */}
        <div className="bg-gray-900/90 border border-gray-700 p-3 rounded-lg shadow-lg flex gap-8 px-6 backdrop-blur-sm">
          <DataItem 
            label="TEMP" 
            value={robotState.temperature.toFixed(1)} 
            unit="°C" 
            alert={robotState.temperature > 35}
          />
          <DataItem 
            label="TOXIN" 
            value={(robotState.gasLevel * 100).toFixed(0)} 
            unit="%" 
            alert={robotState.gasLevel > 0.5}
          />
          <DataItem 
            label="VISIBILITY" 
            value={(robotState.visibility * 100).toFixed(0)} 
            unit="%" 
            alert={robotState.visibility < 0.4}
          />
        </div>

        {/* 右上：生命体征探测 (高优先级) */}
        <div className={`
          border rounded-lg p-4 shadow-lg transition-all duration-300 backdrop-blur-sm
          ${robotState.isPersonDetected 
            ? 'bg-red-900/90 border-red-500 text-white scale-110' 
            : 'bg-gray-900/90 border-gray-700 text-gray-300'
          }
        `}>
          <div className="flex items-center gap-4">
            <div className={`p-2 rounded-full ${robotState.isPersonDetected ? 'bg-white/20' : 'bg-gray-800'}`}>
              <User size={24} className={robotState.isPersonDetected ? 'text-white' : 'text-gray-500'} />
            </div>
            <div className="flex flex-col">
              <span className={`text-[10px] font-bold uppercase ${robotState.isPersonDetected ? 'text-white/80' : 'text-gray-500'}`}>
                LIFE SIGN DETECTOR
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-mono font-bold">
                  {robotState.isPersonDetected ? formatDistance(robotState.distanceToNpc) : '--'}
                </span>
                <span className={`text-xs font-bold ${robotState.isPersonDetected ? 'text-white/80' : 'text-gray-500'}`}>METERS</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 底部栏：操作区 */}
      <div className="flex justify-between items-end pointer-events-auto pb-4">
        {/* 左下：物资控制 */}
        <div className="bg-gray-900/90 border border-gray-700 p-4 rounded-lg shadow-lg space-y-3 backdrop-blur-sm">
          <div className="text-[10px] font-bold text-gray-500 uppercase border-b border-gray-700 pb-1 mb-2">SUPPLY DROP</div>
          <div className="flex gap-3">
            <div className="flex flex-col gap-1">
              <MinimalButton 
                label={`WATER (${robotState.waterCount})`}
                icon={Droplet}
                onClick={() => onButtonPress('place_water')}
                disabled={!isLoaded || robotState.waterCount <= 0}
                shortcut="1"
              />
            </div>
            <div className="flex flex-col gap-1">
              <MinimalButton 
                label={`FOOD (${robotState.foodCount})`}
                icon={Package}
                onClick={() => onButtonPress('place_food')}
                disabled={!isLoaded || robotState.foodCount <= 0}
                shortcut="2"
              />
            </div>
          </div>
        </div>

        {/* 中下：位置与方向 */}
        <div className="flex flex-col items-center gap-4">
          {/* 坐标显示 */}
          <div className="bg-black/80 text-gray-300 px-4 py-1 rounded-full text-xs font-mono font-bold tracking-wider border border-gray-800">
            POS: {robotState.position.x.toFixed(1)}, {robotState.position.z.toFixed(1)}
          </div>
          
          {/* 方向键 */}
          <div className="bg-gray-900/80 p-3 rounded-xl border border-gray-700 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-2">
              <button 
                className={`w-12 h-12 rounded border flex items-center justify-center transition-colors relative
                  ${isMoving.forward || keysPressed['W'] 
                    ? 'bg-gray-200 text-black border-white' 
                    : 'bg-gray-800 text-gray-400 border-gray-600'}`}
                onMouseDown={() => onButtonPress('forward')}
                onMouseUp={() => onButtonRelease('forward')}
              >
                <ArrowUp size={20} />
                <span className="absolute top-0.5 right-1 text-[8px] opacity-50">W</span>
              </button>
              <div className="flex gap-2">
                <button 
                  className={`w-12 h-12 rounded border flex items-center justify-center transition-colors relative
                    ${isMoving.left || keysPressed['A'] 
                      ? 'bg-gray-200 text-black border-white' 
                      : 'bg-gray-800 text-gray-400 border-gray-600'}`}
                  onMouseDown={() => onButtonPress('left')}
                  onMouseUp={() => onButtonRelease('left')}
                >
                  <ArrowLeft size={20} />
                  <span className="absolute top-0.5 right-1 text-[8px] opacity-50">A</span>
                </button>
                <button 
                  className={`w-12 h-12 rounded border flex items-center justify-center transition-colors relative
                    ${isMoving.back || keysPressed['S'] 
                      ? 'bg-gray-200 text-black border-white' 
                      : 'bg-gray-800 text-gray-400 border-gray-600'}`}
                  onMouseDown={() => onButtonPress('back')}
                  onMouseUp={() => onButtonRelease('back')}
                >
                  <ArrowDown size={20} />
                  <span className="absolute top-0.5 right-1 text-[8px] opacity-50">S</span>
                </button>
                <button 
                  className={`w-12 h-12 rounded border flex items-center justify-center transition-colors relative
                    ${isMoving.right || keysPressed['D'] 
                      ? 'bg-gray-200 text-black border-white' 
                      : 'bg-gray-800 text-gray-400 border-gray-600'}`}
                  onMouseDown={() => onButtonPress('right')}
                  onMouseUp={() => onButtonRelease('right')}
                >
                  <ArrowRight size={20} />
                  <span className="absolute top-0.5 right-1 text-[8px] opacity-50">D</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 右下：视觉辅助 */}
        <div className="bg-gray-900/90 border border-gray-700 p-4 rounded-lg shadow-lg space-y-3 backdrop-blur-sm">
          <div className="text-[10px] font-bold text-gray-500 uppercase border-b border-gray-700 pb-1 mb-2">VISION SYSTEM</div>
          <div className="flex flex-col gap-2">
            <MinimalButton 
              label={robotState.isFlashlightOn ? "FLASHLIGHT: ON" : "FLASHLIGHT: OFF"}
              icon={Flashlight}
              active={robotState.isFlashlightOn}
              onClick={() => onButtonPress('toggle_flashlight')}
              shortcut="M"
            />
            <MinimalButton 
              label={robotState.isNightvisionOn ? "NIGHT VISION: ON" : "NIGHT VISION: OFF"}
              icon={Eye}
              active={robotState.isNightvisionOn}
              onClick={() => onButtonPress('toggle_nightvision')}
              color="red"
              shortcut="N"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default RobotHUD_Minimal
