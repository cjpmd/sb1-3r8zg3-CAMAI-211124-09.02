import { useEffect, useState } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { AuthForm } from './components/auth/AuthForm';
import { Dashboard } from './components/Dashboard';
import { Settings } from './components/Settings';
import { Profile } from './components/Profile';
import { ImageBrowser } from './components/ImageBrowser';
import { VideoBrowser } from './components/video/VideoBrowser';
import { ContentUploader } from './components/ContentUploader';
import { ConnectAccounts } from './components/social/ConnectAccounts';
import { OAuthCallback } from './components/social/OAuthCallback';
import { SocialUploader } from './components/social/SocialUploader';
import { VideoCreator } from "./components/content/VideoCreator";
import { CameraCapture } from './components/camera/CameraCapture';
import { StripeProvider } from './components/providers/StripeProvider';
import { SubscriptionManagement } from './components/subscription/SubscriptionManagement';
import { ThemeProvider } from './components/providers/ThemeProvider';
import { ErrorBoundary } from 'react-error-boundary';
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { Toaster } from './components/ui/toaster';
import { supabase } from './lib/supabase';
import { ContentCreationForm } from './components/content/ContentCreationForm';
import { ContentList } from './components/content/ContentList';
import { CreatePost } from './components/social/CreatePost';
import { PrivacyPolicy } from './components/PrivacyPolicy';
import { LoginPage } from './pages/auth/login';
import { TikTokVerify } from './pages/auth/TikTokVerify';
import AuthCallback from './pages/AuthCallback';
import { HelmetProvider } from 'react-helmet-async';
import { AuthError, AuthChangeEvent, Session } from '@supabase/supabase-js';

function App() {
  const { session, refreshSession } = useAuthStore();
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    // Set a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      setInitializing(false);
    }, 3000);

    const checkSession = async () => {
      try {
        console.log('Initial session check:', session);
        await refreshSession();
      } catch (error) {
        console.error('Error checking session:', error instanceof AuthError ? error.message : 'Unknown error');
      } finally {
        clearTimeout(timeoutId);
        setInitializing(false);
      }
    };

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        console.log('Auth state changed:', session);
        await refreshSession();
      }
    );

    // Initial session check
    checkSession();

    // Cleanup
    return () => {
      subscription.unsubscribe();
      clearTimeout(timeoutId);
    };
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
    <ErrorBoundary fallback={<div>Something went wrong</div>}>
      <HelmetProvider>
        <ThemeProvider>
          <StripeProvider>
            <Router>
              <div className="min-h-screen bg-background">
                <Routes>
                  {/* Auth Routes */}
                  <Route path="/tiktok-verify" element={<TikTokVerify />} />
                  <Route 
                    path="/login" 
                    element={session ? <Navigate to="/" replace /> : <LoginPage />} 
                  />
                  <Route 
                    path="/auth" 
                    element={session ? <Navigate to="/" replace /> : <AuthForm />} 
                  />
                  <Route path="/auth/callback" element={<AuthCallback />} />
                  <Route path="/auth/tiktok/callback" element={<OAuthCallback platform="tiktok" />} />
                  <Route path="/privacy" element={<PrivacyPolicy />} />

                  {/* Protected Routes */}
                  <Route path="/" element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/settings" element={
                    <ProtectedRoute>
                      <Settings />
                    </ProtectedRoute>
                  } />
                  <Route path="/profile" element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  } />
                  <Route path="/images" element={
                    <ProtectedRoute>
                      <ImageBrowser />
                    </ProtectedRoute>
                  } />
                  <Route path="/videos" element={
                    <ProtectedRoute>
                      <VideoBrowser />
                    </ProtectedRoute>
                  } />
                  <Route path="/upload" element={
                    <ProtectedRoute>
                      <ContentUploader />
                    </ProtectedRoute>
                  } />
                  <Route path="/connect" element={
                    <ProtectedRoute>
                      <ConnectAccounts />
                    </ProtectedRoute>
                  } />
                  <Route path="/social/upload" element={
                    <ProtectedRoute>
                      <SocialUploader />
                    </ProtectedRoute>
                  } />
                  <Route path="/create/video" element={
                    <ProtectedRoute>
                      <VideoCreator />
                    </ProtectedRoute>
                  } />
                  <Route path="/camera" element={
                    <ProtectedRoute>
                      <CameraCapture />
                    </ProtectedRoute>
                  } />
                  <Route path="/subscription" element={
                    <ProtectedRoute>
                      <SubscriptionManagement />
                    </ProtectedRoute>
                  } />
                  <Route path="/create" element={
                    <ProtectedRoute>
                      <ContentCreationForm />
                    </ProtectedRoute>
                  } />
                  <Route path="/content" element={
                    <ProtectedRoute>
                      <ContentList />
                    </ProtectedRoute>
                  } />
                  <Route path="/post" element={
                    <ProtectedRoute>
                      <CreatePost />
                    </ProtectedRoute>
                  } />
                </Routes>
                <Toaster />
              </div>
            </Router>
          </StripeProvider>
        </ThemeProvider>
      </HelmetProvider>
    </ErrorBoundary>
  );
}

export default App;