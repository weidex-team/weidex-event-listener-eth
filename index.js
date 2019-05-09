const RabbitMQ = require('./core/rabbit-mq');
const RedisStorage = require('./core/redis');
const MongoStorage = require('./core/mongodb');
const Listener = require('./core/events');

const app = require('http').createServer(handler);
const port = process.env.PORT || 6000;

async function init() {
    const redis = new RedisStorage();

    const mongo = new MongoStorage();

    const rabbitMq = await RabbitMQ.build(mongo);

    const listener = new Listener(redis, rabbitMq);

    listener.init();

    app.listen(port);
}

init();

function handler(__req, res) {
    res.writeHead(200);
    res.end('Running');
}
