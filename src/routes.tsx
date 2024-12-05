import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';
import LoadingSpinner from './components/ui/LoadingSpinner';
import ErrorFallback from './components/ui/ErrorFallback';
import { useAuthStore } from './store/authStore';

// Lazy load components
const Dashboard = lazy(() => import('./components/Dashboard').then(module => ({ default: module.Dashboard })));
const Settings = lazy(() => import('./components/Settings').then(module => ({ default: module.Settings })));
const Profile = lazy(() => import('./components/Profile').then(module => ({ default: module.Profile })));
const ImageBrowser = lazy(() => import('./components/ImageBrowser').then(module => ({ default: module.ImageBrowser })));
const VideoBrowser = lazy(() => import('./components/VideoBrowser').then(module => ({ default: module.VideoBrowser })));
const ContentUploader = lazy(() => import('./components/ContentUploader').then(module => ({ default: module.ContentUploader })));
const VideoUpload = lazy(() => import('./components/upload/VideoUpload').then(module => ({ default: module.VideoUpload })));
const ConnectAccounts = lazy(() => import('./components/social/ConnectAccounts').then(module => ({ default: module.ConnectAccounts })));
const SocialUploader = lazy(() => import('./components/social/SocialUploader').then(module => ({ default: module.SocialUploader })));
const OAuthCallback = lazy(() => import('./components/social/OAuthCallback').then(module => ({ default: module.OAuthCallback })));
const SubscriptionManagement = lazy(() => import('./components/subscription/SubscriptionManagement').then(module => ({ default: module.SubscriptionManagement })));
const AuthForm = lazy(() => import('./components/auth/AuthForm').then(module => ({ default: module.AuthForm })));

interface RouteConfig {
  path: string;
  element: JSX.Element;
  protected?: boolean;
}

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuthStore();
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  return <>{children}</>;
};

const routes: RouteConfig[] = [
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
    protected: true,
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <Suspense fallback={<LoadingSpinner />}>
            <Dashboard />
          </Suspense>
        </ErrorBoundary>
      </ProtectedRoute>
    ),
    protected: true,
  },
  {
    path: '/settings',
    element: (
      <ProtectedRoute>
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <Suspense fallback={<LoadingSpinner />}>
            <Settings />
          </Suspense>
        </ErrorBoundary>
      </ProtectedRoute>
    ),
    protected: true,
  },
  {
    path: '/profile',
    element: (
      <ProtectedRoute>
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <Suspense fallback={<LoadingSpinner />}>
            <Profile />
          </Suspense>
        </ErrorBoundary>
      </ProtectedRoute>
    ),
    protected: true,
  },
  {
    path: '/images',
    element: (
      <ProtectedRoute>
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <Suspense fallback={<LoadingSpinner />}>
            <ImageBrowser />
          </Suspense>
        </ErrorBoundary>
      </ProtectedRoute>
    ),
    protected: true,
  },
  {
    path: '/videos',
    element: (
      <ProtectedRoute>
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <Suspense fallback={<LoadingSpinner />}>
            <VideoBrowser />
          </Suspense>
        </ErrorBoundary>
      </ProtectedRoute>
    ),
    protected: true,
  },
  {
    path: '/upload',
    element: (
      <ProtectedRoute>
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <Suspense fallback={<LoadingSpinner />}>
            <ContentUploader />
          </Suspense>
        </ErrorBoundary>
      </ProtectedRoute>
    ),
    protected: true,
  },
  {
    path: '/upload/video',
    element: (
      <ProtectedRoute>
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <Suspense fallback={<LoadingSpinner />}>
            <VideoUpload />
          </Suspense>
        </ErrorBoundary>
      </ProtectedRoute>
    ),
    protected: true,
  },
  {
    path: '/connect',
    element: (
      <ProtectedRoute>
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <Suspense fallback={<LoadingSpinner />}>
            <ConnectAccounts />
          </Suspense>
        </ErrorBoundary>
      </ProtectedRoute>
    ),
    protected: true,
  },
  {
    path: '/social',
    element: (
      <ProtectedRoute>
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <Suspense fallback={<LoadingSpinner />}>
            <SocialUploader />
          </Suspense>
        </ErrorBoundary>
      </ProtectedRoute>
    ),
    protected: true,
  },
  {
    path: '/oauth/callback',
    element: (
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <Suspense fallback={<LoadingSpinner />}>
          <OAuthCallback />
        </Suspense>
      </ErrorBoundary>
    ),
  },
  {
    path: '/subscription',
    element: (
      <ProtectedRoute>
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <Suspense fallback={<LoadingSpinner />}>
            <SubscriptionManagement />
          </Suspense>
        </ErrorBoundary>
      </ProtectedRoute>
    ),
    protected: true,
  },
  {
    path: '/auth',
    element: (
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <Suspense fallback={<LoadingSpinner />}>
          <AuthForm />
        </Suspense>
      </ErrorBoundary>
    ),
  },
];

export default function AppRoutes() {
  return (
    <Router>
      <Routes>
        {routes.map((route) => (
          <Route
            key={route.path}
            path={route.path}
            element={route.element}
          />
        ))}
      </Routes>
    </Router>
  );
}
