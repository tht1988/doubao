const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Player = require('../models/Player');

// 用户注册
router.post('/register', async (req, res) => {
  try {
    const { username, password, email } = req.body;
    
    // 检查用户名是否已存在
    const existingPlayer = await Player.findOne({ username });
    if (existingPlayer) {
      return res.status(400).json({ error: '用户名已存在' });
    }
    
    // 检查邮箱是否已存在
    if (email) {
      const existingEmail = await Player.findOne({ email });
      if (existingEmail) {
        return res.status(400).json({ error: '邮箱已被注册' });
      }
    }
    
    // 密码加密
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // 创建新玩家
    const player = new Player({
      username,
      password: hashedPassword,
      email,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    await player.save();
    
    // 生成JWT令牌
    const token = jwt.sign(
      { playerId: player._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );
    
    res.json({
      success: true,
      token,
      player: {
        _id: player._id,
        username: player.username,
        level: player.level,
        gold: player.gold,
        spiritStones: player.spiritStones
      }
    });
  } catch (err) {
    console.error('注册错误:', err);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 用户登录
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // 查找玩家
    const player = await Player.findOne({ username });
    if (!player) {
      return res.status(400).json({ error: '用户名或密码错误' });
    }
    
    // 验证密码
    const isMatch = await bcrypt.compare(password, player.password);
    if (!isMatch) {
      return res.status(400).json({ error: '用户名或密码错误' });
    }
    
    // 生成JWT令牌
    const token = jwt.sign(
      { playerId: player._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );
    
    res.json({
      success: true,
      token,
      player: {
        _id: player._id,
        username: player.username,
        level: player.level,
        gold: player.gold,
        spiritStones: player.spiritStones
      }
    });
  } catch (err) {
    console.error('登录错误:', err);
    res.status(500).json({ error: '服务器错误' });
  }
});

module.exports = router;