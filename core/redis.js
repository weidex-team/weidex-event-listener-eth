const Redis = require('ioredis');
const redisUrl = process.env.REDISTOGO_URL;
const redis = new Redis(redisUrl);

module.exports = redis;
