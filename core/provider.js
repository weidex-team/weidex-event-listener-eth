const ethers = require('ethers');
const { PROVIDER_URL, NETWORK } = require('../core/config');

class Provider {
    constructor() {
        this.provider = new ethers.providers.JsonRpcProvider(PROVIDER_URL, NETWORK);
    }

    getProvider() {
        return this.provider;
    }
}

module.exports = Provider;
