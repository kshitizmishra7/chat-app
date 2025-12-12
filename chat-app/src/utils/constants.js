// Application constants

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000'

export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  THEME: 'theme',
  LANGUAGE: 'language',
}

export const SOCKET_EVENTS = {
  // Connection events
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  CONNECT_ERROR: 'connect_error',

  // User events
  JOIN: 'join',
  USER_JOINED: 'userJoined',
  USER_LEFT: 'userLeft',
  USER_TYPING: 'userTyping',
  USER_STOPPED_TYPING: 'userStoppedTyping',

  // Message events
  MESSAGE: 'message',
  MESSAGE_SENT: 'messageSent',
  MESSAGE_RECEIVED: 'messageReceived',
  MESSAGE_READ: 'messageRead',
  MESSAGE_DELETED: 'messageDeleted',
  MESSAGE_UPDATED: 'messageUpdated',

  // Chat events
  CHAT_CREATED: 'chatCreated',
  CHAT_UPDATED: 'chatUpdated',
  CHAT_DELETED: 'chatDeleted',
}

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
}

export const MESSAGE_TYPES = {
  TEXT: 'text',
  IMAGE: 'image',
  FILE: 'file',
  SYSTEM: 'system',
}

export const CHAT_TYPES = {
  PRIVATE: 'private',
  GROUP: 'group',
}


