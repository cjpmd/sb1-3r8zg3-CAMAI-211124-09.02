import React, { useEffect, useState } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { supabase } from './lib/supabase';
import { useAuthStore } from './store/authStore';
import { Toaster } from './components/ui/toaster';
import { ErrorBoundary } from 'react-error-boundary';
import { LoadingSpinner } from './components/ui/loading-spinner';
import { ErrorFallback } from './components/ui/error-fallback';
import { ThemeProvider } from './components/providers/ThemeProvider';
import { StripeProvider } from './components/providers/StripeProvider';
import { HelmetProvider } from 'react-helmet-async';

// Lazy load components
const Dashboard = React.lazy(() => import('./components/Dashboard'));
const LandingPage = React.lazy(() => import('./pages/LandingPage'));
const Profile = React.lazy(() => import('./components/Profile'));
const Settings = React.lazy(() => import('./components/Settings'));
const AuthCallback = React.lazy(() => import('./pages/AuthCallback'));
const ImageBrowser = React.lazy(() => import('./components/ImageBrowser'));
const VideoBrowser = React.lazy(() => import('./components/video/VideoBrowser'));
const ContentUploader = React.lazy(() => import('./components/ContentUploader'));
const ConnectAccounts = React.lazy(() => import('./components/social/ConnectAccounts'));
const SocialUploader = React.lazy(() => import('./components/social/SocialUploader'));
const VideoCreator = React.lazy(() => import('./components/content/VideoCreator'));
const CameraCapture = React.lazy(() => import('./components/camera/CameraCapture'));
const SubscriptionManagement = React.lazy(() => import('./components/subscription/SubscriptionManagement'));
const ContentCreationForm = React.lazy(() => import('./components/content/ContentCreationForm'));
const ContentList = React.lazy(() => import('./components/content/ContentList'));
const CreatePost = React.lazy(() => import('./components/social/CreatePost'));
const PrivacyPolicy = React.lazy(() => import('./components/PrivacyPolicy'));
const LoginPage = React.lazy(() => import('./pages/auth/login'));
const TikTokVerify = React.lazy(() => import('./pages/auth/TikTokVerify'));
const OAuthCallback = React.lazy(() => import('./components/social/OAuthCallback'));

function App() {
  const { user, session, refreshSession, signIn } = useAuthStore();
  const navigate = useNavigate();
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await refreshSession();
      } catch (error) {
        console.error('Error checking session:', error);
      } finally {
        setInitializing(false);
      }
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', session);
      await refreshSession();
    });

    initializeApp();

    return () => subscription.unsubscribe();
  }, [refreshSession]);

  if (initializing) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <HelmetProvider>
        <ThemeProvider>
          <StripeProvider>
            <React.Suspense fallback={<LoadingSpinner />}>
              <Routes>
                <Route path="/" element={<LoginPage />} />
                <Route path="/settings" element={session ? <Settings /> : <Navigate to="/" />} />
                <Route path="/profile" element={session ? <Profile /> : <Navigate to="/" />} />
                <Route path="/images" element={session ? <ImageBrowser /> : <Navigate to="/" />} />
                <Route path="/videos" element={session ? <VideoBrowser /> : <Navigate to="/" />} />
                <Route path="/upload" element={session ? <ContentUploader /> : <Navigate to="/" />} />
                <Route path="/connect" element={session ? <ConnectAccounts /> : <Navigate to="/" />} />
                <Route path="/social/upload" element={session ? <SocialUploader /> : <Navigate to="/" />} />
                <Route path="/create/video" element={session ? <VideoCreator /> : <Navigate to="/" />} />
                <Route path="/camera" element={session ? <CameraCapture /> : <Navigate to="/" />} />
                <Route path="/subscription" element={session ? <SubscriptionManagement /> : <Navigate to="/" />} />
                <Route path="/create" element={session ? <ContentCreationForm /> : <Navigate to="/" />} />
                <Route path="/content" element={session ? <ContentList /> : <Navigate to="/" />} />
                <Route path="/post" element={session ? <CreatePost /> : <Navigate to="/" />} />
                <Route path="/tiktok-verify" element={<TikTokVerify />} />
                <Route path="/auth/callback" element={<AuthCallback />} />
                <Route path="/auth/tiktok/callback" element={<OAuthCallback platform="tiktok" />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/dashboard/*" element={session ? <Dashboard /> : <Navigate to="/" />} />
              </Routes>
            </React.Suspense>
            <Toaster />
          </StripeProvider>
        </ThemeProvider>
      </HelmetProvider>
    </ErrorBoundary>
  );
}

export default App;