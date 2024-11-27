import { lazy } from 'react';
import { Navigate } from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';

// Lazy load components
const Dashboard = lazy(() => import('./components/Dashboard'));
const Settings = lazy(() => import('./components/Settings'));
const Profile = lazy(() => import('./components/Profile'));
const ImageBrowser = lazy(() => import('./components/ImageBrowser'));
const VideoBrowser = lazy(() => import('./components/VideoBrowser'));
const ContentUploader = lazy(() => import('./components/ContentUploader'));
const VideoUpload = lazy(() => import('./components/upload/VideoUpload'));
const ConnectAccounts = lazy(() => import('./components/social/ConnectAccounts'));
const SocialUploader = lazy(() => import('./components/social/SocialUploader'));
const OAuthCallback = lazy(() => import('./components/social/OAuthCallback'));
const SubscriptionManagement = lazy(() => import('./components/subscription/SubscriptionManagement'));
const CustomPlatformsTest = lazy(() => import('./pages/test/custom-platforms'));
const Auth = lazy(() => import('./components/auth/AuthForm'));
const LoginPage = lazy(() => import('./pages/auth/login').then(mod => ({ default: mod.LoginPage })));

function ErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="rounded-lg bg-destructive/10 p-8 text-center">
        <h2 className="mb-4 text-xl font-semibold text-destructive">Something went wrong</h2>
        <pre className="text-sm text-muted-foreground mb-4">{error.message}</pre>
        <button
          onClick={resetErrorBoundary}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

interface RouteConfig {
  path: string;
  element: React.ReactNode;
  requiresAuth?: boolean;
  requiresGuest?: boolean;
}

const createProtectedRoute = (
  Component: React.ComponentType,
  requiresAuth = true
) => {
  return ({ user }: { user: any }) => {
    if (requiresAuth && !user) {
      return <Navigate to="/login" />;
    }
    if (!requiresAuth && user) {
      return <Navigate to="/" />;
    }
    return (
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <Component />
      </ErrorBoundary>
    );
  };
};

export const routes: RouteConfig[] = [
  {
    path: '/',
    element: createProtectedRoute(Dashboard),
    requiresAuth: true,
  },
  {
    path: '/login',
    element: createProtectedRoute(LoginPage, false),
    requiresGuest: true,
  },
  {
    path: '/auth',
    element: createProtectedRoute(Auth, false),
    requiresGuest: true,
  },
  {
    path: '/settings',
    element: createProtectedRoute(Settings),
    requiresAuth: true,
  },
  {
    path: '/profile',
    element: createProtectedRoute(Profile),
    requiresAuth: true,
  },
  {
    path: '/images',
    element: createProtectedRoute(ImageBrowser),
    requiresAuth: true,
  },
  {
    path: '/videos',
    element: createProtectedRoute(VideoBrowser),
    requiresAuth: true,
  },
  {
    path: '/upload',
    element: createProtectedRoute(ContentUploader),
    requiresAuth: true,
  },
  {
    path: '/upload/video',
    element: createProtectedRoute(VideoUpload),
    requiresAuth: true,
  },
  {
    path: '/social/connect',
    element: createProtectedRoute(ConnectAccounts),
    requiresAuth: true,
  },
  {
    path: '/social/upload',
    element: createProtectedRoute(SocialUploader),
    requiresAuth: true,
  },
  {
    path: '/auth/tiktok/callback',
    element: <OAuthCallback platform="tiktok" />,
  },
  {
    path: '/subscription',
    element: createProtectedRoute(SubscriptionManagement),
    requiresAuth: true,
  },
  {
    path: '/test/custom-platforms',
    element: createProtectedRoute(CustomPlatformsTest),
    requiresAuth: true,
  },
  {
    path: '*',
    element: (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold">404</h1>
          <p className="mt-2">Page not found</p>
        </div>
      </div>
    ),
  },
];
