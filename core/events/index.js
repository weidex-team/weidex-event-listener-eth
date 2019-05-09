const Provider = require('../provider');
const Contract = require('../contract');

const Deposit = require('./deposit');
const Withdraw = require('./withdraw');
const Cancel = require('./cancel');
const Trade = require('./trade');

const { info } = require('../logger');

class Events {
    constructor(redis, rabbitMq) {
        this.redis = redis;
        this.rabbitMQ = rabbitMq;
        this.events = [Deposit, Withdraw, Cancel, Trade];
    }

    async init() {
        const provider = new Provider().getProvider();
        const _contract = new Contract(provider);
        const contract = _contract.getContract();
        const iface = _contract.getInterface();
        const lastProcessedBlock = await this.redis.getlastBlock();
        const currentBlockNumber = await provider.getBlockNumber();

        info(`Past events from ${lastProcessedBlock} to ${currentBlockNumber}`);

        for (const Event of this.events) {
            const e = new Event(contract, provider, iface, this.rabbitMQ, this.redis);
            await e.getPast(lastProcessedBlock - 1, currentBlockNumber);
            e.subscribe();
        }
    }
}

module.exports = Events;
