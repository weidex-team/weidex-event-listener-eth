const mongoose = require('mongoose');
const { MONGODB_URI } = require('./config');
const { info } = require('./logger');

class MongoStorage {
    constructor() {
        mongoose.connect(MONGODB_URI, { useNewUrlParser: true });
        this.EventSchema = mongoose.Schema({ hash: { type: String } }, { versionKey: false });
        this.Event = mongoose.model('Event', this.EventSchema);
        this.EventSchema.index({ hash: 1 }, { unique: true });
    }

    async save(hash) {
        try {
            await this.Event.create({ hash });
            info(`Saved hash: ${hash}`);
            return true;
        } catch (err) {
            info(`Hash already present: ${hash}`);
            return false;
        }
    }
}

module.exports = MongoStorage;
