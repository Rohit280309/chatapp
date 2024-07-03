const redis = require('redis');

// Create and connect Redis client
const redisClient = redis.createClient();

redisClient.on('error', (err) => {
  console.error('Redis error:', err);
});

redisClient.on('connect', () => {
  console.log('Redis client connected');
});

// Promisify the connection process to ensure it's completed before usage
const connectRedis = async () => {
  await redisClient.connect();
};

const addClientToServer = async (clientId, serverId) => {
  try {
    const client = await redisClient.hGet('clients', clientId);
    if (!client) {
      await redisClient.hSet('clients', clientId, serverId);
      console.log("client added");
    }
  } catch (err) {
    console.error('Error adding client to server:', err);
  }
};

const removeClientFromServer = async (clientId) => {
  try {
    console.log("deleted")
    await redisClient.hDel('clients', clientId);
  } catch (err) {
    console.error('Error removing client from server:', err);
  }
};

const getClientServer = async (clientId) => {
  try {
    const serverId = await redisClient.hGet('clients', clientId);
    return serverId;
  } catch (err) {
    console.error('Error getting client server:', err);
    return null;
  }
};

const getClientStatus = async (clientId) => {
  try {
    const status = await redisClient.hGet('clients', clientId);
    console.log("Status",status);
    return status ? true : false;
  } catch (err) {
    console.error('Error getting client status:', err);
    return null;
  }
}

module.exports = { connectRedis, addClientToServer, removeClientFromServer, getClientServer, getClientStatus };
