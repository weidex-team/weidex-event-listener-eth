const { CONTRACT_ADDRESS } = require('../config');
const { TRANSFER } = require('../queues');
const BaseEvent = require('./base');
const { info } = require('../logger');

class Transfer extends BaseEvent {
    constructor(contract, provider, _interface, rabbitMQ, redis) {
        super(contract, provider, _interface);
        this.rabbitMQ = rabbitMQ;
        this.redis = redis;
    }

    subscribe() {
        info(`Transfer subscriber ON`);
        this.contract.on(
            'Transfer',
            (token, user, beneficiary, amount, userBalance, beneficiaryBalance, event) => {
                this.rabbitMQ.send(TRANSFER, {
                    token,
                    user,
                    beneficiary,
                    amount,
                    userBalance,
                    beneficiaryBalance,
                });
                this.redis.setlastBlock(event.blockNumber);
            }
        );
    }

    async getPast(fromBlock, toBlock) {
        const filter = {
            address: CONTRACT_ADDRESS,
            fromBlock: fromBlock,
            toBlock: toBlock,
            topics: [this.contract.interface.events.Transfer.topic],
        };
        const logs = await this.provider.getLogs(filter);
        const events = logs.map(log =>
            Object.assign({}, this.interface.parseLog(log), { tx: log.transactionHash })
        );

        return events;
    }
}

module.exports = Transfer;
