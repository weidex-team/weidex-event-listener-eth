const Provider = require('../provider');
const Contract = require('../contract');

const Deposit = require('./deposit');
const Withdraw = require('./withdraw');
const Cancel = require('./cancel');
const Trade = require('./trade');

class Events {
    constructor(redis, rabbitMq) {
        this.redis = redis;
        this.rabbitMq = rabbitMq;
        this.events = [Deposit, Withdraw, Cancel, Trade];
    }

    init() {
        const provider = new Provider().getProvider();
        const _contract = new Contract(provider);
        const contract = _contract.getContract();
        const iface = _contract.getInterface();

        this.events.forEach(Event => {
            const e = new Event(contract, provider, iface, this.rabbitMq, this.redis);

            e.subscribe();
        });
    }
}

module.exports = Events;
