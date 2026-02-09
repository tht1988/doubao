const app = require('./app');
const http = require('http');
const { initGameData } = require('./gameData');

const PORT = process.env.PORT || 5000;

// 初始化游戏数据
initGameData().then(() => {
  const server = http.createServer(app);
  
  server.listen(PORT, () => {
    console.log(`服务器运行在端口 ${PORT}`);
  });
}).catch(err => {
  console.error('初始化游戏数据失败:', err);
  process.exit(1);
});