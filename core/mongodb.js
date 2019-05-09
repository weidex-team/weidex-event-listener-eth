const mongoose = require('mongoose');
const { MONGODB_URI } = require('./config');
const { info } = require('./logger');

class MongoStorage {
    constructor() {
        mongoose.connect(MONGODB_URI, { useNewUrlParser: true });
        this.EventSchema = mongoose.Schema({}, { strict: false, versionKey: false });
        this.event = mongoose.model('Event', this.EventSchema);
    }

    async save(data) {
        const result = await this.event.findOne(data, { _id: 0 });
        if (result === null) {
            info(`Saved hash: ${data}`);

            this.event.create(data);
            return true;
        }
        info(`Hash already present: ${data}`);
        return false;
    }
}

module.exports = MongoStorage;
