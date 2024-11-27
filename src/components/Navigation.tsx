import { Link } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Button } from './ui/button';
import { supabase } from '@/lib/supabase';
import { useToast } from './ui/use-toast';
import { 
  Home, 
  Upload, 
  Image as ImageIcon, 
  Video, 
  Share2, 
  Settings, 
  LogOut,
  Menu,
  X as CloseIcon,
  Moon,
  Sun,
  Globe,
  Camera
} from 'lucide-react';
import { useState } from 'react';
import { useTheme } from '@/hooks/useTheme';

export function Navigation() {
  const { clearSession } = useAuthStore();
  const { toast } = useToast();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        variant: 'destructive',
        title: 'Error signing out',
        description: error.message,
      });
      return;
    }
    clearSession();
  };

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/create/content', icon: Camera, label: 'Create Content' },
    { path: '/upload', icon: Upload, label: 'Upload' },
    { path: '/images', icon: ImageIcon, label: 'Images' },
    { path: '/videos', icon: Video, label: 'Videos' },
    { path: '/social/connect', icon: Share2, label: 'Manage Social' },
    { path: '/social/upload', icon: Upload, label: 'Social Upload' },
    { path: '/test/custom-platforms', icon: Globe, label: 'Custom Platforms' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <nav className="sticky top-0 z-50 glass">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold gradient-text">Content Hub</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="nav-item group flex items-center space-x-2 text-sm font-medium"
              >
                <item.icon className="w-4 h-4 transition-colors group-hover:text-primary" />
                <span>{item.label}</span>
              </Link>
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="btn-hover"
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
            <Button
              variant="ghost"
              className="btn-hover text-destructive hover:text-destructive/90"
              onClick={handleSignOut}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="btn-hover"
            >
              {isMenuOpen ? (
                <CloseIcon className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden glass animated-bg">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="hover-lift flex items-center space-x-3 px-3 py-2 rounded-xl text-base font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            ))}
            <div className="flex items-center justify-between px-3 py-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="btn-hover"
              >
                {theme === 'dark' ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </Button>
              <Button
                variant="ghost"
                className="btn-hover text-destructive hover:text-destructive/90"
                onClick={handleSignOut}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
