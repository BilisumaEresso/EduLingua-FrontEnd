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

export const acceptTeacher = async (userId, data) => {
  const res = await api.put(`/admin/accept-teacher/${userId}`, data);
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

export const deleteUserPermanently = async (userId) => {
  const res = await api.delete(`/admin/user/delete/${userId}`);
  return res.data;
};

// ======================
// 🧑‍💼 Admin & Super Admin
// ======================
export const getAllLanguages  = async () => {
  const res = await api.get('/admin/all-langs');
  return res.data;
};

export const getAllUsers = async (page = 1, limit = 10) => {
  const res = await api.get(`/admin/all-user?page=${page}&limit=${limit}`);
  return res.data;
};

export const getUserById = async (userId) => {
  const res = await api.get(`/admin/user/${userId}`);
  return res.data;
};

export const getAllLessons = async (page = 1, limit = 10) => {
  const res = await api.get(`/admin/all-lesson?page=${page}&limit=${limit}`);
  return res.data;
};

export const getAllQuizzes = async (page = 1, limit = 10) => {
  const res = await api.get(`/admin/all-quiz?page=${page}&limit=${limit}`);
  return res.data;
};

export const getDashboardStats = async () => {
  const res = await api.get('/admin/dashboard-stats');
  return res.data;
};

export const updateUserInfo = async (userId, data) => {
  const res = await api.put(`/admin/user/update/${userId}`, data);
  return res.data;
};

export const togglePremium = async (userId) => {
  const res = await api.patch(`/admin/user/toggle-premium/${userId}`);
  return res.data;
};

export const enrollUserInTrack = async (userId, trackId) => {
  const res = await api.post(`/admin/user/enroll/${userId}`, { trackId });
  return res.data;
};

export const unenrollUserFromTrack = async (userId, trackId) => {
  const res = await api.delete(`/admin/user/unenroll/${userId}`, { data: { trackId } });
  return res.data;
};

export const getAllTracks = async () => {
  const res = await api.get('/admin/all-tracks');
  return res.data;
};