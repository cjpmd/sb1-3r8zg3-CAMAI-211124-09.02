'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Camera, Video } from 'lucide-react';
import { CameraCapture } from '@/components/camera/CameraCapture';

export default function DashboardPage() {
  const [showCamera, setShowCamera] = useState(false);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      
      {showCamera ? (
        <CameraCapture onClose={() => setShowCamera(false)} />
      ) : (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Create Content</h2>
          <div className="flex gap-4">
            <Button
              onClick={() => setShowCamera(true)}
              className="flex-1"
            >
              <Camera className="w-4 h-4 mr-2" />
              Take Photo/Video
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
