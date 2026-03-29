import api from './api';

/**
 * AI Content Service
 * Handles AI-driven curriculum generation
 */

export const generateSections = async (data) => {
  // data: { lessonId, maxSections }
  const res = await api.post('/ai/sections', data);
  return res.data;
};

export const generateQuiz = async (data) => {
  // data: { lessonId }
  const res = await api.post('/ai/quiz', data);
  return res.data;
};

const aiService = {
  generateSections,
  generateQuiz,
};

export default aiService;
