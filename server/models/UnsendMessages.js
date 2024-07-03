const mongoose = require("mongoose");

const unsendMessages = new mongoose.Schema({
    senderId: {
        type: String,
        required: true
    },
    receiverId: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    date: {
        type: Date
    }
});

const UnsendMessages = mongoose.model("UnsendMessages", unsendMessages);

module.exports = UnsendMessages;