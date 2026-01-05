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
  ArrowRight
} from 'lucide-react'

const MinimalButton = ({ onClick, disabled, active, label, icon: Icon }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`
      flex items-center justify-center gap-2 px-4 py-3 rounded border transition-colors
      ${disabled 
        ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' 
        : active
          ? 'bg-black text-white border-black'
          : 'bg-white text-black border-gray-300 hover:bg-gray-50'
      }
    `}
  >
    {Icon && <Icon size={18} />}
    <span className="font-medium text-sm">{label}</span>
  </button>
)

const InfoCard = ({ title, children }) => (
  <div className="bg-white/90 p-4 rounded-lg border border-gray-200 shadow-sm backdrop-blur-sm">
    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{title}</h3>
    {children}
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
    return `${dist.toFixed(1)}m`
  }

  return (
    <div className="absolute inset-0 pointer-events-none p-6 flex flex-col justify-between text-gray-800 font-sans">
      {/* 顶部栏：状态概览 */}
      <div className="flex justify-between items-start pointer-events-auto">
        <div className="flex gap-4">
          <InfoCard title="系统状态">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                {isSocketConnected ? <Wifi size={16} className="text-green-600" /> : <WifiOff size={16} className="text-red-500" />}
                <span className="text-sm font-medium">{isSocketConnected ? '在线' : '离线'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Battery size={16} className={robotState.battery < 20 ? 'text-red-500' : 'text-black'} />
                <span className="text-sm font-medium">{robotState.battery}%</span>
              </div>
            </div>
          </InfoCard>

          <InfoCard title="位置信息">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-sm">
                <MapPin size={14} />
                <span>X: {robotState.position.x.toFixed(1)}</span>
                <span>Z: {robotState.position.z.toFixed(1)}</span>
              </div>
            </div>
          </InfoCard>
        </div>

        {/* 任务目标 */}
        <InfoCard title="生命体征探测">
          <div className="flex items-center gap-3 min-w-[200px]">
            <div className={`p-2 rounded-full ${robotState.isPersonDetected ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-400'}`}>
              <User size={20} />
            </div>
            <div>
              <div className="text-sm font-bold">
                {robotState.isPersonDetected ? '检测到信号' : '搜索中...'}
              </div>
              <div className="text-xs text-gray-500">
                距离: <span className="font-mono text-base font-bold text-black">{formatDistance(robotState.distanceToNpc)}</span>
              </div>
            </div>
          </div>
        </InfoCard>
      </div>

      {/* 底部栏：控制与物资 */}
      <div className="flex justify-between items-end pointer-events-auto">
        {/* 左侧：物资投放 */}
        <InfoCard title="物资投放">
          <div className="flex gap-2">
            <div className="flex flex-col gap-2">
              <MinimalButton 
                label={`投放水 (${robotState.waterCount})`}
                icon={Package}
                onClick={() => onButtonPress('place_water')}
                disabled={!isLoaded || robotState.waterCount <= 0}
              />
              <MinimalButton 
                label={`投放食物 (${robotState.foodCount})`}
                icon={Package}
                onClick={() => onButtonPress('place_food')}
                disabled={!isLoaded || robotState.foodCount <= 0}
              />
            </div>
          </div>
        </InfoCard>

        {/* 中间：方向控制 (仅移动端或备用) */}
        <div className="flex flex-col items-center gap-2 mb-4">
          <button 
            className={`p-4 rounded bg-white border border-gray-300 shadow-sm active:bg-gray-100 ${isMoving.forward || keysPressed['W'] ? 'bg-gray-200' : ''}`}
            onMouseDown={() => onButtonPress('forward')}
            onMouseUp={() => onButtonRelease('forward')}
            onTouchStart={() => onButtonPress('forward')}
            onTouchEnd={() => onButtonRelease('forward')}
          >
            <ArrowUp size={24} />
          </button>
          <div className="flex gap-2">
            <button 
              className={`p-4 rounded bg-white border border-gray-300 shadow-sm active:bg-gray-100 ${isMoving.left || keysPressed['A'] ? 'bg-gray-200' : ''}`}
              onMouseDown={() => onButtonPress('left')}
              onMouseUp={() => onButtonRelease('left')}
              onTouchStart={() => onButtonPress('left')}
              onTouchEnd={() => onButtonRelease('left')}
            >
              <ArrowLeft size={24} />
            </button>
            <button 
              className={`p-4 rounded bg-white border border-gray-300 shadow-sm active:bg-gray-100 ${isMoving.back || keysPressed['S'] ? 'bg-gray-200' : ''}`}
              onMouseDown={() => onButtonPress('back')}
              onMouseUp={() => onButtonRelease('back')}
              onTouchStart={() => onButtonPress('back')}
              onTouchEnd={() => onButtonRelease('back')}
            >
              <ArrowDown size={24} />
            </button>
            <button 
              className={`p-4 rounded bg-white border border-gray-300 shadow-sm active:bg-gray-100 ${isMoving.right || keysPressed['D'] ? 'bg-gray-200' : ''}`}
              onMouseDown={() => onButtonPress('right')}
              onMouseUp={() => onButtonRelease('right')}
              onTouchStart={() => onButtonPress('right')}
              onTouchEnd={() => onButtonRelease('right')}
            >
              <ArrowRight size={24} />
            </button>
          </div>
        </div>

        {/* 右侧：工具控制 */}
        <InfoCard title="辅助工具">
          <div className="flex flex-col gap-2">
            <MinimalButton 
              label={robotState.isFlashlightOn ? "关闭手电" : "开启手电"}
              icon={Flashlight}
              active={robotState.isFlashlightOn}
              onClick={() => onButtonPress('toggle_flashlight')}
            />
            <MinimalButton 
              label={robotState.isNightvisionOn ? "关闭夜视" : "开启夜视"}
              icon={Eye}
              active={robotState.isNightvisionOn}
              onClick={() => onButtonPress('toggle_nightvision')}
            />
          </div>
        </InfoCard>
      </div>
    </div>
  )
}

export default RobotHUD_Minimal
