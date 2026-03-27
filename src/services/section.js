import api from './api';

/**
 * Section Service
 * Handles section CRUD operations and bulk creation
 */


// ======================
// 🌍 Public Endpoints
// ======================

export const getAllSections = async (params = {}) => {
  // supports ?lessonId=...
  const res = await api.get('/section', { params });
  return res.data;
};

export const getSectionById = async (id) => {
  const res = await api.get(`/section/${id}`);
  return res.data;
};


// ======================
// 🔒 Super Admin Only
// ======================

export const createSection = async (data) => {
  const res = await api.post('/section/create', data);
  return res.data;
};

export const createSectionsBulk = async (data) => {
  const res = await api.post('/section/bulk', data);
  return res.data;
};

export const updateSection = async (id, data) => {
  const res = await api.put(`/section/update/${id}`, data);
  return res.data;
};

export const deleteSection = async (id) => {
  const res = await api.delete(`/section/delete/${id}`);
  return res.data;
};