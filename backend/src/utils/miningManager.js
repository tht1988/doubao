// 采矿管理工具类
const InventoryManager = require('./inventoryManager');

class MiningManager {
  // 矿脉定义（从路由文件中迁移到这里统一管理）
  static MINES = {
    copper: {
      name: '铜矿脉',
      levelReq: 1,
      staminaCost: 5,
      items: [
        { name: 'copperOre', chance: 80 },
        { name: 'tinOre', chance: 20 },
        { name: 'lowSpiritStone', chance: 5 }
      ]
    },
    iron: {
      name: '铁矿脉',
      levelReq: 5,
      staminaCost: 8,
      items: [
        { name: 'ironOre', chance: 75 },
        { name: 'coal', chance: 25 },
        { name: 'mediumSpiritStone', chance: 3 }
      ]
    },
    silver: {
      name: '银矿脉',
      levelReq: 10,
      staminaCost: 12,
      items: [
        { name: 'silverOre', chance: 70 },
        { name: 'leadOre', chance: 15 },
        { name: 'mediumSpiritStone', chance: 10 },
        { name: 'moonstone', chance: 5 }
      ]
    },
    gold: {
      name: '金矿脉',
      levelReq: 15,
      staminaCost: 15,
      items: [
        { name: 'goldOre', chance: 65 },
        { name: 'silverOre', chance: 20 },
        { name: 'highSpiritStone', chance: 8 },
        { name: 'sunstone', chance: 5 },
        { name: 'diamond', chance: 2 }
      ]
    }
  };

  // 计算采矿时间（基础时间 * 等级系数）
  static calculateMiningTime(miningLevel, mineType) {
    const baseTime = 2000; // 基础采矿时间（毫秒）
    const levelFactor = Math.max(0.1, 1 - (miningLevel - 1) * 0.05); // 每级减少5%时间，最低10%
    return Math.round(baseTime * levelFactor);
  }

  // 执行单次采矿
  static async performMining(player, mineType, ItemModel) {
    const mine = this.MINES[mineType];
    if (!mine) {
      throw new Error('无效的矿脉类型');
    }

    // 验证等级和体力
    if (player.miningLevel < mine.levelReq) {
      throw new Error(`需要挖矿等级 ${mine.levelReq}`);
    }
    if (player.stamina < mine.staminaCost) {
      throw new Error('体力不足');
    }

    // 消耗体力
    player.stamina -= mine.staminaCost;
    player.lastMiningTime = new Date();

    // 计算采矿结果
    const obtainedItems = [];
    for (const mineItem of mine.items) {
      if (Math.random() * 100 < mineItem.chance) {
        // 查找物品
        const item = await ItemModel.findOne({ name: mineItem.name });
        if (!item) continue;
        
        // 添加到玩家背包
        InventoryManager.addItem(player.inventory, item, 1);
        
        obtainedItems.push(item.name);
      }
    }

    return { obtainedItems, stamina: player.stamina };
  }

  // 开始连续采矿
  static startContinuousMining(player, mineType) {
    const mine = this.MINES[mineType];
    if (!mine) {
      throw new Error('无效的矿脉类型');
    }

    if (player.miningLevel < mine.levelReq) {
      throw new Error(`需要挖矿等级 ${mine.levelReq}`);
    }

    // 更新采矿状态
    player.isContinuousMining = true;
    player.continuousMiningType = mineType;
    player.continuousMiningStartTime = new Date();
    player.lastMiningTime = new Date();

    return {
      success: true,
      message: `开始连续开采 ${mine.name}`,
      miningType: mineType
    };
  }

  // 停止连续采矿
  static stopContinuousMining(player) {
    player.isContinuousMining = false;
    player.continuousMiningType = null;
    player.continuousMiningStartTime = null;

    return {
      success: true,
      message: '已停止连续开采'
    };
  }

  // 计算连续采矿的收益
  static async calculateContinuousMining(player, ItemModel) {
    if (!player.isContinuousMining || !player.continuousMiningType) {
      return { success: false, message: '当前没有进行连续采矿' };
    }

    const mineType = player.continuousMiningType;
    const mine = this.MINES[mineType];
    const now = new Date();
    const startTime = player.continuousMiningStartTime;
    const elapsedTime = now - startTime;

    // 计算可采矿次数（每次采矿消耗的时间）
    const miningTime = this.calculateMiningTime(player.miningLevel, mineType);
    const maxPossibleMines = Math.floor(elapsedTime / miningTime);
    
    // 计算实际可采矿次数（考虑体力限制）
    const maxStaminaBasedMines = Math.floor(player.stamina / mine.staminaCost);
    const actualMines = Math.min(maxPossibleMines, maxStaminaBasedMines);

    if (actualMines <= 0) {
      // 停止连续采矿（体力不足）
      this.stopContinuousMining(player);
      return {
        success: false,
        message: '体力不足，已停止连续采矿',
        obtainedItems: [],
        stamina: player.stamina
      };
    }

    // 执行多次采矿
    const obtainedItems = [];
    for (let i = 0; i < actualMines; i++) {
      if (player.stamina < mine.staminaCost) break;
      
      // 消耗体力
      player.stamina -= mine.staminaCost;
      
      // 计算采矿结果
      for (const mineItem of mine.items) {
        if (Math.random() * 100 < mineItem.chance) {
          // 查找物品
          const item = await ItemModel.findOne({ name: mineItem.name });
          if (!item) continue;
          
          // 添加到玩家背包
          InventoryManager.addItem(player.inventory, item, 1);
          
          obtainedItems.push(item.name);
        }
      }
    }

    // 更新采矿时间
    player.lastMiningTime = now;
    
    // 如果体力不足，停止连续采矿
    if (player.stamina < mine.staminaCost) {
      this.stopContinuousMining(player);
      return {
        success: true,
        message: '体力不足，已停止连续采矿',
        obtainedItems,
        stamina: player.stamina,
        continuousMining: false
      };
    }

    return {
      success: true,
      message: `连续采矿获得 ${obtainedItems.length} 件物品`,
      obtainedItems,
      stamina: player.stamina,
      continuousMining: true
    };
  }

