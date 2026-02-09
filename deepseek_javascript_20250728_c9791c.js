const Player = require('../models/Player');
const Item = require('../models/Item');

// 矿脉定义
const MINES = {
  copper: {
    name: '铜矿脉',
    levelReq: 1,
    staminaCost: 5,
    items: [
      { itemId: '铜矿石ID', chance: 80 },
      { itemId: '锡矿石ID', chance: 20 },
      { itemId: '下品灵石ID', chance: 5 }
    ]
  },
  // 其他矿脉...
};

// 挖矿逻辑
exports.mine = async (req, res) => {
  try {
    const { mineType } = req.body;
    const playerId = req.playerId; // 从认证中间件获取
    
    const player = await Player.findById(playerId);
    const mine = MINES[mineType];
    
    // 验证
    if (!mine) return res.status(400).json({ error: '无效的矿脉类型' });
    if (player.miningLevel < mine.levelReq) {
      return res.status(400).json({ error: `需要挖矿等级 ${mine.levelReq}` });
    }
    if (player.stamina < mine.staminaCost) {
      return res.status(400).json({ error: '体力不足' });
    }
    
    // 更新玩家状态
    player.stamina -= mine.staminaCost;
    player.lastMiningTime = new Date();
    
    // 挖矿结果
    const obtainedItems = [];
    for (const mineItem of mine.items) {
      if (Math.random() * 100 < mineItem.chance) {
        const item = await Item.findById(mineItem.itemId);
        if (!item) continue;
        
        // 添加到玩家背包
        const existingItem = player.inventory.find(i => i.itemId.equals(mineItem.itemId));
        if (existingItem) {
          existingItem.quantity++;
        } else {
          player.inventory.push({
            itemId: mineItem.itemId,
            quantity: 1
          });
        }
        
        obtainedItems.push(item.name);
      }
    }
    
    await player.save();
    
    res.json({
      success: true,
      stamina: player.stamina,
      obtainedItems,
      message: obtainedItems.length > 0 
        ? `挖矿获得: ${obtainedItems.join(', ')}`
        : '这次挖矿没有收获...'
    });
  } catch (err) {
    console.error('挖矿错误:', err);
    res.status(500).json({ error: '服务器错误' });
  }
};