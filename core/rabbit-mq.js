const amqp = require('amqplib');
const queuesNames = require('./queues');
const { info, debug } = require('./logger');

module.exports = {
    init,
    sendDepositEvent,
    sendWithdrawEvent,
    sendDepositWithReferralEvent,
    sendTakeOrderEvent,
    sendCancelOrderEvent,
    sendReferralBalanceEvent,
};

const rabbitMqServer = process.env.MQ_CONNECTION_STRING;
info(`Message queue is connected via: ${rabbitMqServer}`);

let channel;

async function init() {
    info('RabbitMQ initializing.');
    const connection = await amqp.connect(rabbitMqServer);
    channel = await connection.createChannel();
    info('RabbitMQ successfully initialized.');
}

function sendDepositEvent(data) {
    _send(queuesNames.DEPOSIT, data);
}

function sendWithdrawEvent(data) {
    _send(queuesNames.WITHDRAW, data);
}

function sendDepositWithReferralEvent(data) {
    _send(queuesNames.REFERRAL_DEPOSIT, data);
}

function sendTakeOrderEvent(data) {
    _send(queuesNames.TAKE_ORDER, data);
}

function sendCancelOrderEvent(data) {
    _send(queuesNames.CANCEL_ORDER, data);
}

function sendReferralBalanceEvent(data) {
    _send(queuesNames.REFERRAL_BALANCE, data);
}

function _send(queueName, data) {
    channel.assertQueue(queueName, {
        durable: false,
    });
    channel.publish('', queueName, new Buffer(JSON.stringify(data)), {
        contentType: 'json',
    });
    debug(`Send ${data} to Q ${queueName}`);
}
