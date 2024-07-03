import { openDB } from 'idb';

const DB_NAME = 'chatDB';
const STORE_NAME = 'messages';
const STORE_NAME_2 = 'friend_requests';

export const initDB = async () => {
  const db = await openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
        store.createIndex('chatId', 'chatId'); // Index on chatId
        store.createIndex('date', 'date'); // Index on date for sorting
      }
      if (!db.objectStoreNames.contains(STORE_NAME_2)) {
        const store = db.createObjectStore(STORE_NAME_2, { keyPath: 'id', autoIncrement: true });
        store.createIndex('chatId', 'chatId'); // Index on chatId
      }
    },
  });

  return db;
};

export const addRequest = async (senderId: string) => {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME_2, 'readwrite');
  await tx.objectStore(STORE_NAME_2).add({ senderId });
  await tx.done;
};

export const getRequest = async () => {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME_2, 'readonly');
  const store = tx.objectStore(STORE_NAME_2);

  const allMessages = await store.getAll();

  await tx.done;
  return allMessages;
}

export const addMessage = async (chatId: string, message: MessageProps) => {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  await tx.objectStore(STORE_NAME).add({ ...message, chatId });
  await tx.done;
};

export const getMessages = async (chatId: string) => {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, 'readonly');
  const store = tx.objectStore(STORE_NAME);
  const index = store.index('chatId');

  const allMessages = await index.getAll(chatId);
  const sortedMessages = allMessages.sort((a, b) => b.date - a.date);

  await tx.done;
  return sortedMessages;
};

export const clearMessages = async (chatId: string) => {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const index = tx.objectStore(STORE_NAME).index('chatId');
  const messages = await index.getAll(chatId);
  for (const message of messages) {
    await tx.objectStore(STORE_NAME).delete(message.id);
  }
  await tx.done;
};

export const updateMessageStatus = async (chatId: string, messageId: string, status: string) => {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  const index = store.index('chatId');

  const messages = await index.getAll(chatId);
  const message = messages.find((msg) => msg.id === messageId);

  if (message) {
    message.status = status;
    await store.put(message);
  }

  await tx.done;
};

export const updateAllMessageStatus = async (chatId: string, status: string) => {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  const index = store.index('chatId');

  const messages = await index.getAll(chatId);
  for (const message of messages) {
    message.status = status;
    await store.put(message);
  }

  await tx.done;
};
