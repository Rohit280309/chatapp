const express = require('express');
const { createServer } = require('http');
const { WebSocketServer, WebSocket } = require('ws');
const jwt = require('jsonwebtoken');
const {
  connectRedis,
  addClientToServer,
  removeClientFromServer,
  getClientStatus,
  getClientServer
} = require('./websocketManager');
const UnsendMessages = require('../models/UnsendMessages');
const connectToMongo = require('../db');
const { relay } = require('./relayService');
const FriendRequests = require('../models/FriendRequests');

const app = express();
const httpServer = createServer(app);

connectToMongo();

const wss = new WebSocketServer({ server: httpServer });

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

const clients = {};

(async () => {
  await connectRedis();

  wss.on('connection', (ws, req) => {
    let clientId; // Current User or Message Sender
    const serverId = process.env.SERVER_ID || 'server1';
    const token = new URL(req.url, `http://${req.headers.host}`).searchParams.get('token');

    if (!token) {
      ws.close(4000, 'No token provided');
      return;
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      clientId = decoded.user.id;
      relay(ws, clientId);
    } catch (err) {
      ws.close(4001, 'Invalid token');
      return;
    }

    addClientToServer(clientId, serverId);

    ws.on('message', async (message) => {
      try {
        const messageData = JSON.parse(message);

        if (messageData.type === 'video-call') {
          console.log("MessageData", messageData);
          if (messageData.event === "video-call") {
            const { receiverId } = messageData;
            wss.clients.forEach((client) => {
              if (client.readyState === WebSocket.OPEN && client.clientId === receiverId) {
                client.send(JSON.stringify({ type: 'video-call', callerId: clientId }));
              }
            });
          } else if (messageData.event === "reject-call") {
            console.log("RejectData", messageData);
            const { receiverId } = messageData;
            wss.clients.forEach((client) => {
              if (client.readyState === WebSocket.OPEN && client.clientId === receiverId) {
                client.send(JSON.stringify({ type: 'reject-call', callerId: clientId }));
              }
            });
          }
        } else if (messageData.type === 'offer' || messageData.type === 'answer' || messageData.type === 'ice-candidate') {

          const { receiverId } = messageData;
          wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN && client.clientId === receiverId) {
              client.send(JSON.stringify(messageData));
            }
          });
        } else if (messageData.type === "request") {

          const { senderId, receiverId } = messageData;
          console.log(senderId, receiverId);
          if (messageData.event === "proposal") {
            const status = await getClientStatus(receiverId);
            if (!status) {
              const request = FriendRequests({
                senderId: senderId,
                receiverId: receiverId,
                event: "proposal"
              });
              await request.save();
            } else {
              wss.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN && client.clientId === receiverId) {
                  client.send(JSON.stringify(messageData));
                }
              });
            }
          }

        } else {
          const recipientId = messageData.recipientId;
          const data = messageData.data;
          const senderId = messageData.senderId;
          const status = await getClientStatus(recipientId);
          if (!status) {
            const unsend = new UnsendMessages({
              senderId: senderId,
              receiverId: recipientId,
              message: data.message,
              date: data.date
            });
            await unsend.save();
          } else {
            wss.clients.forEach((client) => {
              if (client.readyState === WebSocket.OPEN && client.clientId === recipientId) {
                const messageData = { senderId, data, type: "msg" };
                client.send(JSON.stringify(messageData));
                ws.send(JSON.stringify({
                  status: 'received',
                  senderId,
                  recipientId,
                  messageId: data._id,
                  data: data,
                  type: "ack"
                }));
              }
            });
          }
        }
      } catch (err) {
        console.error('Error handling message:', err);
      }
    });

    ws.on('close', async () => {
      await removeClientFromServer(clientId);
    });

    ws.clientId = clientId;
    ws.send(JSON.stringify({ message: 'Welcome to the WebSocket server!', clientId }));
  });

  const PORT = process.env.WS_PORT || 8080;
  httpServer.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
  });
})();
