'use strict';
const decoder = require('abi-decoder');
const { web3, weiDexContractAddress } = require('./utils');
const eventsAbiArray = require('./eventsAbi').getAbiArray();
const { info, debug } = require('./logger');
const rabbitMQ = require('./rabbit-mq');
const redis = require('./redis');
const eventsStorage = require('./mongodb');

module.exports = {
    init,
    process,
};

const {
    DEPOSIT_TOPIC,
    WITHDRAW_TOPIC,
    REFERRAL_DEPOSIT_TOPIC,
    TAKE_ORDER_TOPIC,
    CANCEL_ORDER_TOPIC,
    REFERRAL_BALANCE_TOPIC,
} = require('./eventTopics');

function init() {
    decoder.addABI(eventsAbiArray);
}

async function process() {
    const block = await _getLastBlock();
    let lastProcessedBlock = (await _getLastProcessedBlock()) - 15;

    info('[LAST PROCESSED BLOCK]', lastProcessedBlock);
    info('[LATEST BLOCK NUMBER]', block.number);
    if (lastProcessedBlock < block.number) {
        while (lastProcessedBlock < block.number) {
            await _processPastEventsFromBlockNumber(lastProcessedBlock + 1);
            lastProcessedBlock++;
        }

        await _updateLastProcessedBlock(block.number);
    }
}

async function _getLastProcessedBlock() {
    return parseInt(await redis.get('lastProcessedBlock'));
}

async function _updateLastProcessedBlock(newBlockNumber) {
    await redis.set('lastProcessedBlock', newBlockNumber);
}

async function _processPastEventsFromBlockNumber(blockNumber) {
    await _listenOn(DEPOSIT_TOPIC, rabbitMQ.sendDepositEvent, _constructDepositData, blockNumber);

    await _listenOn(
        WITHDRAW_TOPIC,
        rabbitMQ.sendWithdrawEvent,
        _constructWithdrawData,
        blockNumber
    );

    await _listenOn(
        TAKE_ORDER_TOPIC,
        rabbitMQ.sendTakeOrderEvent,
        _constructTakeOrderData,
        blockNumber
    );

    await _listenOn(
        CANCEL_ORDER_TOPIC,
        rabbitMQ.sendCancelOrderEvent,
        _constructCancelOrderData,
        blockNumber
    );

    await _listenOn(
        REFERRAL_BALANCE_TOPIC,
        rabbitMQ.sendReferralBalanceEvent,
        _constructReferralBalanceData,
        blockNumber
    );

    await _listenOn(
        REFERRAL_DEPOSIT_TOPIC,
        rabbitMQ.sendDepositWithReferralEvent,
        _constructReferralDepositData,
        blockNumber
    );
}

async function _getLastBlock() {
    return await web3.eth.getBlock('latest');
}

async function saveEvent(data) {
    const { blockNumber, ...dataToSave } = data;
    const event = await eventsStorage.findOne(dataToSave, { _id: 0 });
    if (event === null) {
        eventsStorage.create(dataToSave);
        return true;
    }

    return false;
}

function _listenOn(topic, send, constructData, blockNumber) {
    web3.eth
        .getPastLogs({
            address: weiDexContractAddress,
            topics: [topic],
            fromBlock: blockNumber,
            toBlock: blockNumber,
        })
        .then(eventsArr => {
            eventsArr.forEach(async result => {
                const eventData = _decodeEvent(result);
                const data = constructData(eventData);
                const persisted = await saveEvent(data);
                debug('[EVENT DATA]', data);
                if (persisted) {
                    info('[EVENT DATA]', data);
                    send(data);
                }
            });
        });
}

function _constructDepositData(eventData) {
    const basicData = _constructBasicObject(eventData);
    const depositData = {
        ...basicData,
        tokenAddress: eventData.events[0].value,
        userAddress: eventData.events[1].value,
        amount: eventData.events[2].value,
        balance: eventData.events[3].value,
    };

    return depositData;
}

function _constructWithdrawData(eventData) {
    const basicData = _constructBasicObject(eventData);
    const withdrawData = {
        ...basicData,
        tokenAddress: eventData.events[0].value,
        userAddress: eventData.events[1].value,
        amount: eventData.events[2].value,
        balance: eventData.events[3].value,
    };

    return withdrawData;
}

function _constructReferralDepositData(eventData) {
    const basicData = _constructBasicObject(eventData);
    const referralDepositData = {
        ...basicData,
        tokenAddress: eventData.events[0].value,
        referredAddress: eventData.events[1].value,
        referrerAddress: eventData.events[2].value,
        amount: eventData.events[3].value,
        balance: eventData.events[4].value,
    };

    return referralDepositData;
}

function _constructTakeOrderData(eventData) {
    const basicData = _constructBasicObject(eventData);
    const takeOrderData = {
        ...basicData,
        makerAddress: eventData.events[0].value,
        takerAddress: eventData.events[1].value,
        buyTokenAddress: eventData.events[2].value,
        sellTokenAddress: eventData.events[3].value,
        takerGivenAmount: eventData.events[4].value,
        takerReceivedAmount: eventData.events[5].value,
        orderHash: eventData.events[6].value,
        nonce: eventData.events[7].value,
    };

    return takeOrderData;
}

function _constructCancelOrderData(eventData) {
    const basicData = _constructBasicObject(eventData);
    const cancelOrderData = {
        ...basicData,
        makerBuyTokenAddress: eventData.events[0].value,
        makerSellTokenAddress: eventData.events[1].value,
        makerAddress: eventData.events[2].value,
        orderHash: eventData.events[3].value,
        nonce: eventData.events[4].value,
    };

    return cancelOrderData;
}

function _constructReferralBalanceData(eventData) {
    const basicData = _constructBasicObject(eventData);
    const referralBalanceData = {
        ...basicData,
        referrerAddress: eventData.events[0].value,
        referredAddress: eventData.events[1].value,
        tokenAddress: eventData.events[2].value,
        fullFeeAmount: eventData.events[3].value,
        referralFeeAmount: eventData.events[4].value,
    };

    return referralBalanceData;
}

function _constructBasicObject(eventData) {
    return {
        name: eventData.name,
        blockNumber: eventData.blockNumber,
        txHash: eventData.transactionHash,
    };
}

function _decodeEvent(eventResult) {
    const eventData = decoder.decodeLogs([eventResult]);
    eventData[0].blockNumber = eventResult.blockNumber;
    eventData[0].transactionHash = eventResult.transactionHash;

    return eventData[0];
}
