const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const questSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  type: { type: String, enum: ['daily', 'random', 'bounty'], required: true },
  requirements: [{
    itemId: { type: Schema.Types.ObjectId, ref: 'Item' },
    quantity: { type: Number },
    type: { type: String }, // 例如: weapon, armor
    rarity: { type: String } // 例如: uncommon, rare
  }],
  rewards: {
    gold: { type: Number, default: 0 },
    experience: { type: Number, default: 0 },
    craftingXp: { type: Number, default: 0 },
    miningXp: { type: Number, default: 0 },
    items: [{ type: Schema.Types.ObjectId, ref: 'Item' }],
    unlock: { type: String } // 例如: silver_mine_access
  },
  requiredLevel: { type: Number, default: 1 },
  active: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Quest', questSchema);