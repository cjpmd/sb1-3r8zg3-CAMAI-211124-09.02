import { ConnectPlatform } from '@/components/social/ConnectPlatform';

export default function SocialSettingsPage() {
  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Connect Social Media Accounts</h1>
        <p className="text-muted-foreground mb-8">
          Connect your social media accounts to share your content directly from the app.
          Your credentials are securely stored and you can disconnect accounts at any time.
        </p>
        <ConnectPlatform />
      </div>
    </div>
  );
}
