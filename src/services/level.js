import api from './api';

/**
 * Level Service
 * Handles level CRUD operations
 */


// ======================
// 🌍 Public Endpoints
// ======================

export const getAllLevels = async (params = {}) => {
  // supports query like ?learningId=...
  const res = await api.get('/level', { params });
  return res.data;
};

export const getLevelById = async (id) => {
  const res = await api.get(`/level/${id}`);
  return res.data;
};


// ======================
// 🔒 Super Admin Only
// ======================

export const createLevel = async (data) => {
  const res = await api.post('/level/create', data);
  return res.data;
};

export const updateLevel = async (id, data) => {
  const res = await api.put(`/level/update/${id}`, data);
  return res.data;
};

export const deleteLevel = async (id) => {
  const res = await api.delete(`/level/delete/${id}`);
  return res.data;
};