import api from './api';

/**
 * Chat Service
 * Handles AI chat sessions at /chat/*
 */

// GET /chat/my-chat — get or create the user's chat session
export const getMyChat = async () => {
  const res = await api.get('/chat/my-chat');
  return res.data;
};

// POST /chat/send — send a message to the AI
// data: { message: string, sessionId?: string }
export const sendMessage = async (data) => {
  const res = await api.post('/chat/send', data);
  return res.data;
};

// PUT /chat/update/:id — update AI memory/context for a session
export const updateMemory = async (id, data) => {
  const res = await api.put(`/chat/update/${id}`, data);
  return res.data;
};

// DELETE /chat/delete/:id — delete a chat session
export const deleteSession = async (id) => {
  const res = await api.delete(`/chat/delete/${id}`);
  return res.data;
};
