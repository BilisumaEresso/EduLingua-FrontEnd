import api from "./api"; // your axios instance

// ----------------------------
// User Progress API Service
// ----------------------------
const userProgressService = {
  // Get progress for user (all or specific learning track)
  getProgress: async (learningId) => {
    try {
      const response = await api.get("/progress", {
        params: learningId ? { learningId } : {},
      });
      return response.data; // contains user progress info
    } catch (error) {
      throw error;
    }
  },

  // Start a new learning track
  startLearningTrack: async (data) => {
    // data should match startLearningTrackSchema: { learningId: "..." }
    try {
      const response = await api.post("/progress/start", data);
      return response.data;
    } catch (error) {
      throw error;
    }
  }, 

  // Mark a lesson as completed
  markLessonCompleted: async (data) => {
    // data should match markLessonCompletedSchema: { learningId, lessonId }
    try {
      const response = await api.put("/progress/lesson-complete", data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Increment AI chat count
  incrementAIChat: async (data) => {
    // data should match incrementAIChatSchema: { learningId }
    try {
      const response = await api.put("/progress/ai-chat", data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete progress for a learning track
  deleteProgress: async (data) => {
    // data should match deleteProgressSchema: { learningId }
    try {
      const response = await api.delete("/progress/delete", { data });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default userProgressService;