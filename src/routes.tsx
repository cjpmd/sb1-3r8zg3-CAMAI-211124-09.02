import { lazy, ComponentType } from 'react';
import { Navigate } from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';
import { AuthState } from './types/supabase';

// Lazy load components
const Dashboard = lazy(() => import('./components/Dashboard')) as unknown as ComponentType<any>;
const Settings = lazy(() => import('./components/Settings')) as unknown as ComponentType<any>;
const Profile = lazy(() => import('./components/Profile')) as unknown as ComponentType<any>;
const ImageBrowser = lazy(() => import('./components/ImageBrowser')) as unknown as ComponentType<any>;
const VideoBrowser = lazy(() => import('./components/VideoBrowser')) as unknown as ComponentType<any>;
const ContentUploader = lazy(() => import('./components/ContentUploader')) as unknown as ComponentType<any>;
const VideoUpload = lazy(() => import('./components/upload/VideoUpload')) as unknown as ComponentType<any>;
const ConnectAccounts = lazy(() => import('./components/social/ConnectAccounts')) as unknown as ComponentType<any>;
const SocialUploader = lazy(() => import('./components/social/SocialUploader')) as unknown as ComponentType<any>;
const OAuthCallback = lazy(() => import('./components/social/OAuthCallback')) as unknown as ComponentType<any>;
const SubscriptionManagement = lazy(() => import('./components/subscription/SubscriptionManagement')) as unknown as ComponentType<any>;
const AuthForm = lazy(() => import('./components/auth/AuthForm')) as unknown as ComponentType<any>;
const LoginPage = lazy(() => import('./pages/auth/login').then(mod => ({ default: mod.LoginPage }))) as unknown as ComponentType<any>;

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
  component: ComponentType<any>;
  private?: boolean;
  layout?: ComponentType<any>;
}

const createProtectedRoute = (
  Component: React.ComponentType,
  requiresAuth = true
) => {
  return ({ user }: { user: AuthState['user'] }) => {
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
    component: Dashboard,
    private: true,
  },
  {
    path: '/login',
    component: LoginPage,
    private: false,
  },
  {
    path: '/auth',
    component: AuthForm,
    private: false,
  },
  {
    path: '/settings',
    component: Settings,
    private: true,
  },
  {
    path: '/profile',
    component: Profile,
    private: true,
  },
  {
    path: '/images',
    component: ImageBrowser,
    private: true,
  },
  {
    path: '/videos',
    component: VideoBrowser,
    private: true,
  },
  {
    path: '/upload',
    component: ContentUploader,
    private: true,
  },
  {
    path: '/upload/video',
    component: VideoUpload,
    private: true,
  },
  {
    path: '/social/connect',
    component: ConnectAccounts,
    private: true,
  },
  {
    path: '/social/upload',
    component: SocialUploader,
    private: true,
  },
  {
    path: '/auth/tiktok/callback',
    component: OAuthCallback,
  },
  {
    path: '/subscription',
    component: SubscriptionManagement,
    private: true,
  },
  {
    path: '/test/custom-platforms',
    component: lazy(() => import('./pages/test/custom-platforms')) as unknown as ComponentType<any>,
    private: true,
  },
  {
    path: '*',
    component: () => (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold">404</h1>
          <p className="mt-2">Page not found</p>
        </div>
      </div>
    ),
  },
];

export type RouteProps = {
  user: AuthState['user'];
};
