const { CONTRACT_ADDRESS } = require('../config');
const { DEPOSIT } = require('../queues');
const BaseEvent = require('./base');
const { info } = require('../logger');

class Deposit extends BaseEvent {
    constructor(contract, provider, _interface, rabbitMQ, redis) {
        super(contract, provider, _interface);
        this.rabbitMQ = rabbitMQ;
        this.redis = redis;
    }

    subscribe() {
        info(`Deposit subscriber ON`);
        this.contract.on(
            'Deposit',
            (token, user, referral, beneficiary, amount, balance, event) => {
                this.rabbitMQ.send(
                    DEPOSIT,
                    JSON.stringify({
                        token,
                        user,
                        referral,
                        beneficiary,
                        amount: amount.toString(),
                        balance: balance.toString(),
                        txHash: event.transactionHash,
                    })
                );
                this.redis.setlastBlock(event.blockNumber);
            }
        );
    }

    async getPast(fromBlock, toBlock) {
        const filter = {
            address: CONTRACT_ADDRESS,
            fromBlock: fromBlock,
            toBlock: toBlock,
            topics: [this.contract.interface.events.Deposit.topic],
        };
        const logs = await this.provider.getLogs(filter);

        logs.map(log => {
            const event = this.interface.parseLog(log);
            const result = JSON.stringify({
                token: event.values.token,
                user: event.values.user,
                referral: event.values.referral,
                beneficiary: event.values.beneficiary,
                amount: event.values.amount.toString(),
                balance: event.values.balance.toString(),
                txHash: log.transactionHash,
            });
            this.rabbitMQ.send(DEPOSIT, result);
        });
    }
}

module.exports = Deposit;
