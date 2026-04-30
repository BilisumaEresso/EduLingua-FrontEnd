import api from './api';

export const getAllSections = async (params = {}) => {
  const res = await api.get('/section', { params });
  return res.data;
};

export const getSection = async (id) => {
  const res = await api.get(`/section/${id}`);
  return res.data;
};

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