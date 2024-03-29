import * as WebSocket from 'websocket';
import * as http from 'http';

import './bootstrap';
import { Port } from './configs';
import { Client, Message, RegisterMessage, SendMessage } from './types';
import WinstonLogger from '@rosen-bridge/winston-logger/dist/WinstonLogger';

const logger = WinstonLogger.getInstance().getLogger(import.meta.url);

const clients: { [id: string]: Client } = {};

const handleMessage = (
  messageObj: WebSocket.Message,
  connection: WebSocket.connection,
  info: { id: string },
) => {
  if (messageObj.type === 'binary') {
    logger.warn(`Binary message arrived from ${info.id} but not accepted`);
    return;
  }
  try {
    logger.info(`new message arrived ${messageObj.utf8Data}`);
    const message: Message = JSON.parse(messageObj.utf8Data) as Message;
    if (message.action === 'register') {
      // register new client
      const payload = message.payload as RegisterMessage;
      clients[payload.id] = {
        id: payload.id,
        connection: connection,
        secret: payload.secret,
      };
      info.id = payload.id;
      connection.sendUTF(JSON.stringify({ sender: '' }));
    } else if (message.action === 'send') {
      const payload = message.payload as SendMessage;
      if (Object.hasOwn(clients, payload.client)) {
        const client = clients[payload.client];
        if (client.secret === payload.secret) {
          client.connection.sendUTF(
            JSON.stringify({
              sender: info.id,
              pageId: payload.pageId,
              content: payload.content,
            }),
          );
        }
      } else {
        logger.warn(
          `message arrived from ${info.id} but receiver not registered yet`,
        );
      }
    }
  } catch (exp) {
    console.log(`an error occurred ${exp}`);
  }
};

const handleConnection = (request: WebSocket.request) => {
  console.log(new Date() + ' Connection from origin ' + request.origin + '.');

  // accept connection - you should check 'request.origin' to make sure that
  // client is connecting from your website
  // (http://en.wikipedia.org/wiki/Same_origin_policy)
  const connection = request.accept(null, request.origin);

  console.log(new Date() + ' Connection accepted.');
  const myInfo = {
    id: '',
  };
  // user sent some message
  connection.on('message', (messageObj) =>
    handleMessage(messageObj, connection, myInfo),
  );

  // user disconnected
  connection.on('close', () => {
    if (myInfo.id) {
      console.log(`${new Date()} Peer ${myInfo.id} disconnected`);
      delete clients[myInfo.id];
    }
  });
};

const main = async () => {
  const server = http.createServer(() => {
    // Not important for us. We're writing WebSocket server, not HTTP server
  });
  server.listen(Port, '0.0.0.0', function () {
    console.log(new Date() + ' Server is listening on port ' + Port);
  });

  const wsServer = new WebSocket.server({
    httpServer: server,
  });

  wsServer.on('request', handleConnection);
};

main().then(() => null);
