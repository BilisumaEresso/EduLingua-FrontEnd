import api from './api';

/**
 * Quiz Service
 * Handles quiz CRUD operations and question pool management
 */

export const getAllQuizzes = async (params = {}) => {
  // supports ?lessonId=...
  const res = await api.get('/quiz', { params });
  return res.data;
};

export const getQuizById = async (id) => {
  const res = await api.get(`/quiz/${id}`);
  return res.data;
};

export const getQuizRandomQuestions = async (id, count = 5) => {
  const res = await api.get(`/quiz/${id}/random`, { params: { count } });
  return res.data;
};

// ======================
// 🔒 Super Admin Only
// ======================

export const createQuiz = async (data) => {
  const res = await api.post('/quiz/create', data);
  return res.data;
};

export const saveQuiz = async (data) => {
  const res = await api.post('/quiz/save', data);
  return res.data;
};

export const updateQuiz = async (id, data) => {
  const res = await api.put(`/quiz/update/${id}`, data);
  return res.data;
};

export const deleteQuiz = async (id) => {
  const res = await api.delete(`/quiz/delete/${id}`);
  return res.data;
};