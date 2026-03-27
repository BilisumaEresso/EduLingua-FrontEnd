import api from './api';

/**
 * Lesson Service
 * Handles lesson CRUD operations
 */


// ======================
// 🌍 Public Endpoints
// ======================

export const getAllLessons = async (params = {}) => {
  // supports ?levelId=...
  const res = await api.get('/lesson', { params });
  return res.data;
};

export const getLessonById = async (id) => {
  const res = await api.get(`/lesson/${id}`);
  return res.data;
};


// ======================
// 🔒 Super Admin Only
// ======================

export const createLesson = async (data) => {
  const res = await api.post('/lesson/create', data);
  return res.data;
};

export const updateLesson = async (id, data) => {
  const res = await api.put(`/lesson/update/${id}`, data);
  return res.data;
};

export const deleteLesson = async (id) => {
  const res = await api.delete(`/lesson/delete/${id}`);
  return res.data;
};