const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectToMongo = require("./db");
const app = express();
const { WebSocketServer, WebSocket } = require("ws");
const path = require('path');

const port = process.env.PORT;

connectToMongo();
app.use(express.json());
app.use(cors());
app.use(cookieParser());

app.use('/logo', express.static(path.join(__dirname, 'uploads/profileImages')));

app.use("/api", require("./routes/auth"))
app.use("/api", require("./routes/user"))

app.listen(port, () => {
    console.log(`App started on port ${port}`);
})
