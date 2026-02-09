const express = require('express');
const router = express.Router();
const Player = require('../models/Player');
const Item = require('../models/Item');
const MiningManager = require('../utils/miningManager');

// 单次挖矿逻辑
router.post('/mine', async (req, res) => {
  try {
    const { mineType } = req.body;
    const playerId = req.playerId; // 从认证中间件获取
    
    const player = await Player.findById(playerId);
    
    // 执行单次采矿
    const result = await MiningManager.performMining(player, mineType, Item);
    
    await player.save();
    
    res.json({
      success: true,
      stamina: result.stamina,
      obtainedItems: result.obtainedItems,
      message: result.obtainedItems.length > 0 
        ? `挖矿获得: ${result.obtainedItems.join(', ')}`
        : '这次挖矿没有收获...'
    });
  } catch (err) {
    console.error('挖矿错误:', err);
    res.status(400).json({ error: err.message || '服务器错误' });
  }
});

// 开始连续采矿
router.post('/continuous/start', async (req, res) => {
  try {
    const { mineType } = req.body;
    const playerId = req.playerId;
    
    const player = await Player.findById(playerId);
    
    // 开始连续采矿
    const result = MiningManager.startContinuousMining(player, mineType);
    
    await player.save();
    
    res.json(result);
  } catch (err) {
    console.error('开始连续采矿错误:', err);
    res.status(400).json({ error: err.message || '服务器错误' });
  }
});

// 停止连续采矿
router.post('/continuous/stop', async (req, res) => {
  try {
    const playerId = req.playerId;
    
    const player = await Player.findById(playerId);
    
    // 停止连续采矿
    const result = MiningManager.stopContinuousMining(player);
    
    await player.save();
    
    res.json(result);
  } catch (err) {
    console.error('停止连续采矿错误:', err);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 检查连续采矿状态并计算收益
router.get('/continuous/check', async (req, res) => {
  try {
    const playerId = req.playerId;
    
    const player = await Player.findById(playerId);
    
    // 验证采矿状态
    MiningManager.validateMiningState(player);
    
    // 计算连续采矿收益
    const result = await MiningManager.calculateContinuousMining(player, Item);
    
    await player.save();
    
    res.json(result);
  } catch (err) {
    console.error('检查连续采矿错误:', err);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 计算离线采矿收益
router.get('/offline/check', async (req, res) => {
  try {
    const playerId = req.playerId;
    
    const player = await Player.findById(playerId);
    
    // 计算离线采矿收益
    const result = await MiningManager.calculateOfflineMining(player, Item);
    
    await player.save();
    
    res.json(result);
  } catch (err) {
    console.error('计算离线采矿错误:', err);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 设置离线采矿配置
router.post('/offline/settings', async (req, res) => {
  try {
    const { enabled, mineType } = req.body;
    const playerId = req.playerId;
    
    const player = await Player.findById(playerId);
    
    // 更新离线采矿配置
    if (enabled !== undefined) {
      player.offlineMiningEnabled = enabled;
    }
    if (mineType) {
      // 验证矿脉类型
      if (!MiningManager.MINES[mineType]) {
        return res.status(400).json({ error: '无效的矿脉类型' });
      }
      player.offlineMiningType = mineType;
    }
    
    await player.save();
    
    res.json({
      success: true,
      message: '离线采矿配置已更新',
      offlineMiningEnabled: player.offlineMiningEnabled,
      offlineMiningType: player.offlineMiningType
    });
  } catch (err) {
    console.error('设置离线采矿错误:', err);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 获取采矿状态
router.get('/status', async (req, res) => {
  try {
    const playerId = req.playerId;
    
    const player = await Player.findById(playerId);
    
    // 验证采矿状态
    MiningManager.validateMiningState(player);
    
    await player.save();
    
    res.json({
      success: true,
      miningStatus: {
        isContinuousMining: player.isContinuousMining,
        continuousMiningType: player.continuousMiningType,
        continuousMiningStartTime: player.continuousMiningStartTime,
        offlineMiningEnabled: player.offlineMiningEnabled,
        offlineMiningType: player.offlineMiningType,
        lastOfflineCheckTime: player.lastOfflineCheckTime,
        stamina: player.stamina,
        maxStamina: player.maxStamina,
        lastStaminaUpdate: player.lastStaminaUpdate
      }
    });
  } catch (err) {
    console.error('获取采矿状态错误:', err);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 获取矿脉信息
router.get('/mines', (req, res) => {
  try {
    res.json({
      success: true,
      mines: MiningManager.MINES
    });
  } catch (err) {
    console.error('获取矿脉信息错误:', err);
    res.status(500).json({ error: '服务器错误' });
  }
});

module.exports = router;