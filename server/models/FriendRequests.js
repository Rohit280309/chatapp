const mongoose = require("mongoose");

const friendRequests = new mongoose.Schema({
    senderId: {
        type: String,
        required: true
    },
    receiverId: {
        type: String,
        required: true
    },
    event: {
        type: String
    }
});

const FriendRequests = mongoose.model("FriendRequests", friendRequests);

module.exports = FriendRequests;