const express = require('express');
const router = express.Router();
const Player = require('../models/Player');
const Quest = require('../models/Quest');
const Item = require('../models/Item');

// 获取可用任务列表
router.get('/available', async (req, res) => {
  try {
    const playerId = req.playerId;
    
    const player = await Player.findById(playerId);
    const availableQuests = await Quest.find({
      active: true,
      requiredLevel: { $lte: player.level }
    });
    
    res.json({
      success: true,
      quests: availableQuests
    });
  } catch (err) {
    console.error('获取可用任务错误:', err);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 获取玩家活跃任务
router.get('/active', async (req, res) => {
  try {
    const playerId = req.playerId;
    
    const player = await Player.findById(playerId).populate('activeQuests.questId');
    if (!player) {
      return res.status(404).json({ error: '玩家不存在' });
    }
    
    res.json({
      success: true,
      quests: player.activeQuests
    });
  } catch (err) {
    console.error('获取活跃任务错误:', err);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 接受任务
router.post('/accept/:questId', async (req, res) => {
  try {
    const { questId } = req.params;
    const playerId = req.playerId;
    
    const player = await Player.findById(playerId);
    const quest = await Quest.findById(questId);
    
    if (!quest || !quest.active) {
      return res.status(404).json({ error: '任务不存在或已关闭' });
    }
    
    // 检查任务需求等级
    if (player.level < quest.requiredLevel) {
      return res.status(400).json({ error: `需要等级 ${quest.requiredLevel} 才能接受该任务` });
    }
    
    // 检查是否已接受该任务
    const isAlreadyAccepted = player.activeQuests.some(q => q.questId.equals(questId));
    if (isAlreadyAccepted) {
      return res.status(400).json({ error: '已接受该任务' });
    }
    
    // 添加到活跃任务列表
    player.activeQuests.push({
      questId: quest._id,
      progress: 0
    });
    
    await player.save();
    
    res.json({
      success: true,
      message: `成功接受任务: ${quest.name}`,
      quest: {
        ...quest._doc,
        progress: 0
      }
    });
  } catch (err) {
    console.error('接受任务错误:', err);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 提交任务
router.post('/submit/:questId', async (req, res) => {
  try {
    const { questId } = req.params;
    const playerId = req.playerId;
    
    const player = await Player.findById(playerId).populate('inventory.itemId activeQuests.questId');
    const questIndex = player.activeQuests.findIndex(q => q.questId._id.equals(questId));
    
    if (questIndex === -1) {
      return res.status(400).json({ error: '未接受该任务' });
    }
    
    const activeQuest = player.activeQuests[questIndex];
    const quest = activeQuest.questId;
    
    // 检查任务进度是否满足要求
    // 这里简化处理，实际应该根据任务类型检查不同的条件
    // 例如：收集物品、击败怪物、达到等级等
    let canComplete = true;
    
    for (const requirement of quest.requirements) {
      if (requirement.itemId) {
        // 检查物品需求
        const itemCount = player.inventory.reduce((total, item) => {
          return item.itemId && item.itemId._id.equals(requirement.itemId) ? total + item.quantity : total;
        }, 0);
        
        if (itemCount < requirement.quantity) {
          canComplete = false;
          break;
        }
      } else if (requirement.type && requirement.rarity) {
        // 检查装备品质需求
        const hasRequiredItem = player.inventory.some(item => {
          return item.itemId && item.itemId.type === requirement.type && item.itemId.rarity === requirement.rarity;
        });
        
        if (!hasRequiredItem) {
          canComplete = false;
          break;
        }
      }
    }
    
    if (!canComplete) {
      return res.status(400).json({ error: '任务条件未满足' });
    }
    
    // 消耗任务物品
    for (const requirement of quest.requirements) {
      if (requirement.itemId) {
        let remaining = requirement.quantity;
        let i = 0;
        
        while (remaining > 0 && i < player.inventory.length) {
          const inventoryItem = player.inventory[i];
          if (inventoryItem.itemId && inventoryItem.itemId._id.equals(requirement.itemId)) {
            if (inventoryItem.quantity <= remaining) {
              remaining -= inventoryItem.quantity;
              player.inventory.splice(i, 1);
            } else {
              inventoryItem.quantity -= remaining;
              remaining = 0;
            }
          } else {
            i++;
          }
        }
      }
    }
    
    // 给予任务奖励
    if (quest.rewards.gold) {
      player.gold += quest.rewards.gold;
    }
    if (quest.rewards.experience) {
      player.experience += quest.rewards.experience;
    }
    if (quest.rewards.craftingXp) {
      player.craftingLevel += quest.rewards.craftingXp / 100;
    }
    if (quest.rewards.miningXp) {
      player.miningLevel += quest.rewards.miningXp / 100;
    }
    if (quest.rewards.items && quest.rewards.items.length > 0) {
      for (const itemId of quest.rewards.items) {
        player.inventory.push({
          itemId,
          quantity: 1
        });
      }
    }
    
    // 移除活跃任务
    player.activeQuests.splice(questIndex, 1);
    
    await player.save();
    
    res.json({
      success: true,
      message: `成功完成任务: ${quest.name}`,
      rewards: quest.rewards,
      player: {
        gold: player.gold,
        experience: player.experience,
        craftingLevel: player.craftingLevel,
        miningLevel: player.miningLevel,
        inventory: player.inventory
      }
    });
  } catch (err) {
    console.error('提交任务错误:', err);
    res.status(500).json({ error: '服务器错误' });
  }
});

module.exports = router;