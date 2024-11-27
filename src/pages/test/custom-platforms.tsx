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
          api_key: 'test_api_key'
        },
        settings: {
          autoPost: true,
          crossPost: false,
          defaultPrivacy: 'private'
        }
      });

    if (error) {
      console.error('Error adding test platform:', error);
      return;
    }

    await loadPlatforms();
  };

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Test Controls</h2>
        <div className="flex space-x-4">
          <Button onClick={addTestPlatform}>Add Test Platform</Button>
          <Button variant="destructive" onClick={clearPlatforms}>Clear All Platforms</Button>
        </div>
        <div className="space-y-2">
          <h3 className="text-md font-medium">Current Platforms:</h3>
          {platforms.map((platform: any) => (
            <div key={platform.id} className="rounded bg-muted p-2">
              <pre className="text-sm">{JSON.stringify(platform, null, 2)}</pre>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

export default function CustomPlatformsPage() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <h1 className="text-2xl font-bold">Custom Platforms Test</h1>
      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <TestControls />
        </div>
        <div>
          <ConnectPlatform />
        </div>
      </div>
    </div>
  );
}
