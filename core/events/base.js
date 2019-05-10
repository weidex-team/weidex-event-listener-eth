class BaseEvent {
    constructor(contract, provider, _interface) {
        this.contract = contract;
        this.provider = provider;
        this.interface = _interface;
    }
}

module.exports = BaseEvent;
