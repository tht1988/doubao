const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const playerSchema = new Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  level: { type: Number, default: 1 },
  experience: { type: Number, default: 0 },
  gold: { type: Number, default: 100 },
  spiritStones: { type: Number, default: 0 },
  stamina: { type: Number, default: 100 },
  maxStamina: { type: Number, default: 100 },
  miningLevel: { type: Number, default: 1 },
  craftingLevel: { type: Number, default: 1 },
  inventory: [{
    itemId: { type: Schema.Types.ObjectId, ref: 'Item' },
    quantity: { type: Number, default: 1 }
  }],
  maxInventorySize: { type: Number, default: 50 }, // 背包最大容量（物品堆叠数量）
  tempInventory: [{
    itemId: { type: Schema.Types.ObjectId, ref: 'Item' },
    quantity: { type: Number, default: 1 }
  }],
  equipment: {
    weapon: { type: Schema.Types.ObjectId, ref: 'Item' },
    armor: { type: Schema.Types.ObjectId, ref: 'Item' },
    helmet: { type: Schema.Types.ObjectId, ref: 'Item' },
    accessory: { type: Schema.Types.ObjectId, ref: 'Item' }
  },
  activeQuests: [{
    questId: { type: Schema.Types.ObjectId, ref: 'Quest' },
    progress: { type: Number, default: 0 }
  }],
  // 采矿相关字段
  lastMiningTime: { type: Date, default: Date.now },
  lastStaminaUpdate: { type: Date, default: Date.now },
  
  // 连续采矿相关字段
  isContinuousMining: { type: Boolean, default: false },
  continuousMiningType: { type: String },
  continuousMiningStartTime: { type: Date },
  
  // 离线采矿相关字段
  lastOfflineCheckTime: { type: Date, default: Date.now },
  offlineMiningEnabled: { type: Boolean, default: true },
  offlineMiningType: { type: String, default: 'copper' }
}, { timestamps: true });

module.exports = mongoose.model('Player', playerSchema);