const Redis = require('ioredis');
const { REDIS_URL } = require('./config');
const { info } = require('./logger');

class RedisStorage {
    constructor() {
        this.redis = new Redis(REDIS_URL);
    }

    async setlastBlock(blockNumber) {
        info(`Last Block Number: ${blockNumber}`);
        await this.redis.set('lastBlock', blockNumber);
    }

    async getlastBlock() {
        const result = await this.redis.get('lastBlock');
        return parseInt(result);
    }
}

module.exports = RedisStorage;
