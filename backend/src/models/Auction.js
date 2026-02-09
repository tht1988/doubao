const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const auctionSchema = new Schema({
  item: { type: Schema.Types.ObjectId, ref: 'Item', required: true },
  seller: { type: Schema.Types.ObjectId, ref: 'Player', required: true },
  price: { type: Number, required: true },
  expiresAt: { type: Date, required: true },
  status: { type: String, enum: ['active', 'sold', 'expired'], default: 'active' },
  buyer: { type: Schema.Types.ObjectId, ref: 'Player' }
}, { timestamps: true });

module.exports = mongoose.model('Auction', auctionSchema);