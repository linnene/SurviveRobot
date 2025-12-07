/**
 * Socket 消息类型定义
 */

// 主题类型
export const TOPICS = {
  PLAYER_STATUS: 'player_status',
  ACTION: 'action',
  ACTION_RESULT: 'action_result',
  ERROR: 'error',
  HEARTBEAT: 'heartbeat',
}

// 操作类型
export const ACTIONS = {
  PLACE_ITEM: 'place_item',
}

// 物品类型
export const ITEM_TYPES = {
  WATER: 'water',
  FOOD: 'food',
}

// 错误代码
export const ERROR_CODES = {
  INSUFFICIENT_ITEM: 'INSUFFICIENT_ITEM',
  INVALID_ITEM: 'INVALID_ITEM',
  CAPACITY_EXCEEDED: 'CAPACITY_EXCEEDED',
  BAD_REQUEST: 'BAD_REQUEST',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
}

/**
 * 玩家状态消息
 * @typedef {Object} PlayerStatusMessage
 * @property {string} timestamp - ISO 8601 时间戳
 * @property {string} playerId - 玩家 ID
 * @property {string} npcId - 最近 NPC ID
 * @property {number} distanceToNpc - 与 NPC 距离（米）
 * @property {Object} inventory - 背包信息
 * @property {number} inventory.capacity - 容量上限
 * @property {number} inventory.used - 已用容量
 * @property {Array} inventory.items - 物品列表
 * @property {Object} position - 位置信息（可选）
 * @property {number} cameraYaw - 相机偏航角（可选）
 * @property {number} cameraPitch - 相机俯仰角（可选）
 */

/**
 * 操作指令消息
 * @typedef {Object} ActionMessage
 * @property {string} action - 操作类型
 * @property {string} itemType - 物品类型
 * @property {number} count - 数量
 */

/**
 * 操作结果消息
 * @typedef {Object} ActionResultMessage
 * @property {string} action - 操作类型
 * @property {string} status - 状态（ok）
 * @property {Object} remaining - 剩余物品数量
 */

/**
 * 错误消息
 * @typedef {Object} ErrorMessage
 * @property {string} code - 错误代码
 * @property {string} message - 错误描述
 * @property {string} correlationId - 关联 ID（可选）
 */

/**
 * 创建操作消息
 */
export function createActionMessage(action, itemType, count = 1) {
  return {
    topic: TOPICS.ACTION,
    body: {
      action,
      itemType,
      count,
    },
  }
}

/**
 * 创建放置物品消息
 */
export function createPlaceItemMessage(itemType, count = 1) {
  return createActionMessage(ACTIONS.PLACE_ITEM, itemType, count)
}

/**
 * 解析玩家状态
 */
export function parsePlayerStatus(data) {
  return {
    timestamp: data.timestamp,
    playerId: data.playerId,
    npcId: data.npcId,
    distanceToNpc: data.distanceToNpc,
    inventory: {
      capacity: data.inventory.capacity,
      used: data.inventory.used,
      items: data.inventory.items.reduce((acc, item) => {
        acc[item.type] = item.count
        return acc
      }, {}),
    },
    position: data.position || { x: 0, y: 0, z: 0 },
    cameraYaw: data.cameraYaw || 0,
    cameraPitch: data.cameraPitch || 0,
  }
}

/**
 * 格式化错误消息
 */
export function formatError(errorData) {
  const errorMessages = {
    [ERROR_CODES.INSUFFICIENT_ITEM]: '物品数量不足',
    [ERROR_CODES.INVALID_ITEM]: '无效的物品类型',
    [ERROR_CODES.CAPACITY_EXCEEDED]: '背包容量已满',
    [ERROR_CODES.BAD_REQUEST]: '请求格式错误',
    [ERROR_CODES.INTERNAL_ERROR]: '服务器内部错误',
  }

  return {
    code: errorData.code,
    message: errorMessages[errorData.code] || errorData.message || '未知错误',
    details: errorData.message,
    correlationId: errorData.correlationId,
  }
}
