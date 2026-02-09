const express = require('express');
const router = express.Router();
const Auction = require('../models/Auction');
const Player = require('../models/Player');
const Item = require('../models/Item');

// 获取拍卖列表
router.get('/', async (req, res) => {
  try {
    const { type, minLevel, maxLevel, rarity, page = 1, limit = 20 } = req.query;
    
    const query = { expiresAt: { $gt: new Date() }, status: 'active' };
    if (type) query['item.type'] = type;
    if (minLevel) query['item.requiredLevel'] = { $gte: parseInt(minLevel) };
    if (maxLevel) query['item.requiredLevel'] = { $lte: parseInt(maxLevel) };
    if (rarity) query['item.rarity'] = rarity;
    
    const auctions = await Auction.find(query)
      .populate('item')
      .populate('seller', 'username')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      auctions,
      page,
      total: await Auction.countDocuments(query)
    });
  } catch (err) {
    console.error('获取拍卖列表错误:', err);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 上架物品
router.post('/list', async (req, res) => {
  try {
    const { itemId, price, duration = 24 } = req.body;
    const playerId = req.playerId;
    
    const player = await Player.findById(playerId).populate('inventory.itemId');
    const itemIndex = player.inventory.findIndex(i => i.itemId && i.itemId._id.equals(itemId));
    
    if (itemIndex === -1) {
      return res.status(400).json({ error: '物品不存在于背包中' });
    }
    
    // 从玩家背包移除物品
    const [listedItem] = player.inventory.splice(itemIndex, 1);
    
    // 创建拍卖
    const auction = new Auction({
      item: listedItem.itemId._id,
      seller: playerId,
      price: parseInt(price),
      expiresAt: new Date(Date.now() + duration * 60 * 60 * 1000)
    });
    
    await Promise.all([player.save(), auction.save()]);
    
    res.json({
      success: true,
      auction,
      inventory: player.inventory
    });
  } catch (err) {
    console.error('上架物品错误:', err);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 购买物品
router.post('/buy', async (req, res) => {
  try {
    const { auctionId } = req.body;
    const playerId = req.playerId;
    
    const auction = await Auction.findById(auctionId)
      .populate('item')
      .populate('seller');
    
    if (!auction) {
      return res.status(404).json({ error: '拍卖不存在或已过期' });
    }
    if (auction.seller._id.equals(playerId)) {
      return res.status(400).json({ error: '不能购买自己拍卖的物品' });
    }
    if (auction.status !== 'active') {
      return res.status(400).json({ error: '该物品已被售出或拍卖已过期' });
    }
    
    const buyer = await Player.findById(playerId);
    const seller = await Player.findById(auction.seller._id);
    
    // 检查金币是否足够
    if (buyer.gold < auction.price) {
      return res.status(400).json({ error: '金币不足' });
    }
    
    // 交易
    buyer.gold -= auction.price;
    seller.gold += auction.price * 0.9; // 10% 手续费
    
    // 添加物品到买家背包
    buyer.inventory.push({
      itemId: auction.item._id,
      quantity: 1
    });
    
    // 更新拍卖状态
    auction.status = 'sold';
    auction.buyer = playerId;
    
    // 保存更改
    await Promise.all([
      buyer.save(),
      seller.save(),
      auction.save()
    ]);
    
    res.json({
      success: true,
      gold: buyer.gold,
      inventory: buyer.inventory,
      message: `成功购买 ${auction.item.name}`
    });
  } catch (err) {
    console.error('购买物品错误:', err);
    res.status(500).json({ error: '服务器错误' });
  }
});

module.exports = router;