const rabbitMQ = require('./core/rabbit-mq');
const listener = require('./core/listener');

const app = require('http').createServer(handler);
const port = process.env.PORT || 6000;

async function init() {
    await rabbitMQ.init();
    listener.init();
    setInterval(listener.process, 5000);
    app.listen(port);
}

init();

function handler(__req, res) {
    res.writeHead(200);
    res.end('Running');
}
