const mongoose = require('mongoose');
const mongoUrl = process.env.MONGODB_URI;

mongoose.connect(mongoUrl, { useNewUrlParser: true });

const EventSchema = mongoose.Schema(
    {},
    {
        strict: false,
        versionKey: false,
    }
);

const event = mongoose.model('Event', EventSchema);

module.exports = event;
