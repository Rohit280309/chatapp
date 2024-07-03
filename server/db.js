const mongoose = require("mongoose");

const connectToMongo = () => {
    mongoose.connect("mongodb://localhost:27017/chat")
    .then(() => console.log("Connected to Db"))
    .catch((err) => console.log(err));
}

module.exports = connectToMongo;