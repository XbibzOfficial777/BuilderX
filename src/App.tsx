import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { initAuthListener } from '@/stores/authStore';
import { initTheme } from '@/stores/themeStore';
import { LandingPage } from '@/sections/landing/LandingPage';
import { Login } from '@/sections/auth/Login';
import { Signup } from '@/sections/auth/Signup';
import { ResetPassword } from '@/sections/auth/ResetPassword';
import { Dashboard } from '@/sections/dashboard/Dashboard';
import { EditorPage } from '@/components/editor/Editor';
import { useAuthStore } from '@/stores/authStore';

// Protected route component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#07080D] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#7B6DFF]/30 border-t-[#7B6DFF] rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  return <>{children}</>;
}

// Public route that redirects to dashboard if authenticated
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#07080D] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#7B6DFF]/30 border-t-[#7B6DFF] rounded-full animate-spin" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

function App() {
  useEffect(() => {
    initAuthListener();
    initTheme();
  }, []);

  return (
    <TooltipProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route
            path="/"
            element={
              <PublicRoute>
                <LandingPage />
              </PublicRoute>
            }
          />
          <Route
            path="/auth/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/auth/signup"
            element={
              <PublicRoute>
                <Signup />
              </PublicRoute>
            }
          />
          <Route
            path="/auth/reset-password"
            element={
              <PublicRoute>
                <ResetPassword />
              </PublicRoute>
            }
          />

          {/* Protected routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/editor/:projectId"
            element={
              <ProtectedRoute>
                <EditorPage />
              </ProtectedRoute>
            }
          />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#0E111A',
            border: '1px solid #1E1E2E',
            color: '#F2F4F8',
          },
        }}
      />
    </TooltipProvider>
  );
}

export default App;
