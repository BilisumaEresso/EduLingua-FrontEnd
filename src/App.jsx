import React, { Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/authStore';

// Layouts
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';
import AdminLayout from './layouts/AdminLayout';
import RoleRoute from './components/RoleRoute';

// Public Pages (Lazy Loaded)
const Landing = React.lazy(() => import('./pages/Landing'));
const Login = React.lazy(() => import('./pages/Login'));
const Signup = React.lazy(() => import('./pages/Signup'));
const PublicGame = React.lazy(() => import('./pages/PublicGame'));
const LanguagesPage = React.lazy(() => import('./pages/LanguagesPage'));
const PublicTracksPage = React.lazy(() => import('./pages/PublicTracksPage'));

// Protected Pages (Lazy Loaded)
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const LearningTracks = React.lazy(() => import('./pages/LearningTracks'));
const LevelPage = React.lazy(() => import('./pages/LevelPage'));
const LessonPage = React.lazy(() => import('./pages/LessonPage'));
const QuizPage = React.lazy(() => import('./pages/QuizPage'));
const ChatPage = React.lazy(() => import('./pages/ChatPage'));
const ProfileSettings = React.lazy(() => import('./pages/ProfileSettings'));
const PremiumUpgrade = React.lazy(() => import('./pages/PremiumUpgrade'));
const TeacherApplication = React.lazy(() => import('./pages/TeacherApplication'));
const ProgressPage = React.lazy(() => import('./pages/ProgressPage'));

// Admin Pages (Lazy Loaded)
const AdminDashboard = React.lazy(() => import('./pages/admin/AdminDashboard'));
const UserManagement = React.lazy(() => import('./pages/admin/UserManagement'));
const TeacherManagement = React.lazy(() => import('./pages/admin/TeacherManagement'));
const ContentManagement = React.lazy(() => import('./pages/admin/ContentManagement'));

// Maintenance
import MaintenancePage from './pages/MaintenancePage';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuthStore();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

import { Toaster } from 'react-hot-toast';

function App() {
  const { checkAuth, isMaintenanceMode } = useAuthStore();

  useEffect(() => {
    checkAuth();
    
    const handleUnauthorized = () => {
      useAuthStore.getState().logout();
    };
    
    window.addEventListener('auth-unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth-unauthorized', handleUnauthorized);
  }, [checkAuth]);

  if (isMaintenanceMode) {
    return (
      <>
        <Toaster position="top-center" />
        <MaintenancePage />
      </>
    );
  }

  return (
    <Router>
      <Toaster position="top-center" />
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-12 w-12 bg-indigo-500 rounded-full mb-4"></div>
            <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded"></div>
          </div>
        </div>
      }>
        <Routes>
          {/* Public Routes with MainLayout (Navbar, Footer) */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<Landing />} />
            <Route path="/game" element={<PublicGame />} />
            <Route path="/languages" element={<LanguagesPage />} />
            <Route path="/explore" element={<PublicTracksPage />} />
          </Route>

          {/* Auth Routes with AuthLayout (Clean, focused) */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
          </Route>

          {/* Protected Routes with DashboardLayout (Sidebar, Topbar) */}
          <Route element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/tracks" element={<LearningTracks />} />
            <Route path="/learning/:id" element={<LevelPage />} />
            <Route path="/lesson/:id" element={<LessonPage />} />
            <Route path="/quiz/:id" element={<QuizPage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/progress" element={<ProgressPage />} />
            <Route path="/settings" element={<ProfileSettings />} />
            <Route path="/premium" element={<PremiumUpgrade />} />
            <Route path="/become-teacher" element={<TeacherApplication />} />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin" element={
            <RoleRoute allowedRoles={['admin', 'super-admin']}>
              <AdminLayout />
            </RoleRoute>
          }>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="teachers" element={<TeacherManagement />} />
            <Route path="content" element={<ContentManagement />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
