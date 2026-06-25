const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ── 健康检查 ──
app.get('/api/health', async (_req, res) => {
  const status = {
    server: 'running',
    mysql: 'unknown',
    redis: 'unknown',
    timestamp: new Date().toISOString(),
  };

  // 检测 MySQL 连接
  try {
    const mysql = require('mysql2/promise');
    const conn = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'ai_devops_demo',
      connectTimeout: 3000,
    });
    await conn.ping();
    await conn.end();
    status.mysql = 'connected';
  } catch (e) {
    status.mysql = `unreachable: ${e.message}`;
  }

  // 检测 Redis 连接
  try {
    const { createClient } = require('redis');
    const client = createClient({
      socket: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
      },
      password: process.env.REDIS_PASSWORD || undefined,
    });
    client.on('error', () => {});
    await client.connect();
    await client.ping();
    await client.quit();
    status.redis = 'connected';
  } catch (e) {
    status.redis = `unreachable: ${e.message}`;
  }

  res.json(status);
});

// ── 模拟用户 API (JWT保护) ──
app.get('/api/users', (_req, res) => {
  // 模拟数据
  const users = [
    { id: 1, name: 'Alice', email: 'alice@demo.com' },
    { id: 2, name: 'Bob', email: 'bob@demo.com' },
  ];
  res.json({ success: true, data: users });
});

app.listen(PORT, () => {
  console.log(`🚀 AI DevOps Demo running on http://localhost:${PORT}`);
});
