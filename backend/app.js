const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const connectDB = require('./src/config/db');
const authMiddleware = require('./src/middlewares/auth');
const { initGameData } = require('./src/utils/gameData');

// 路由
const authRoutes = require('./src/routes/auth');
const playerRoutes = require('./src/routes/player');
const miningRoutes = require('./src/routes/mining');
const craftingRoutes = require('./src/routes/crafting');
const auctionRoutes = require('./src/routes/auction');
const questRoutes = require('./src/routes/quest');

const app = express();

// 加载环境变量
if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

// 连接数据库
connectDB();

// 中间件
app.use(cors());
app.use(helmet());
app.use(express.json());

// 健康检查路由
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: '服务器运行正常' });
});

// 路由
app.use('/api/auth', authRoutes);
app.use('/api/player', authMiddleware, playerRoutes);
app.use('/api/mining', authMiddleware, miningRoutes);
app.use('/api/crafting', authMiddleware, craftingRoutes);
app.use('/api/auction', authMiddleware, auctionRoutes);
app.use('/api/quest', authMiddleware, questRoutes);

// 错误处理
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: '服务器错误' });
});

const PORT = process.env.PORT || 5000;

// 启动服务器
app.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
  console.log(`API文档地址: http://localhost:${PORT}/health`);
  
  // 初始化游戏数据
  initGameData().catch(err => {
    console.error('初始化游戏数据失败:', err);
  });
});

module.exports = app;