const { CONTRACT_ADDRESS } = require('../config');
const { WITHDRAW } = require('../queues');
const BaseEvent = require('./base');
const { info } = require('../logger');

class Withdraw extends BaseEvent {
    constructor(contract, provider, _interface, rabbitMQ, redis) {
        super(contract, provider, _interface);
        this.rabbitMQ = rabbitMQ;
        this.redis = redis;
    }

    subscribe() {
        info(`Withdraw subscriber ON`);
        this.contract.on('Withdraw', (token, user, amount, balance, event) => {
            this.rabbitMQ.send(
                WITHDRAW,
                JSON.stringify({
                    token,
                    user,
                    amount: amount.toString(),
                    balance: balance.toString(),
                    txHash: event.transactionHash,
                })
            );
            this.redis.setlastBlock(event.blockNumber);
        });
    }

    async getPast(fromBlock, toBlock) {
        const filter = {
            address: CONTRACT_ADDRESS,
            fromBlock: fromBlock,
            toBlock: toBlock,
            topics: [this.contract.interface.events.Withdraw.topic],
        };
        const logs = await this.provider.getLogs(filter);

        logs.map(log => {
            const event = this.interface.parseLog(log);
            const result = JSON.stringify({
                token: event.values.token,
                user: event.values.user,
                amount: event.values.amount.toString(),
                balance: event.values.balance.toString(),
                txHash: log.transactionHash,
            });
            this.rabbitMQ.send(WITHDRAW, result);
        });
    }
}

module.exports = Withdraw;
