import api from './api';

/**
 * Auth Service
 * Handles authentication, user state, and account actions
 */

// ======================
// 🧰 Helpers (LocalStorage)
// ======================

const setAuthData = (data) => {
  if (data?.token) {
    localStorage.setItem('token', data.token);
  }
  if (data?.user) {
    localStorage.setItem('user', JSON.stringify(data.user));
  }
};

const clearAuthData = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};


// ======================
// 🔓 Public Endpoints
// ======================

export const signup = async (data) => {
  const res = await api.post('/auth/signup', data);

  // store token + user
  setAuthData(res.data.data);

  return res.data;
};

export const login = async (data) => {
  const res = await api.post('/auth/login', data);

  // store token + user
  setAuthData(res.data.data);

  return res.data;
};


// ======================
// 🔐 Protected Endpoints
// ======================

export const getCurrentUser = async () => {
  const res = await api.get('/auth/me');

  // keep user in sync
  if (res.data?.data?.user) {
    localStorage.setItem('user', JSON.stringify(res.data.data.user));
  }

  return res.data;
};

export const updateUser = async (data) => {
  const res = await api.put('/auth/update', data);

  // update stored user
  if (res.data?.data?.user) {
    localStorage.setItem('user', JSON.stringify(res.data.data.user));
  }

  return res.data;
};

export const changePassword = async (data) => {
  const res = await api.put('/auth/change-password', data);
  return res.data;
};

export const deleteAccount = async () => {
  const res = await api.delete('/auth/delete');

  // clear auth after deletion
  clearAuthData();

  return res.data;
};


// ======================
// 💎 Premium / Teacher
// ======================

export const upgradeToPremium = async (data) => {
  const res = await api.put('/auth/premium', data);

  // update user (role/subscription change)
  if (res.data?.data?.user) {
    localStorage.setItem('user', JSON.stringify(res.data.data.user));
  }

  return res.data;
};

export const applyForTeacher = async (data) => {
  const res = await api.post('/auth/teacher/apply', data);
  return res.data;
};

export const unsubscribePremium = async (data) => {
  const res = await api.post('/auth/unsubscribe', data);

  // update user
  if (res.data?.data?.user) {
    localStorage.setItem('user', JSON.stringify(res.data.data.user));
  }

  return res.data;
};


// ======================
// 🚪 Logout (Frontend Only)
// ======================

export const logout = () => {
  clearAuthData();

  // trigger global logout handling if needed
  window.dispatchEvent(new Event('auth-unauthorized'));
};