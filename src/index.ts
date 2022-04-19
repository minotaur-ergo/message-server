import * as WebSocket from 'websocket';
import * as http from 'http';
import { Client, Message, RegisterMessage, SendMessage } from "./types";

const webSocketsServerPort = 6486;
const clients: {[id: string]: Client} = {};

const server = http.createServer(function (request, response) {
    // Not important for us. We're writing WebSocket server, not HTTP server
});
server.listen(webSocketsServerPort, function () {
    console.log((new Date()) + " Server is listening on port " + webSocketsServerPort);
});

const wsServer = new WebSocket.server({
    httpServer: server
});

// This callback function is called every time someone
// tries to connect to the WebSocket server
wsServer.on('request', function (request) {
    console.log((new Date()) + ' Connection from origin ' + request.origin + '.');

    // accept connection - you should check 'request.origin' to make sure that
    // client is connecting from your website
    // (http://en.wikipedia.org/wiki/Same_origin_policy)
    let connection = request.accept(null, request.origin);

    console.log((new Date()) + ' Connection accepted.');
    let myInfo = {
        id: ""
    }
    // user sent some message
    connection.on('message', function (messageObj) {
        if (messageObj.type === 'utf8') { // accept only text
            try {
                const message: Message = JSON.parse(messageObj.utf8Data) as Message;
                if (message.action === 'register') {
                    // register new client
                    const payload = message.payload as RegisterMessage
                    clients[payload.id] = {
                        id: payload.id,
                        connection: connection,
                        secret: payload.secret
                    }
                    myInfo.id = payload.id
                } else if (message.action === 'send') {
                    const payload = message.payload as SendMessage;
                    if (clients.hasOwnProperty(payload.client)) {
                        const client = clients[payload.client];
                        if (client.secret === payload.secret) {
                            client.connection.sendUTF(JSON.stringify({
                                sender: myInfo.id,
                                payload: message.payload
                            }))
                        }
                    }

                }
            } catch (exp) {

            }
        }
    });

    // user disconnected
    connection.on('close', function (connection) {
        if (myInfo.id) {
            console.log(`${new Date()} Peer ${myInfo.id} disconnected`)
            delete clients[myInfo.id]
        }
    });
});