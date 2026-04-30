import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: 'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── Config helpers ────────────────────────────────────────────────────────────

/**
 * Per-route toast config.
 * Key: "<METHOD>:<url-substring>"  (url is matched with includes())
 *
 * silent:        never show any toast for this route (success or error)
 * silentErrors:  only suppress the error toast (success still shows if needed)
 * silentSuccess: suppress only the success toast
 */
const ROUTE_TOAST_CONFIG = {
  // Progress reads — new users always get 404; never toast that
  'get:/progress':           { silent: true },

  // Background / high-frequency mutations — no success toast needed
  'put:/progress/lesson-complete': { silentSuccess: true },
  'put:/progress/ai-chat':         { silentSuccess: true },
  'put:/progress/level-complete':  { silentSuccess: true },

  // Quiz start / submit — page handles its own feedback
  'post:/progress/quiz/start':  { silent: true },
  'post:/progress/quiz/submit': { silentSuccess: true },

  // Auth GET (checkAuth on load) — silent
  'get:/auth/me': { silent: true },

  // Chat message send — page shows the reply inline, no toast needed
  'post:/chat': { silentSuccess: true },

  // Teacher content mutations — TrackEditor & LessonContentEditor show contextual toasts
  'post:/level':   { silentSuccess: true },
  'delete:/level': { silentSuccess: true },
  'post:/lesson':  { silentSuccess: true },
  'delete:/lesson': { silentSuccess: true },
  'post:/section':   { silentSuccess: true },
  'put:/section':    { silentSuccess: true },
  'delete:/section': { silentSuccess: true },

  // Admin mutations — pages show contextual toasts
  'put:/admin/shut-system':      { silentSuccess: true },
  'put:/admin/accept-teacher':   { silentSuccess: true },
  'put:/admin/reject-teacher':   { silentSuccess: true },
};

/**
 * Error messages that are "expected" and should NEVER be shown to the user.
 * These are operational messages that are handled gracefully in the UI.
 */
const SILENT_ERROR_MESSAGES = new Set([
  'progress not found',
  'no progress found',
  'not found',           // generic 404 for background reads
]);

/**
 * HTTP status codes whose errors are handled at a system level
 * and should not additionally show a per-request toast.
 */
const SYSTEM_HANDLED_STATUSES = new Set([401, 503]);

// ─── Helpers ───────────────────────────────────────────────────────────────────

const getRouteConfig = (config) => {
  const method = config?.method?.toLowerCase() ?? '';
  const url = config?.url ?? '';
  const key = `${method}:${url}`;

  for (const [pattern, cfg] of Object.entries(ROUTE_TOAST_CONFIG)) {
    if (key.includes(pattern) || url.includes(pattern.split(':')[1])) {
      return cfg;
    }
  }
  return {};
};

const isSilentErrorMessage = (message = '') =>
  SILENT_ERROR_MESSAGES.has(message.trim().toLowerCase());

// ─── Request interceptor — attach token ────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response interceptor — smart toasting ────────────────────────────────────
api.interceptors.response.use(
  (response) => {
    const routeCfg = getRouteConfig(response.config);
    const isWrite = response.config?.method !== 'get';
    const message = response.data?.message;

    // Only toast success for non-GET requests that have a message,
    // and only when the route isn't marked silent/silentSuccess.
    if (isWrite && message && !routeCfg.silent && !routeCfg.silentSuccess) {
      toast.success(message);
    }

    return response;
  },
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || error.response?.data?.error || '';
    const routeCfg = getRouteConfig(error.config);

    // 401 & 503 are handled globally (logout / maintenance screen)
    if (status === 401) {
      localStorage.removeItem('token');
      window.dispatchEvent(new Event('auth-unauthorized'));
      toast.error('Session expired. Please log in again.');
      return Promise.reject(error);
    }

    if (status === 503) {
      window.dispatchEvent(new Event('system-maintenance'));
      return Promise.reject(error);
    }

    // Suppress toasts for routes marked fully silent
    if (routeCfg.silent) return Promise.reject(error);

    // Suppress toasts for known, expected, non-critical error messages
    if (isSilentErrorMessage(message)) return Promise.reject(error);

    // Suppress silentErrors routes
    if (routeCfg.silentErrors) return Promise.reject(error);

    // Everything else — show the error
    const displayMsg = message || error.message || 'An unexpected error occurred.';
    toast.error(displayMsg);

    return Promise.reject(error);
  }
);

export default api;
