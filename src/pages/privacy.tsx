import { Card } from "@/components/ui/card";

export default function PrivacyPolicy() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="p-8 space-y-6">
        <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
        
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Last Updated: {new Date().toLocaleDateString()}</h2>
          <p className="text-gray-600">
            This Privacy Policy describes how we collect, use, and handle your information when you use our AI Social Media Content Platform.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Information We Collect</h2>
          <div className="space-y-2">
            <h3 className="text-xl font-medium">1. Information you provide to us:</h3>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Account information (name, email, profile picture)</li>
              <li>Social media account connections and access tokens</li>
              <li>Content you create or upload to our platform</li>
              <li>Communication preferences and settings</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-medium">2. Information we automatically collect:</h3>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Usage data and analytics</li>
              <li>Device information and identifiers</li>
              <li>Log data and performance metrics</li>
              <li>Cookies and similar technologies</li>
            </ul>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">How We Use Your Information</h2>
          <ul className="list-disc pl-6 text-gray-600 space-y-2">
            <li>To provide and improve our services</li>
            <li>To manage your social media accounts and content</li>
            <li>To personalize your experience</li>
            <li>To communicate with you about our services</li>
            <li>To ensure security and prevent fraud</li>
            <li>To comply with legal obligations</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Data Sharing and Disclosure</h2>
          <p className="text-gray-600">
            We may share your information with:
          </p>
          <ul className="list-disc pl-6 text-gray-600 space-y-2">
            <li>Social media platforms you choose to connect</li>
            <li>Service providers and partners who assist in operating our platform</li>
            <li>Law enforcement when required by law</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Data Security</h2>
          <p className="text-gray-600">
            We implement appropriate technical and organizational measures to protect your personal information. However, no method of transmission over the Internet is 100% secure.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Your Rights</h2>
          <p className="text-gray-600">
            You have the right to:
          </p>
          <ul className="list-disc pl-6 text-gray-600 space-y-2">
            <li>Access your personal information</li>
            <li>Correct inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Withdraw consent for data processing</li>
            <li>Export your data</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Data Deletion Instructions</h2>
          <div className="space-y-4">
            <p>
              You have the right to request deletion of your personal data. To delete your data:
            </p>
            <ol className="list-decimal pl-6 space-y-2">
              <li>Go to your Facebook Account Settings</li>
              <li>Navigate to Settings & Privacy > Settings</li>
              <li>Click on "Apps and Websites"</li>
              <li>Find "CAMAI" in your list of connected apps</li>
              <li>Click "Remove" to disconnect the app and request data deletion</li>
            </ol>
            <p>
              Alternatively, you can email us at cmcdonald002@dundee.ac.uk to request deletion of your data.
              We will process your request within 30 days.
            </p>
            <p className="text-sm opacity-75">
              Note: This process will permanently remove your data from our systems.
            </p>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Changes to This Policy</h2>
          <p className="text-gray-600">
            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Contact Us</h2>
          <p className="text-gray-600">
            If you have any questions about this Privacy Policy, please contact us at:
          </p>
          <ul className="list-disc pl-6 text-gray-600 space-y-2">
            <li>Email: privacy@example.com</li>
            <li>Address: 123 Privacy Street, San Francisco, CA 94105</li>
          </ul>
        </section>
      </Card>
    </div>
  );
}
