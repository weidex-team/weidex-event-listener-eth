const { CONTRACT_ADDRESS } = require('../config');
const { TRADE } = require('../queues');
const BaseEvent = require('./base');
const { info } = require('../logger');

class Trade extends BaseEvent {
    constructor(contract, provider, _interface, rabbitMQ, redis) {
        super(contract, provider, _interface);
        this.rabbitMQ = rabbitMQ;
        this.redis = redis;
    }

    subscribe() {
        info(`Trade subscriber ON`);
        this.contract.on(
            'Trade',
            (
                makerAddress,
                takerAddress,
                orderHash,
                makerFilledAmount,
                takerFilledAmount,
                takerFeePaid,
                makerFeeReceived,
                referralFeeReceived,
                event
            ) => {
                this.rabbitMQ.send(
                    TRADE,
                    JSON.stringify({
                        makerAddress,
                        takerAddress,
                        orderHash,
                        makerFilledAmount: makerFilledAmount.toString(),
                        takerFilledAmount: takerFilledAmount.toString(),
                        takerFeePaid: takerFeePaid.toString(),
                        makerFeeReceived: makerFeeReceived.toString(),
                        referralFeeReceived: referralFeeReceived.toString(),
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
            topics: [this.contract.interface.events.Trade.topic],
        };
        const logs = await this.provider.getLogs(filter);

        const events = logs.map(log => {
            const event = this.interface.parseLog(log);
            const values = event.values;
            return {
                makerAddress: values.makerAddress,
                takerAddress: values.takerAddress,
                orderHash: values.orderHash,
                makerFilledAmount: values.makerFilledAmount.toString(),
                takerFilledAmount: values.takerFilledAmount.toString(),
                takerFeePaid: values.takerFeePaid.toString(),
                makerFeeReceived: values.makerFeeReceived.toString(),
                referralFeeReceived: values.referralFeeReceived.toString(),
                txHash: log.transactionHash,
            };
        });

        return events;
    }
}

module.exports = Trade;
