# 修真炼器录游戏后端

这是修真炼器录游戏的后端服务，基于Node.js、Express和MongoDB开发。

## 项目结构

```
backend/
├── src/
│   ├── config/          # 配置文件
│   │   └── db.js        # MongoDB连接配置
│   ├── middlewares/     # 中间件
│   │   └── auth.js      # 认证中间件
│   ├── models/          # 数据模型
│   │   ├── Auction.js   # 拍卖行模型
│   │   ├── Item.js      # 物品模型
│   │   ├── Player.js    # 玩家模型
│   │   └── Quest.js     # 任务模型
│   ├── routes/          # API路由
│   │   ├── auth.js      # 认证路由
│   │   ├── auction.js   # 拍卖行路由
│   │   ├── crafting.js  # 炼器路由
│   │   ├── mining.js    # 挖矿路由
│   │   ├── player.js    # 玩家路由
│   │   └── quest.js     # 任务路由
│   └── utils/           # 工具函数
│       └── gameData.js  # 游戏数据初始化
├── .env                 # 环境变量配置
├── .env.example         # 环境变量示例
├── app.js               # 应用入口
├── package.json         # 项目配置和依赖
└── start.bat            # Windows启动脚本
```

## 技术栈

- **Node.js** - JavaScript运行时
- **Express** - Web应用框架
- **MongoDB** - 文档型数据库
- **Mongoose** - MongoDB对象建模工具
- **JWT** - 身份验证
- **CORS** - 跨域资源共享
- **Helmet** - 安全中间件

## 环境要求

- Node.js 16.0.0或更高版本
- MongoDB 4.0或更高版本（本地或云服务）

## 快速开始

### 方法一：使用启动脚本（推荐）

1. 确保已安装Node.js和MongoDB
2. 双击运行 `start.bat` 文件
3. 启动脚本会自动检测并安装依赖，然后启动开发服务器

### 方法二：手动安装

1. 克隆或下载项目
2. 进入项目目录：`cd backend`
3. 安装依赖：`npm install`
4. 配置环境变量（复制 `.env.example` 为 `.env` 并修改）
5. 启动开发服务器：`npm run dev`
6. 启动生产服务器：`npm start`

## 环境变量配置

复制 `.env.example` 文件为 `.env`，并根据需要修改以下配置：

| 变量名 | 描述 | 默认值 |
|-------|------|--------|
| PORT | 服务器端口 | 5000 |
| NODE_ENV | 环境类型 | development |
| MONGODB_URI | MongoDB连接地址 | mongodb://localhost:27017/mining_game |
| JWT_SECRET | JWT签名密钥 | your-secret-key |
| JWT_EXPIRES_IN | JWT过期时间 | 7d |
| CORS_ORIGIN | CORS允许的源 | http://localhost:3000 |

## API文档

### 认证API

- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录

### 玩家API

- `GET /api/player/profile` - 获取玩家信息
- `GET /api/player/inventory` - 获取玩家背包
- `GET /api/player/equipment` - 获取玩家装备
- `POST /api/player/equip` - 装备物品
- `POST /api/player/unequip` - 卸下装备

### 挖矿API

- `POST /api/mining/mine` - 挖矿

### 炼器API

- `POST /api/crafting/smelt` - 熔炼材料
- `POST /api/crafting/forge` - 锻造物品

### 拍卖行API

- `GET /api/auction` - 获取拍卖列表
- `POST /api/auction/list` - 上架物品
- `POST /api/auction/buy` - 购买物品

### 任务API

- `GET /api/quest/available` - 获取可用任务列表
- `GET /api/quest/active` - 获取玩家活跃任务
- `POST /api/quest/accept/:questId` - 接受任务
- `POST /api/quest/submit/:questId` - 提交任务

## 游戏功能

### 1. 玩家系统
- 用户注册和登录
- 玩家信息管理
- 背包系统
- 装备系统

### 2. 挖矿系统
- 多种矿脉类型（铜、铁、银、金）
- 基于等级和体力的挖矿机制
- 随机掉落物品

### 3. 炼器系统
- 矿石熔炼
- 装备锻造
- 品质随机生成
- 经验系统

### 4. 拍卖行系统
- 物品上架
- 物品购买
- 拍卖搜索和筛选

### 5. 任务系统
- 日常任务
- 随机任务
- 悬赏任务
- 任务进度跟踪

## 开发指南

### 安装开发依赖

```bash
npm install --save-dev
```

### 代码风格检查

```bash
npm run lint
```

### 运行测试

```bash
npm test
```

### 项目结构说明

- **config/**: 存放配置文件，如数据库连接配置
- **middlewares/**: 存放中间件，如认证中间件
- **models/**: 存放数据模型，定义数据库结构
- **routes/**: 存放API路由，处理HTTP请求
- **utils/**: 存放工具函数，如游戏数据初始化

## 部署

### 生产环境部署

1. 设置环境变量：`NODE_ENV=production`
2. 安装依赖：`npm install --production`
3. 启动服务器：`npm start`

### 使用PM2管理进程

```bash
npm install -g pm2
pm run build
pm start:prod
```

## 数据库

### 初始数据

首次启动时，系统会自动创建基础游戏数据，包括：
- 基础矿石（铜矿石、铁矿石、锡矿石等）
- 基础材料（铜锭、铁锭等）
- 基础任务

### 数据库备份

建议定期备份MongoDB数据库：

```bash
mongodump --db mining_game --out ./backups
```

## 监控和日志

- 服务器日志会输出到控制台
- 建议在生产环境使用专业的日志管理工具，如Winston或Morgan

## 安全建议

1. 生产环境中修改 `JWT_SECRET` 为强随机字符串
2. 定期更新依赖包，修复安全漏洞
3. 使用HTTPS协议
4. 配置适当的CORS策略
5. 对敏感数据进行加密存储

## 常见问题

### Q: 无法连接到MongoDB？
A: 请检查MongoDB服务是否正在运行，以及连接地址是否正确。

### Q: 启动时出现依赖错误？
A: 请尝试删除 `node_modules` 文件夹，然后重新安装依赖：`npm install`。

### Q: 如何修改服务器端口？
A: 编辑 `.env` 文件中的 `PORT` 变量。

### Q: 如何添加新物品或任务？
A: 修改 `src/utils/gameData.js` 文件，添加新的物品或任务数据，然后重启服务器。

## 许可证

MIT License

## 联系方式

如有问题或建议，请联系开发团队。

---

**修真炼器录游戏后端服务**
**版本：1.0.0**