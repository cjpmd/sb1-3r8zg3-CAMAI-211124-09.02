// Privacy Policy Component - Last updated: 2024-11-28
import { Card } from "@/components/ui/card";

export default function PrivacyPolicy() {
  return (
    <Card className="max-w-4xl mx-auto p-8">
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Privacy Policy</h1>
        
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Data Collection and Usage</h2>
          <p>
            We collect and process your data to provide our social media management services.
            This includes access to your social media accounts and related content.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Data Protection</h2>
          <p>
            We implement security measures to protect your personal information
            and ensure it is only used for intended purposes.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Data Deletion</h2>
          <p>
            You have the right to request deletion of your personal data. To delete your data:
          </p>
          <ol className="list-decimal pl-6 space-y-2">
            <li>Go to your Facebook Account Settings</li>
            <li>Navigate to Settings and Privacy, then select Settings</li>
            <li>Click Apps and Websites</li>
            <li>Find CAMAI in your list of connected apps</li>
            <li>Click Remove to disconnect the app and request deletion</li>
          </ol>
          <p>
            Alternatively, you can email us at cmcdonald002@dundee.ac.uk to request deletion of your data.
            We will process your request within 30 days.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Contact Information</h2>
          <p>
            For any privacy-related questions or concerns, please contact us at:
            cmcdonald002@dundee.ac.uk
          </p>
        </section>
      </div>
    </Card>
  );
}
