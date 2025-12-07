// 数据计算和格式化工具

export const formatTemperature = (temp) => {
  return temp.toFixed(1) + '°C'
}

export const formatPercentage = (value) => {
  return Math.round(value * 100) + '%'
}

export const getTemperatureStatus = (temp) => {
  if (temp < 25) return { label: '正常(冷)', color: 'rescue-blue' }
  if (temp < 30) return { label: '正常', color: 'rescue-green' }
  if (temp < 35) return { label: '升高', color: 'rescue-yellow' }
  return { label: '危险', color: 'rescue-red' }
}

export const getGasQualityStatus = (level) => {
  if (level < 0.3) return { label: '优秀', color: 'rescue-green' }
  if (level < 0.6) return { label: '良好', color: 'rescue-blue' }
  if (level < 0.8) return { label: '一般', color: 'rescue-yellow' }
  return { label: '危险', color: 'rescue-red' }
}

export const getBatteryStatus = (battery) => {
  if (battery > 70) return { label: '充足', color: 'rescue-green' }
  if (battery > 50) return { label: '良好', color: 'rescue-blue' }
  if (battery > 20) return { label: '低电', color: 'rescue-yellow' }
  return { label: '极低', color: 'rescue-red' }
}

export const calculateBatteryDrain = (isMoving, hasToolActive) => {
  let drain = 0.05 // 基础耗电
  if (isMoving) drain += 0.1
  if (hasToolActive) drain += 0.05
  return drain
}

export const getVisibilityWarning = (visibility) => {
  if (visibility < 0.3) return '危险：能见度极低'
  if (visibility < 0.5) return '警告：能见度过低'
  return null
}
