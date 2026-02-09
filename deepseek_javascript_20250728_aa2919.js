const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const connectDB = require('./config/db');
const authMiddleware = require('./middlewares/auth');

// 路由
const authRoutes = require('./routes/auth');
const playerRoutes = require('./routes/player');
const miningRoutes = require('./routes/mining');
const craftingRoutes = require('./routes/crafting');
const auctionRoutes = require('./routes/auction');
const questRoutes = require('./routes/quest');

const app = express();

// 连接数据库
connectDB();

// 中间件
app.use(cors());
app.use(express.json());

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

module.exports = app;