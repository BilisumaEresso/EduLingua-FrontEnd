import api from './api';

/**
 * Teacher Service
 * Handles teacher-specific dashboard and track management
 */

export const getTeacherStats = async () => {
  const res = await api.get('/teacher/stats');
  return res.data;
};

export const getTeacherTrack = async () => {
  const res = await api.get('/teacher/track');
  return res.data;
};

export const getTeacherStudents = async () => {
  const res = await api.get('/teacher/students');
  return res.data;
};

export const getStudentDetail = async (id) => {
  const res = await api.get(`/teacher/students/${id}`);
  return res.data;
};
