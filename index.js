const RabbitMQ = require('./core/rabbit-mq');
const RedisStorage = require('./core/redis');
const MongoStorage = require('./core/mongodb');
const Listener = require('./core/events');
const { info } = require('./core/logger');

const app = require('http').createServer(handler);
const port = process.env.PORT || 6000;

async function init() {
    const redis = new RedisStorage();

    const mongo = new MongoStorage();

    app.listen(port);

    RabbitMQ.build(mongo).then((res, err) => {
        if (err) {
            info('RabbitMQ initialization failed.');
        } else {
            info('RabbitMQ successfully initialized.');
            const listener = new Listener(redis, res);
            listener.init().then(res => {
                if (res) {
                    info('Listener successfully initialized and past events succesfully sent.');
                } else {
                    info('Listener initialization failed.');
                }
            });
        }
    });
}

init();

function handler(__req, res) {
    res.writeHead(200);
    res.end('Running');
}
