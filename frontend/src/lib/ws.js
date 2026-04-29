import { baseURL } from './api.js';

let client = null;
let connectedPromise = null;
const activeSubs = new Map();

const subscribeOnClient = (destination, entry) => {
  entry.sub = client.subscribe(destination, (frame) => {
    let payload = null;
    try {
      payload = frame.body ? JSON.parse(frame.body) : null;
    } catch {
      payload = frame.body;
    }
    entry.handler(payload);
  });
};

export const connectWs = () => {
  if (connectedPromise) return connectedPromise;

  client = new StompJs.Client({
    webSocketFactory: () => new SockJS(`${baseURL}/chat`),
    connectHeaders: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
    reconnectDelay: 5000,
  });

  connectedPromise = new Promise((resolve, reject) => {
    client.onConnect = () => {
      activeSubs.forEach((entry, destination) => {
        subscribeOnClient(destination, entry);
      });
      resolve();
    };
    client.onStompError = (frame) => {
      reject(new Error(frame.headers.message || 'STOMP error'));
    };
  });

  client.activate();
  return connectedPromise;
};

export const disconnectWs = () => {
  if (!client) return Promise.resolve();
  activeSubs.clear();
  const c = client;
  client = null;
  connectedPromise = null;
  return c.deactivate();
};

const subscribeRaw = (destination, handler) => {
  const entry = { handler, sub: null };
  activeSubs.set(destination, entry);
  if (client && client.connected) {
    subscribeOnClient(destination, entry);
  }
  return () => {
    activeSubs.delete(destination);
    if (entry.sub) entry.sub.unsubscribe();
  };
};

export const subscribeChannel = (channelId, handler) =>
  subscribeRaw(`/topic/channel/${channelId}`, handler);

export const subscribeErrors = (handler) =>
  subscribeRaw('/user/queue/errors', handler);

const publish = (destination, body) => {
  if (!connectedPromise) {
    return Promise.reject(new Error('WebSocket not connected'));
  }
  return connectedPromise.then(() => {
    if (!client || !client.connected) {
      throw new Error('WebSocket not connected');
    }
    client.publish({
      destination,
      body: body === undefined ? '' : JSON.stringify(body),
    });
  });
};

export const wsSendMessage = (channelId, body) =>
  publish(`/app/message/${channelId}/send`, body);

export const wsUpdateMessage = (channelId, messageId, body) =>
  publish(`/app/message/${channelId}/${messageId}/update`, body);

export const wsDeleteMessage = (channelId, messageId) =>
  publish(`/app/message/${channelId}/${messageId}/delete`);

export const wsPinMessage = (channelId, messageId) =>
  publish(`/app/message/${channelId}/${messageId}/pin`);

export const wsUnpinMessage = (channelId, messageId) =>
  publish(`/app/message/${channelId}/${messageId}/unpin`);

export const wsReactMessage = (channelId, messageId, react) =>
  publish(`/app/message/${channelId}/${messageId}/react`, { react });

export const wsUnreactMessage = (channelId, messageId, react) =>
  publish(`/app/message/${channelId}/${messageId}/unreact`, { react });
