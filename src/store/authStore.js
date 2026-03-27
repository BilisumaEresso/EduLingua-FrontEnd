import { create } from 'zustand';
import * as authService from '../services/auth';

const getStoredUser = () => {
  try {
    const userStr = localStorage.getItem('user');
    if (!userStr || userStr === 'undefined') return null;
    return JSON.parse(userStr);
  } catch (e) {
    return null;
  }
};

const useAuthStore = create((set) => ({
  user: getStoredUser(),
  isAuthenticated: !!localStorage.getItem('token'),
  isLoading: true, // Typically App.jsx handles completing the check auth load
  
  checkAuth: async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token');
      
      const res = await authService.getCurrentUser();
      const userData = res.data?.user || res.user || getStoredUser();
      
      set({ user: userData, isAuthenticated: true, isLoading: false });
    } catch (error) {
      authService.logout();
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  login: async (credentials) => {
    const res = await authService.login(credentials);
    const userData = res.data?.user || res.user || getStoredUser();
    
    set({ user: userData, isAuthenticated: true });
    return res;
  },

  signup: async (userData) => {
    const res = await authService.signup(userData);
    const userDataStore = res.data?.user || res.user || getStoredUser();
    
    set({ user: userDataStore, isAuthenticated: true });
    return res;
  },

  logout: () => {
    authService.logout();
    set({ user: null, isAuthenticated: false });
  }
}));

// Global listener for 401s handled by auth service and api interceptors
window.addEventListener('auth-unauthorized', () => {
  useAuthStore.setState({ user: null, isAuthenticated: false, isLoading: false });
});

export default useAuthStore;
