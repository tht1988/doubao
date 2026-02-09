const express = require('express');
const router = express.Router();
const Player = require('../models/Player');
const InventoryManager = require('../utils/inventoryManager');

// 获取玩家信息
router.get('/profile', async (req, res) => {
  try {
    const playerId = req.playerId;
    
    const player = await Player.findById(playerId).select('-password');
    if (!player) {
      return res.status(404).json({ error: '玩家不存在' });
    }
    
    res.json({
      success: true,
      player
    });
  } catch (err) {
    console.error('获取玩家信息错误:', err);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 获取玩家背包
router.get('/inventory', async (req, res) => {
  try {
    const playerId = req.playerId;
    
    const player = await Player.findById(playerId).populate('inventory.itemId');
    if (!player) {
      return res.status(404).json({ error: '玩家不存在' });
    }
    
    res.json({
      success: true,
      inventory: player.inventory
    });
  } catch (err) {
    console.error('获取玩家背包错误:', err);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 获取玩家装备
router.get('/equipment', async (req, res) => {
  try {
    const playerId = req.playerId;
    
    const player = await Player.findById(playerId).populate('equipment.weapon equipment.armor equipment.helmet equipment.accessory');
    if (!player) {
      return res.status(404).json({ error: '玩家不存在' });
    }
    
    res.json({
      success: true,
      equipment: player.equipment
    });
  } catch (err) {
    console.error('获取玩家装备错误:', err);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 装备物品
router.post('/equip', async (req, res) => {
  try {
    const { itemId } = req.body;
    const playerId = req.playerId;
    
    const player = await Player.findById(playerId).populate('inventory.itemId equipment.weapon equipment.armor equipment.helmet equipment.accessory');
    
    // 检查物品是否在背包中
    const itemIndex = player.inventory.findIndex(i => i.itemId && i.itemId._id.equals(itemId));
    if (itemIndex === -1) {
      return res.status(400).json({ error: '物品不存在于背包中' });
    }
    
    const item = player.inventory[itemIndex].itemId;
    
    // 检查物品类型
    let equipmentType = '';
    switch (item.type) {
      case 'weapon':
        equipmentType = 'weapon';
        break;
      case 'armor':
        equipmentType = 'armor';
        break;
      case 'helmet':
        equipmentType = 'helmet';
        break;
      case 'accessory':
        equipmentType = 'accessory';
        break;
      default:
        return res.status(400).json({ error: '该物品不可装备' });
    }
    
    // 检查装备需求等级
    if (player.level < item.requiredLevel) {
      return res.status(400).json({ error: `需要等级 ${item.requiredLevel} 才能装备` });
    }
    
    // 卸下当前装备
    const currentEquipment = player.equipment[equipmentType];
    if (currentEquipment) {
      // 将当前装备放回背包
      InventoryManager.addItem(player.inventory, currentEquipment, 1);
    }
    
    // 装备新物品
    player.equipment[equipmentType] = itemId;
    
    // 从背包移除新装备
    InventoryManager.removeItem(player.inventory, itemId, 1);
    
    // 自动整理背包
    InventoryManager.sortInventory(player.inventory);
    
    await player.save();
    
    res.json({
      success: true,
      message: `成功装备 ${item.name}`,
      equipment: player.equipment,
      inventory: player.inventory
    });
  } catch (err) {
    console.error('装备物品错误:', err);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 卸下装备
router.post('/unequip', async (req, res) => {
  try {
    const { equipmentType } = req.body;
    const playerId = req.playerId;
    
    // 验证装备类型
    const validTypes = ['weapon', 'armor', 'helmet', 'accessory'];
    if (!validTypes.includes(equipmentType)) {
      return res.status(400).json({ error: '无效的装备类型' });
    }
    
    const player = await Player.findById(playerId).populate(`equipment.${equipmentType}`);
    
    // 检查是否有装备
    const equippedItem = player.equipment[equipmentType];
    if (!equippedItem) {
      return res.status(400).json({ error: '该装备栏未装备任何物品' });
    }
    
    // 将装备放回背包
    InventoryManager.addItem(player.inventory, equippedItem, 1);
    
    // 卸下装备
    player.equipment[equipmentType] = null;
    
    // 自动整理背包
    InventoryManager.sortInventory(player.inventory);
    
    await player.save();
    
    res.json({
      success: true,
      message: `成功卸下装备`,
      equipment: player.equipment,
      inventory: player.inventory
    });
  } catch (err) {
    console.error('卸下装备错误:', err);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 整理背包
router.post('/inventory/sort', async (req, res) => {
  try {
    const playerId = req.playerId;
    
    const player = await Player.findById(playerId);
    if (!player) {
      return res.status(404).json({ error: '玩家不存在' });
    }
    
    // 自动整理背包
    InventoryManager.sortInventory(player.inventory);
    
    await player.save();
    
    res.json({
      success: true,
      message: '背包整理完成',
      inventory: player.inventory
    });
  } catch (err) {
    console.error('整理背包错误:', err);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 合并临时背包到主背包
router.post('/inventory/merge-temp', async (req, res) => {
  try {
    const playerId = req.playerId;
    
    const player = await Player.findById(playerId);
    if (!player) {
      return res.status(404).json({ error: '玩家不存在' });
    }
    
    // 合并临时背包到主背包
    InventoryManager.mergeTempInventory(player.inventory, player.tempInventory);
    
    // 自动整理背包
    InventoryManager.sortInventory(player.inventory);
    
    await player.save();
    
    res.json({
      success: true,
      message: '临时背包已合并',
      inventory: player.inventory
    });
  } catch (err) {
    console.error('合并临时背包错误:', err);
    res.status(500).json({ error: '服务器错误' });
  }
});

module.exports = router;