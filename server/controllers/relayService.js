const UnsendMessages = require("../models/UnsendMessages");

const relay = async (ws, clientId) => {

    try {
        ws.client = clientId;
        const unSendMessages = await UnsendMessages.find({ receiverId: clientId });
        unSendMessages.forEach(message => {
            const messageData = {
                senderId: message.senderId,
                data: {
                    message: message.message,
                    date: message.date,
                },
                type: "msg"
            };
            ws.send(JSON.stringify(messageData));
        });

        await UnsendMessages.deleteMany({ receiverId: clientId })

    } catch (error) {
        console.error('Error:', err);
    }

}

module.exports = { relay };