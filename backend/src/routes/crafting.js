const express = require('express');
const router = express.Router();
const Player = require('../models/Player');
const Item = require('../models/Item');
const InventoryManager = require('../utils/inventoryManager');

// 熔炼材料
router.post('/smelt', async (req, res) => {
  try {
    const { itemId, amount } = req.body;
    const playerId = req.playerId;
    
    const player = await Player.findById(playerId).populate('inventory.itemId');
    const item = await Item.findById(itemId);
    
    // 验证
    if (!item || !item.recipe) {
      return res.status(400).json({ error: '无法熔炼此物品' });
    }
    
    // 检查材料是否足够
    const inputItem = player.inventory.find(i => i.itemId && i.itemId._id.equals(item._id));
    if (!inputItem || inputItem.quantity < amount) {
      return res.status(400).json({ error: '材料不足' });
    }
    
    // 执行熔炼 - 移除材料
    InventoryManager.removeItem(player.inventory, item._id, amount);
    
    // 添加成品
    const outputItem = await Item.findById(item.recipe.materials[0].itemId);
    InventoryManager.addItem(player.inventory, outputItem, amount);
    
    // 增加经验
    player.craftingLevel += (item.recipe.xp * amount) / 100;
    
    await player.save();
    
    res.json({
      success: true,
      message: `成功熔炼 ${amount} 份 ${outputItem.name}`,
      inventory: player.inventory,
      craftingLevel: player.craftingLevel
    });
  } catch (err) {
    console.error('熔炼错误:', err);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 锻造物品
router.post('/forge', async (req, res) => {
  try {
    const { itemId } = req.body;
    const playerId = req.playerId;
    
    const player = await Player.findById(playerId).populate('inventory.itemId');
    const item = await Item.findById(itemId).populate('recipe.materials.itemId');
    
    // 验证
    if (!item || !item.craftable) {
      return res.status(400).json({ error: '无法锻造此物品' });
    }
    if (player.craftingLevel < item.requiredLevel) {
      return res.status(400).json({ error: '炼器等级不足' });
    }
    
    // 检查材料
    for (const material of item.recipe.materials) {
      const playerMaterial = player.inventory.find(i => i.itemId && i.itemId._id.equals(material.itemId._id));
      if (!playerMaterial || playerMaterial.quantity < material.quantity) {
        return res.status(400).json({ 
          error: `材料不足: 需要 ${material.quantity} ${material.itemId.name}`
        });
      }
    }
    
    // 消耗材料
    for (const material of item.recipe.materials) {
      InventoryManager.removeItem(player.inventory, material.itemId._id, material.quantity);
    }
    
    // 决定锻造结果品质
    const rarityRoll = Math.random() * 100;
    let resultRarity = 'common';
    
    if (rarityRoll > 95) {
      resultRarity = 'legendary';
    } else if (rarityRoll > 80) {
      resultRarity = 'epic';
    } else if (rarityRoll > 50) {
      resultRarity = 'rare';
    } else if (rarityRoll > 20) {
      resultRarity = 'uncommon';
    }
    
    // 创建成品
    const forgedItem = await Item.create({
      name: `${item.name} (${resultRarity})`,
      type: item.type,
      rarity: resultRarity,
      stats: generateItemStats(item.type, resultRarity),
      value: calculateItemValue(item.value, resultRarity),
      requiredLevel: item.requiredLevel
    });
    
    // 添加到玩家背包
    InventoryManager.addItem(player.inventory, forgedItem, 1);
    
    // 增加经验
    player.craftingLevel += item.recipe.xp / 100;
    
    await player.save();
    
    res.json({
      success: true,
      message: `成功锻造 ${forgedItem.name}`,
      item: forgedItem,
      inventory: player.inventory,
      craftingLevel: player.craftingLevel
    });
  } catch (err) {
    console.error('锻造错误:', err);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 辅助函数 - 生成物品属性
function generateItemStats(type, rarity) {
  const stats = new Map();
  // 根据类型和品质生成属性...
  return Object.fromEntries(stats);
}

// 辅助函数 - 计算物品价值
function calculateItemValue(baseValue, rarity) {
  const multipliers = {
    common: 1,
    uncommon: 2,
    rare: 5,
    epic: 10,
    legendary: 20
  };
  return baseValue * multipliers[rarity];
}

module.exports = router;