const amqp = require('amqplib');
const { info } = require('./logger');
const ethers = require('ethers');
const { RABBIT_MQ_URL } = require('./config');

class RabbitMQ {
    constructor(connection, channel, mongo) {
        this.connection = connection;
        this.channel = channel;
        this.mongo = mongo;
    }

    static async build(mongo) {
        info('RabbitMQ initializing.');
        const connection = await amqp.connect(RABBIT_MQ_URL);
        const channel = await connection.createChannel();
        return new RabbitMQ(connection, channel, mongo);
    }

    send(queueName, data) {
        const dataBytes = ethers.utils.toUtf8Bytes(data);
        const hash = ethers.utils.keccak256(dataBytes);

        this.mongo.save(hash).then(result => {
            if (result) {
                this.channel.assertQueue(queueName, {
                    durable: false,
                });
                this.channel.publish('', queueName, new Buffer.from(data), {
                    contentType: 'json',
                });
                info(`Send ${data} to Q ${queueName}`);
            }
        });
    }
}

module.exports = RabbitMQ;