  // 计算离线采矿收益
  static async calculateOfflineMining(player, ItemModel) {
    if (!player.offlineMiningEnabled || !player.offlineMiningType) {
      return { success: false, message: '离线采矿未启用' };
    }

    const now = new Date();
    const lastCheckTime = player.lastOfflineCheckTime;
    const elapsedTime = now - lastCheckTime;
    
    // 限制最大离线时间为24小时
    const maxOfflineTime = 24 * 60 * 60 * 1000;
    const actualElapsedTime = Math.min(elapsedTime, maxOfflineTime);

    if (actualElapsedTime < 60000) { // 小于1分钟不计算
      return { success: false, message: '离线时间不足1分钟' };
    }

    const mineType = player.offlineMiningType;
    const mine = this.MINES[mineType];
    
    // 计算采矿时间和次数
    const miningTime = this.calculateMiningTime(player.miningLevel, mineType);
    const maxPossibleMines = Math.floor(actualElapsedTime / miningTime);
    
    // 离线采矿只消耗恢复的体力
    // 计算恢复的体力
    const timeSinceLastUpdate = now - player.lastStaminaUpdate;
    const staminaRegenRate = player.maxStamina / (12 * 60 * 60 * 1000); // 12小时恢复满体力
    const regeneratedStamina = Math.min(
      player.maxStamina - player.stamina,
      Math.floor(timeSinceLastUpdate * staminaRegenRate)
    );
    
    // 更新当前体力
    player.stamina += regeneratedStamina;
    player.lastStaminaUpdate = now;
    
    // 计算实际可采矿次数
    const maxStaminaBasedMines = Math.floor(player.stamina / mine.staminaCost);
    const actualMines = Math.min(maxPossibleMines, maxStaminaBasedMines);

    if (actualMines <= 0) {
      return {
        success: false,
        message: '体力不足，无法进行离线采矿',
        obtainedItems: [],
        stamina: player.stamina
      };
    }

    // 执行离线采矿
    const obtainedItems = [];
    for (let i = 0; i < actualMines; i++) {
      if (player.stamina < mine.staminaCost) break;
      
      // 消耗体力
      player.stamina -= mine.staminaCost;
      
      // 计算采矿结果（离线采矿概率减半）
      for (const mineItem of mine.items) {
        if (Math.random() * 100 < (mineItem.chance / 2)) {
          // 查找物品
          const item = await ItemModel.findOne({ name: mineItem.name });
          if (!item) continue;
          
          // 添加到玩家背包
          InventoryManager.addItem(player.inventory, item, 1);
          
          obtainedItems.push(item.name);
        }
      }
    }

    // 更新离线检查时间
    player.lastOfflineCheckTime = now;
    player.lastMiningTime = now;

    return {
      success: true,
      message: `离线采矿获得 ${obtainedItems.length} 件物品`,
      obtainedItems,
      stamina: player.stamina,
      offlineTime: Math.floor(actualElapsedTime / 1000) // 秒
    };
  }

  // 更新玩家体力
  static updateStamina(player) {
    const now = new Date();
    const timeSinceLastUpdate = now - player.lastStaminaUpdate;
    const staminaRegenRate = player.maxStamina / (12 * 60 * 60 * 1000); // 12小时恢复满体力
    const regeneratedStamina = Math.min(
      player.maxStamina - player.stamina,
      Math.floor(timeSinceLastUpdate * staminaRegenRate)
    );
    
    player.stamina += regeneratedStamina;
    player.lastStaminaUpdate = now;
    
    return player.stamina;
  }

  // 检查采矿状态，确保状态一致性
  static validateMiningState(player) {
    // 如果连续采矿但体力不足，停止连续采矿
    if (player.isContinuousMining && player.continuousMiningType) {
      const mine = this.MINES[player.continuousMiningType];
      if (player.stamina < mine.staminaCost) {
        this.stopContinuousMining(player);
      }
    }
    
    // 更新体力
    this.updateStamina(player);
    
    return player;
  }
}

module.exports = MiningManager;