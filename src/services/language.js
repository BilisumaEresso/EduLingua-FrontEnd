import api from './api';

/**
 * Language Service
 * Handles language CRUD operations
 */


// ======================
// 🌍 Public Endpoints
// ======================

export const getAllLanguages = async () => {
  const res = await api.get('/lang');
  return res.data;
};

export const getLanguageById = async (id) => {
  const res = await api.get(`/language/${id}`);
  return res.data;
};


// ======================
// 🔒 Super Admin Only
// ======================

export const addLanguage = async (data) => {
  const res = await api.post('/language/add', data);
  return res.data;
};

export const updateLanguage = async (id, data) => {
  const res = await api.put(`/language/update/${id}`, data);
  return res.data;
};

export const deleteLanguage = async (id) => {
  const res = await api.delete(`/language/delete/${id}`);
  return res.data;
};