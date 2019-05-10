const ethers = require('ethers');
const { CONTRACT_ADDRESS } = require('./config');
const abi = require('./abi');

class Contract {
    constructor(provider) {
        this.contract = new ethers.Contract(CONTRACT_ADDRESS, abi, provider);
        this.interface = new ethers.utils.Interface(abi);
    }

    getContract() {
        return this.contract;
    }

    getInterface() {
        return this.interface;
    }
}

module.exports = Contract;
