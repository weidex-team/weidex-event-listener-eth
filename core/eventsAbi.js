const contractAbi = require('./contractAbi');
const events = {};

contractAbi.forEach(element => {
    if (element.type === 'event') {
        events[element.name] = element;
    }
});

function getAbiArray() {
    const abiArray = [];
    for (const key in events) {
        abiArray.push(events[key]);
    }
    return abiArray;
}

module.exports = {
    getAbiArray,
};
