import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Icons } from '@/components/ui/icons';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';

interface DashboardStats {
  totalImages: number;
  totalVideos: number;
  totalPosts: number;
  totalConnections: number;
}

export const Dashboard = () => {
  const navigate = useNavigate();
  const { session, profile } = useAuthStore();
  const { toast } = useToast();
  const [stats, setStats] = useState<DashboardStats>({
    totalImages: 0,
    totalVideos: 0,
    totalPosts: 0,
    totalConnections: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        if (!session?.user?.id) return;

        const [imagesCount, videosCount, postsCount, connectionsCount] = await Promise.all([
          supabase
            .from('images')
            .select('id', { count: 'exact' })
            .eq('user_id', session.user.id)
            .then(({ count }) => count || 0),
          supabase
            .from('videos')
            .select('id', { count: 'exact' })
            .eq('user_id', session.user.id)
            .then(({ count }) => count || 0),
          supabase
            .from('posts')
            .select('id', { count: 'exact' })
            .eq('user_id', session.user.id)
            .then(({ count }) => count || 0),
          supabase
            .from('connections')
            .select('id', { count: 'exact' })
            .eq('user_id', session.user.id)
            .then(({ count }) => count || 0),
        ]);

        setStats({
          totalImages: imagesCount,
          totalVideos: videosCount,
          totalPosts: postsCount,
          totalConnections: connectionsCount,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load dashboard stats",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [session?.user?.id, toast]);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/auth');
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to sign out",
      });
    }
  };

  const features = [
    {
      title: 'Upload Content',
      description: 'Upload new images or videos',
      icon: Icons.upload,
      color: 'bg-gradient-to-br from-pink-500 to-rose-500',
      onClick: () => navigate('/upload'),
    },
    {
      title: 'Create Post',
      description: 'Create and schedule social media posts',
      icon: Icons.post,
      color: 'bg-gradient-to-br from-blue-500 to-cyan-500',
      onClick: () => navigate('/post'),
    },
    {
      title: 'Connect Accounts',
      description: 'Link your social media accounts',
      icon: Icons.link,
      color: 'bg-gradient-to-br from-violet-500 to-purple-500',
      onClick: () => navigate('/connect'),
    },
    {
      title: 'View Analytics',
      description: 'Check your content performance',
      icon: Icons.chart,
      color: 'bg-gradient-to-br from-green-500 to-emerald-500',
      onClick: () => navigate('/analytics'),
    },
  ];

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Icons.spinner className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary-foreground">
              Dashboard
            </h1>
            {profile?.subscription_tier === 'pro' && (
              <span className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs px-3 py-1 rounded-full flex items-center">
                <Icons.zap className="w-3 h-3 mr-1" />
                PRO
              </span>
            )}
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              className="gap-2"
              onClick={() => navigate('/settings')}
            >
              <Icons.settings className="h-4 w-4" />
              <span>{profile?.username || session?.user?.email}</span>
            </Button>
            <Button
              variant="destructive"
              size="sm"
              className="gap-2"
              onClick={handleSignOut}
            >
              <Icons.logOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold">
            Welcome back{profile?.full_name ? `, ${profile.full_name}` : ''}
          </h2>
          <p className="mt-2 text-muted-foreground">
            Here's an overview of your content and quick actions.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              whileHover={{ y: -4 }}
              className="cursor-pointer"
              onClick={feature.onClick}
            >
              <Card className={`${feature.color} border-0 text-white`}>
                <CardHeader>
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-white/10">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                  <CardDescription className="text-white/80">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            </motion.div>
          ))}
        </div>

        <h2 className="mb-6 mt-12 text-2xl font-bold">Statistics</h2>
        <div className="grid gap-6 md:grid-cols-4">
          <Card className="bg-gradient-to-br from-pink-500 to-rose-500 border-0 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icons.image className="h-5 w-5" />
                Images
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.totalImages}</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500 to-cyan-500 border-0 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icons.video className="h-5 w-5" />
                Videos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.totalVideos}</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-violet-500 to-purple-500 border-0 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icons.post className="h-5 w-5" />
                Posts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.totalPosts}</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-emerald-500 border-0 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icons.link className="h-5 w-5" />
                Connections
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.totalConnections}</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};
