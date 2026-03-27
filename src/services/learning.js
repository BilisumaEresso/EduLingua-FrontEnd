import api from './api';

/**
 * Learning Service
 * Handles learning resource CRUD operations
 */


// ======================
// 🌍 Public Endpoints
// ======================

export const getAllLearnings = async () => {
  const res = await api.get('/learning');
  return res.data;
};

export const getLearningById = async (id) => {
  const res = await api.get(`/learning/${id}`);
  return res.data;
};


// ======================
// 🔒 Super Admin Only
// ======================

export const createLearning = async (data) => {
  const res = await api.post('/learning/create', data);
  return res.data;
};

export const updateLearning = async (id, data) => {
  const res = await api.put(`/learning/update/${id}`, data);
  return res.data;
};

export const deleteLearning = async (id) => {
  const res = await api.delete(`/learning/delete/${id}`);
  return res.data;
};