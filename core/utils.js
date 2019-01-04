const Web3 = require('web3');

const ethereumProvider = process.env.ETHEREUM_PROVIDER;
// Default provider is the same as the one used on staging
const web3 = new Web3(new Web3.providers.WebsocketProvider(ethereumProvider));

const abi = require('./contractAbi');
// Default contract address is the same as the one used on staging
const weiDexContractAddress =
    process.env.CONTRACT_ADDRESS || '0x8e6f2f71644dfec784dd1d1190a1cc3810092fc7';
const weiDexContract = new web3.eth.Contract(abi, weiDexContractAddress);

module.exports = {
    web3,
    weiDexContract,
    weiDexContractAddress,
};
