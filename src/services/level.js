import api from './api';

export const getAllLevels = async (params) => {
  const res = await api.get('/level', { params });
  return res.data;
};

export const getLevel = async (id) => {
  const res = await api.get(`/level/${id}`);
  return res.data;
};

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

export const toggleLevelStatus = async (id) => {
  const res = await api.patch(`/level/toggle-status/${id}`);
  return res.data;
};

export const deleteLevelPermanently = async (id) => {
  const res = await api.delete(`/level/delete-permanent/${id}`);
  return res.data;
};