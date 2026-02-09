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
  lastMiningTime: { type: Date },
  lastStaminaUpdate: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Player', playerSchema);