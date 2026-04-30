import api from './api';

export const getAllQuizzes = async (params = {}) => {
  const res = await api.get('/quiz', { params });
  return res.data;
};

export const getQuiz = async (id) => {
  const res = await api.get(`/quiz/${id}`);
  return res.data;
};

export const createQuiz = async (data) => {
  const res = await api.post('/quiz/create', data);
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

export const generateAIQuiz = async (data) => {
  const res = await api.post('/ai/quiz', data);
  return res.data;
};

export const saveQuiz = async (data) => {
  const res = await api.post('/quiz/save', data);
  return res.data;
};