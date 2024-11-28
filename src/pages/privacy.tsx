import { Card } from "@/components/ui/card";

export function PrivacyPolicy() {
  return (
    <Card className="max-w-4xl mx-auto p-8 space-y-8">
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Privacy Policy</h1>
        
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Introduction</h2>
          <p>
            Welcome to CAMAI. This policy explains how we collect, use, and protect your personal information.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Information We Collect</h2>
          <div className="space-y-4">
            <p>We collect the following types of information:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Social media account information when you connect your accounts</li>
              <li>Content you upload or create using our platform</li>
              <li>Usage data and analytics</li>
              <li>Device and browser information</li>
            </ul>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">How We Use Your Information</h2>
          <div className="space-y-4">
            <p>We use your information to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide and improve our services</li>
              <li>Post content to your connected social media accounts</li>
              <li>Analyze usage patterns and optimize performance</li>
              <li>Communicate with you about your account</li>
            </ul>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Data Security</h2>
          <p>
            We implement appropriate security measures to protect your personal information.
            This includes encryption, secure storage, and regular security audits.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Third-Party Services</h2>
          <div className="space-y-4">
            <p>We integrate with the following third-party services:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>TikTok</li>
              <li>Facebook</li>
              <li>Instagram</li>
              <li>YouTube</li>
            </ul>
            <p>
              Each platform has its own privacy policy and terms of service that also apply
              when you use our service to interact with them.
            </p>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Data Retention</h2>
          <p>
            We retain your data for as long as your account is active or as needed to provide you services.
            You can request deletion of your data at any time.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Your Rights</h2>
          <div className="space-y-4">
            <p>You have the right to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Export your data</li>
              <li>Withdraw consent for data processing</li>
            </ul>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Data Deletion Instructions</h2>
          <div className="space-y-4">
            <p>
              You have the right to request deletion of your personal data. To delete your data:
            </p>
            <ol className="list-decimal pl-6 space-y-2">
              <li>Open Facebook Account Settings</li>
              <li>Open Settings and Privacy menu</li>
              <li>Open Settings page</li>
              <li>Open Apps and Websites section</li>
              <li>Locate CAMAI in the connected apps list</li>
              <li>Select Remove to delete app access and data</li>
            </ol>
            <p>
              Alternatively, you can email us at cmcdonald002@dundee.ac.uk to request deletion of your data.
              We will process your request within 30 days.
            </p>
            <p className="text-sm opacity-75">
              Note: This process will permanently delete your account and all associated data.
              This action cannot be undone.
            </p>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us at{" "}
            <a href="mailto:cmcdonald002@dundee.ac.uk" className="text-primary hover:underline">
              cmcdonald002@dundee.ac.uk
            </a>
          </p>
        </section>
      </div>
    </Card>
  );
}
