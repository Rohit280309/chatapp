const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, "Please provide a valid username"]
    },
    email: {
        type: String,
        required: [true, "Please provide an email"],
        unique: true
    },
    logo: {
        type: String,
        default: "logo\\profile.png"
    },
    about: {
        type: String
    },
    contacts: [{
        type: String
    }],
    friendRequests: [{
        type: String
    }],
    password: {
        type: String,
        required: [true, "Please provide a valid password"]
    },
    date: {
        type: Date,
        default: Date.now
    },
    forgotPassword: String,
    verified: Boolean
});

const User = mongoose.model("User", userSchema);

module.exports = User;