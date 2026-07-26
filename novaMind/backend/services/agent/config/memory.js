import redis from "../../../shared/redis.js";
import { getMesssages } from "../utils/getMessages.js";

export const getMemory = async (conversationId) => {
  try {
    const key = `messages-${conversationId}`;

    const cached = await redis.get(key);

    if (cached) {
      return JSON.parse(cached);
    }

    const messages = await getMesssages(conversationId);

    return messages ?? [];
  } catch {
    return [];
  }
};

export const addMessage = async (conversationId, role, content) => {
  const key = `messages-${conversationId}`;

  const cached = await redis.get(key);
  const messages = cached ? JSON.parse(cached) : [];

  messages.push({ role, content });

  if (messages.length > 20) {
    messages.shift();
  }

  await redis.set(key, JSON.stringify(messages));
};