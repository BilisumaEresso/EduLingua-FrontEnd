import api from './api';

/**
 * Admin Service
 * Handles admin & super-admin operations
 */

// ======================
// 🔒 Super Admin Actions
// ======================

export const promoteUser = async (userId) => {
  const res = await api.put(`/admin/promote/${userId}`);
  return res.data;
};

export const demoteUser = async (userId) => {
  const res = await api.put(`/admin/demote/${userId}`);
  return res.data;
};

export const acceptTeacher = async (userId) => {
  const res = await api.put(`/admin/accept-teacher/${userId}`);
  return res.data;
};

export const rejectTeacher = async (userId) => {
  const res = await api.put(`/admin/reject-teacher/${userId}`);
  return res.data;
};

export const fireTeacher = async (userId) => {
  const res = await api.put(`/admin/fire-teacher/${userId}`);
  return res.data;
};

export const shutdownSystem = async () => {
  const res = await api.put('/admin/shut-system');
  return res.data;
};


// ======================
// 🧑‍💼 Admin & Super Admin
// ======================

export const getAllUsers = async () => {
  const res = await api.get('/admin/all-user');
  return res.data;
};

export const getUserById = async (userId) => {
  const res = await api.get(`/admin/user/${userId}`);
  return res.data;
};

export const getAllLessons = async () => {
  const res = await api.get('/admin/all-lesson');
  return res.data;
};

export const getAllQuizzes = async () => {
  const res = await api.get('/admin/all-quiz');
  return res.data;
};

export const getDashboardStats = async () => {
  const res = await api.get('/admin/dashboard-stats');
  return res.data;
};