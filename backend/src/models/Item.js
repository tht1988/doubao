const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const itemSchema = new Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['material', 'weapon', 'armor', 'helmet', 'accessory', 'blueprint'], required: true },
  rarity: { type: String, enum: ['common', 'uncommon', 'rare', 'epic', 'legendary'], default: 'common' },
  description: { type: String },
  stats: { type: Map, of: String }, // 动态属性
  value: { type: Number, default: 0 }, // 基础价值
  requiredLevel: { type: Number, default: 1 }, // 使用/装备需求等级
  stackable: { type: Boolean, default: true }, // 是否可堆叠
  craftable: { type: Boolean, default: false }, // 是否可制作
  recipe: { // 制作配方
    materials: [{
      itemId: { type: Schema.Types.ObjectId, ref: 'Item' },
      quantity: { type: Number }
    }],
    xp: { type: Number } // 制作获得的经验
  }
}, { timestamps: true });

module.exports = mongoose.model('Item', itemSchema);