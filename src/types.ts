import * as WebSocket from "websocket";

export interface RegisterMessage {
    id: string;
    secret: string;
}

export interface SendMessage{
    client: string;
    secret: string;
    content: string;
    pageId: string;
}

export interface Message {
    action: "register" | "send";
    payload: RegisterMessage | SendMessage
}

export interface Client {
    id: string;
    connection: WebSocket.connection,
    secret: string
}
