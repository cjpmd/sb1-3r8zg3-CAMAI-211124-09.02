import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useAuthStore } from './store/authStore';
import { supabase } from './lib/supabase';
import { LandingPage } from './pages/LandingPage';
import { AccountPage } from './pages/AccountPage';
import { VideoFeed } from './components/VideoFeed';
import { VideoRecorder } from './components/VideoRecorder/VideoRecorder';
import { PricingModal } from './components/PricingModal';
import { Menu, Plus, User } from 'lucide-react';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuthStore();
  const bypassAuth = localStorage.getItem('bypassAuth') === 'true';
  
  if (loading) {
    return <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
    </div>;
  }
  
  if (!user && !bypassAuth) {
    return <Navigate to="/" />;
  }
  
  return children;
};

const MainApp = () => {
  const [showPricing, setShowPricing] = React.useState(false);
  const [showRecorder, setShowRecorder] = React.useState(false);
  const { signOut } = useAuthStore();
  const bypassAuth = localStorage.getItem('bypassAuth') === 'true';

  const handleSignOut = () => {
    if (bypassAuth) {
      localStorage.removeItem('bypassAuth');
    }
    signOut();
  };

  return (
    <div className="bg-black min-h-screen">
      <header className="fixed top-0 left-0 right-0 z-40 bg-gradient-to-b from-black/80 to-transparent">
        <nav className="flex items-center justify-between p-4">
          <h1 className="text-2xl font-bold text-white">ShortForm</h1>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowPricing(true)}
              className="p-2 hover:bg-gray-800 rounded-full transition-colors"
            >
              <Menu className="w-6 h-6 text-white" />
            </button>
            <a
              href="/account"
              className="p-2 hover:bg-gray-800 rounded-full transition-colors"
            >
              <User className="w-6 h-6 text-white" />
            </a>
            <button
              onClick={handleSignOut}
              className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors"
            >
              Sign Out
            </button>
          </div>
        </nav>
      </header>

      <main className="h-screen">
        <VideoFeed />
      </main>

      <button
        onClick={() => setShowRecorder(true)}
        className="fixed bottom-6 right-6 p-4 rounded-full bg-white shadow-lg z-40 hover:bg-gray-100 transition-colors"
      >
        <Plus className="w-8 h-8 text-gray-900" />
      </button>

      <AnimatePresence>
        {showRecorder && (
          <VideoRecorder onClose={() => setShowRecorder(false)} />
        )}
        {showPricing && (
          <PricingModal onClose={() => setShowPricing(false)} />
        )}
      </AnimatePresence>
    </div>
  );
};

function App() {
  const { setSession } = useAuthStore();

  React.useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <MainApp />
            </ProtectedRoute>
          }
        />
        <Route
          path="/account"
          element={
            <ProtectedRoute>
              <AccountPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;