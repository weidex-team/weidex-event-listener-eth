const { CONTRACT_ADDRESS } = require('../config');
const { CANCEL } = require('../queues');
const BaseEvent = require('./base');
const { info } = require('../logger');

class Cancel extends BaseEvent {
    constructor(contract, provider, _interface, rabbitMQ, redis) {
        super(contract, provider, _interface);
        this.rabbitMQ = rabbitMQ;
        this.redis = redis;
    }

    subscribe() {
        info(`Cancel subscriber ON`);
        this.contract.on('Cancel', (makerBuyToken, makerSellToken, maker, orderHash, event) => {
            this.rabbitMQ.send(
                CANCEL,
                JSON.stringify({
                    makerBuyToken,
                    makerSellToken,
                    maker,
                    orderHash,
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
            topics: [this.contract.interface.events.Cancel.topic],
        };
        const logs = await this.provider.getLogs(filter);

        const events = logs.map(log => {
            const event = this.interface.parseLog(log);
            return {
                makerBuyToken: event.values.makerBuyToken,
                makerSellToken: event.values.makerSellToken,
                maker: event.values.maker,
                orderHash: event.values.orderHash,
                txHash: log.transactionHash,
            };
        });

        return events;
    }
}

module.exports = Cancel;
