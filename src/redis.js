const { createClient } = require('redis');
const config = require('./config');

const client = createClient({
  socket: {
    host: config.redis.host,
    port: config.redis.port,
  },
  password: config.redis.password,
});

client.on('error', (err) => {
  console.error('[Redis] Connection error:', err.message);
});

client.on('connect', () => {
  console.log('[Redis] Connected');
});

module.exports = client;
