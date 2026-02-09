// 背包管理工具类
class InventoryManager {
  // 检查物品是否可堆叠
  static isStackable(item) {
    return item && item.stackable !== false;
  }

  // 查找背包中是否已有该物品
  static findItem(inventory, itemId) {
    return inventory.find(item => item.itemId && item.itemId.equals(itemId));
  }

  // 添加物品到背包
  static addItem(inventory, item, quantity = 1) {
    // 如果物品不可堆叠，直接添加新条目
    if (!this.isStackable(item)) {
      for (let i = 0; i < quantity; i++) {
        inventory.push({
          itemId: item._id,
          quantity: 1
        });
      }
      return { added: quantity, remaining: 0 };
    }

    // 查找已存在的堆叠
    const existingItem = this.findItem(inventory, item._id);
    if (existingItem) {
      existingItem.quantity += quantity;
      return { added: quantity, remaining: 0 };
    }

    // 添加新堆叠
    inventory.push({
      itemId: item._id,
      quantity: quantity
    });
    return { added: quantity, remaining: 0 };
  }

  // 从背包移除物品
  static removeItem(inventory, itemId, quantity = 1) {
    const item = this.findItem(inventory, itemId);
    if (!item) {
      return { removed: 0, remaining: 0 };
    }

    const removed = Math.min(quantity, item.quantity);
    item.quantity -= removed;

    // 如果数量为0，移除该物品
    if (item.quantity <= 0) {
      const index = inventory.findIndex(i => i.itemId && i.itemId.equals(itemId));
      if (index > -1) {
        inventory.splice(index, 1);
      }
    }

    return { removed, remaining: item.quantity };
  }

  // 计算背包当前容量使用情况
  static calculateCapacity(inventory) {
    return {
      totalItems: inventory.length,
      totalQuantity: inventory.reduce((sum, item) => sum + item.quantity, 0)
    };
  }

  // 自动整理背包（按物品类型和稀有度排序）
  static sortInventory(inventory) {
    return inventory.sort((a, b) => {
      // 先按物品ID排序（相同物品排在一起）
      return a.itemId.toString().localeCompare(b.itemId.toString());
    });
  }

  // 创建临时背包
  static createTempInventory() {
    return [];
  }

  // 将临时背包合并到主背包
  static mergeTempInventory(mainInventory, tempInventory) {
    for (const tempItem of tempInventory) {
      this.addItem(mainInventory, tempItem, tempItem.quantity);
    }
    // 清空临时背包
    tempInventory.length = 0;
  }
}

module.exports = InventoryManager;