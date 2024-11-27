import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { 
  Facebook, 
  Instagram, 
  Youtube, 
  Share2,
  Twitter,
  Plus
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PLATFORMS = [
  {
    id: 'instagram',
    name: 'Instagram',
    icon: Instagram,
    color: 'from-pink-500 via-purple-500 to-indigo-500',
    scopes: ['basic', 'comments', 'relationships'],
  },
  {
    id: 'facebook',
    name: 'Facebook',
    icon: Facebook,
    color: 'from-blue-600 to-blue-800',
    scopes: ['public_profile', 'pages_show_list'],
  },
  {
    id: 'youtube',
    name: 'YouTube',
    icon: Youtube,
    color: 'from-red-600 to-red-800',
    scopes: ['youtube.readonly', 'youtube.upload'],
  },
  {
    id: 'x',
    name: 'X',
    icon: Twitter,
    color: 'from-neutral-800 to-neutral-950',
    scopes: ['tweet.read', 'tweet.write', 'users.read'],
  }
];

export function ConnectPlatform() {
  const navigate = useNavigate();

  const handleConnect = async (platform: string) => {
    const clientId = import.meta.env[`VITE_${platform.toUpperCase()}_CLIENT_ID`];
    const redirectUri = `${window.location.origin}/social/auth/callback`;
    const scopes = PLATFORMS.find(p => p.id === platform)?.scopes.join(' ');
    
    // Generate and store state
    const state = crypto.randomUUID();
    sessionStorage.setItem('oauth_state', state);
    sessionStorage.setItem('oauth_platform', platform);
    
    let authUrl = '';
    switch (platform) {
      case 'instagram':
        authUrl = `https://api.instagram.com/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scopes}&response_type=code&state=${state}`;
        break;
      case 'facebook':
        authUrl = `https://www.facebook.com/v12.0/dialog/oauth?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scopes}&state=${state}`;
        break;
      case 'youtube':
        authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scopes}&response_type=code&access_type=offline&state=${state}`;
        break;
      case 'x':
        // Generate code verifier and challenge for PKCE
        const verifier = crypto.randomUUID() + crypto.randomUUID(); // 72 chars
        const challenge = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier))
          .then(buffer => btoa(String.fromCharCode(...new Uint8Array(buffer)))
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, ''));
        
        sessionStorage.setItem('oauth_verifier', verifier);
        
        authUrl = `https://twitter.com/i/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scopes}&response_type=code&code_challenge=${challenge}&code_challenge_method=S256&state=${state}`;
        break;
    }
    
    if (authUrl) {
      window.location.href = authUrl;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <h1 className="text-3xl font-bold gradient-text">Connect Platforms</h1>
        <Button 
          variant="outline"
          onClick={() => navigate('/social/custom')}
          className="hover-lift"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Custom Platform
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {PLATFORMS.map((platform) => (
          <Card key={platform.id} className="glass hover-lift overflow-hidden">
            <div className={`h-2 bg-gradient-to-r ${platform.color}`} />
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <platform.icon className="w-6 h-6" />
                  <h3 className="text-lg font-semibold">{platform.name}</h3>
                </div>
                <Share2 className="w-5 h-5 text-muted-foreground" />
              </div>
              
              <p className="text-sm text-muted-foreground mb-4">
                Connect your {platform.name} account to share and manage content.
              </p>

              <Button 
                className="w-full group"
                onClick={() => handleConnect(platform.id)}
              >
                Connect
                <Share2 className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
