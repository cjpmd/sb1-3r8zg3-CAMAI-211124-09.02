import { ConnectPlatform } from '@/components/social/ConnectPlatform';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useEffect, useState } from 'react';

function TestControls() {
  const [platforms, setPlatforms] = useState([]);

  useEffect(() => {
    loadPlatforms();
  }, []);

  const loadPlatforms = async () => {
    const { data, error } = await supabase
      .from('custom_platforms')
      .select('*');
    
    if (error) {
      console.error('Error loading platforms:', error);
      return;
    }
    
    setPlatforms(data || []);
  };

  const clearPlatforms = async () => {
    const { error } = await supabase
      .from('custom_platforms')
      .delete()
      .neq('id', ''); // Delete all

    if (error) {
      console.error('Error clearing platforms:', error);
      return;
    }

    await loadPlatforms();
  };

  const addTestPlatform = async () => {
    const { error } = await supabase
      .from('custom_platforms')
      .insert({
        platform_name: 'OnlyFans',
        platform_url: 'https://onlyfans.com',
        username: 'testuser',
        credentials: {
          username: 'testuser',
          password: btoa('testpass'),
        },
        icon_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/OnlyFans_Social_Logo.svg/240px-OnlyFans_Social_Logo.svg.png',
        is_enabled: true,
        is_private: true,
      });

    if (error) {
      console.error('Error adding test platform:', error);
      return;
    }

    await loadPlatforms();
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <Button onClick={addTestPlatform}>Add Test Platform</Button>
        <Button variant="destructive" onClick={clearPlatforms}>
          Clear All Platforms
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {platforms.map((platform) => (
          <Card key={platform.id} className="p-4">
            <h3 className="font-semibold">{platform.platform_name}</h3>
            <p className="text-sm text-muted-foreground">
              Username: {platform.username}
            </p>
            <p className="text-sm text-muted-foreground">
              URL: {platform.platform_url}
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
}

function CustomPlatformsTest() {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Test Custom Platforms</h1>
      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-semibold mb-4">Test Controls</h2>
          <TestControls />
        </section>
        <section>
          <h2 className="text-2xl font-semibold mb-4">Platform Connection</h2>
          <ConnectPlatform />
        </section>
      </div>
    </div>
  );
}

export default CustomPlatformsTest;
