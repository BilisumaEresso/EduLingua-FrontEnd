import { create } from 'zustand';
import api from '../services/api';
import userProgressService from '../services/userProgress';

const useLearningStore = create((set, get) => ({
  tracks: [],
  currentTrack: null,
  recentProgress: null,
  isLoading: false,

  fetchTracks: async () => {
    set({ isLoading: true });
    try {
      const { data } = await api.get('/learning');
      set({ tracks: data.tracks, isLoading: false });
    } catch (error) {
      console.error(error);
      set({ isLoading: false });
    }
  },

  fetchProgress: async () => {
    try {
      const { data } = await userProgressService.getProgress()
      set({ recentProgress: data.progress });
    } catch (error) {
      console.error(error);
    }
  }
}));

export default useLearningStore;
