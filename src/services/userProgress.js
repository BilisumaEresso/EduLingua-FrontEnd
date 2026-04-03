import api from "./api"; // your axios instance

// ----------------------------
// User Progress API Service
// ----------------------------
const userProgressService = {
  // Get progress for user (all or specific learning track)
  getProgress: async (learningIdOrObj) => {
    const learningId =
      typeof learningIdOrObj === "string"
        ? learningIdOrObj
        : learningIdOrObj?.learningId

    const response = await api.get("/progress", {
      params: learningId ? { learningId } : {},
    });
    return response.data // contains user progress info
  },

  // Start a new learning track
  startLearningTrack: async (data) => {
    // data should match startLearningTrackSchema: { learningId: "..." }
    const response = await api.post("/progress/start", data);
    console.log(response);
    return response.data
  },

  // Mark a lesson as completed
  markLessonCompleted: async (data) => {
    const response = await api.put("/progress/lesson-complete", data);
    return response.data
  },

  // Start a quiz attempt for a level
  quizStartAttempt: async (data) => {
    // data: { learningId, levelId, questionCount? }
    const response = await api.post("/progress/quiz/start", data);
    console.log(response);
    return response.data
  },

  // Submit quiz answers for an attempt
  quizSubmitAttempt: async (data) => {
    // data: { learningId, levelId, attemptId, answers: [{questionId, answer}], durationMs? }
    const response = await api.post("/progress/quiz/submit", data);
    return response.data
  },

  // Legacy: Mark a level as completed (old flow)
  markLevelCompleted: async (data) => {
    const response = await api.put("/progress/level-complete", data);
    return response.data
  },

  // Increment AI chat count
  incrementAIChat: async (data) => {
    // data should match incrementAIChatSchema: { learningId }
    const response = await api.put("/progress/ai-chat", data);
    return response.data
  },

  // Delete progress for a learning track
  deleteProgress: async (data) => {
    // data should match deleteProgressSchema: { learningId }
    const response = await api.delete("/progress/delete", { data });
    return response.data
  },
};

export default userProgressService;