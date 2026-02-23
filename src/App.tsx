import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from './store/authStore';
import { MainLayout } from './components/layout/MainLayout';
import { MainLandingPage, LoginPage, DiaryPage, SocialPage, MyPage } from './pages';
import { DiaryArchivePage } from './pages/DiaryArchivePage';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Scroll to top on route change
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

// Public Route wrapper - redirects authenticated users to /social
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
        }}
      >
        로딩 중...
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/social" replace />;
  }

  return <>{children}</>;
};

// Protected Route wrapper - redirects unauthenticated users to /
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
        }}
      >
        로딩 중...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

function App() {
  const { setLoading } = useAuthStore();

  useEffect(() => {
    // Initialize auth state
    setLoading(false);
  }, [setLoading]);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          {/* Public routes - redirect to /social if authenticated */}
          <Route
            path="/"
            element={
              <PublicRoute>
                <MainLandingPage />
              </PublicRoute>
            }
          />
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />

          {/* Protected routes with tab bar */}
          <Route
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route path="diary" element={<DiaryPage />} />
            <Route path="diary/archive" element={<DiaryArchivePage />} />
            <Route path="social" element={<SocialPage />} />
            <Route path="mypage" element={<MyPage />} />
          </Route>

          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/social" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
