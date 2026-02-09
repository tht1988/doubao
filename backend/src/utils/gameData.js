const Player = require('../models/Player');
const Item = require('../models/Item');
const Quest = require('../models/Quest');

const initGameData = async () => {
  // 检查是否已初始化
  const count = await Item.countDocuments();
  if (count > 0) return;
  
  // 创建基础物品
  const copperOre = await Item.create({
    name: '铜矿石',
    type: 'material',
    rarity: 'common',
    value: 5,
    stackable: true
  });
  
  const ironOre = await Item.create({
    name: '铁矿石',
    type: 'material',
    rarity: 'common',
    value: 10,
    stackable: true
  });
  
  const tinOre = await Item.create({
    name: '锡矿石',
    type: 'material',
    rarity: 'common',
    value: 8,
    stackable: true
  });
  
  const lowSpiritStone = await Item.create({
    name: '下品灵石',
    type: 'material',
    rarity: 'uncommon',
    value: 50,
    stackable: true
  });
  
  const copperBar = await Item.create({
    name: '铜锭',
    type: 'material',
    rarity: 'common',
    value: 12,
    stackable: true,
    recipe: {
      materials: [
        { itemId: copperOre._id, quantity: 2 }
      ],
      xp: 5
    }
  });
  
  const ironBar = await Item.create({
    name: '铁锭',
    type: 'material',
    rarity: 'uncommon',
    value: 25,
    stackable: true,
    recipe: {
      materials: [
        { itemId: ironOre._id, quantity: 2 }
      ],
      xp: 10
    }
  });
  
  // 创建基础任务
  await Quest.create({
    name: '收集铜锭',
    description: '提交10个铜锭给铁匠铺',
    type: 'daily',
    requirements: [
      { itemId: copperBar._id, quantity: 10 }
    ],
    rewards: {
      gold: 500,
      experience: 100
    }
  });
  
  console.log('游戏数据初始化完成');
};

module.exports = { initGameData };