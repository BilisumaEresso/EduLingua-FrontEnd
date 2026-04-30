import api from './api';

export const saveGameProgress = async (data) => {
  const res = await api.post('/game/save', data);
  return res.data;
};

export const getGameProgress = async (gameType) => {
  const res = await api.get('/game/progress', { params: { gameType } });
  return res.data;
};
