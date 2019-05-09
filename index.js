const RabbitMQ = require('./core/rabbit-mq');
const RedisStorage = require('./core/redis');
const MongoStorage = require('./core/mongodb');
const Listener = require('./core/events');

async function init() {
    const redis = new RedisStorage();

    const mongo = new MongoStorage();

    const rabbitMq = await RabbitMQ.build(mongo);

    const listener = new Listener(redis, rabbitMq);

    await listener.init();
}

init();
