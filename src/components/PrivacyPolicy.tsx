import { Helmet } from "react-helmet";

export const PrivacyPolicy = () => {
  return (
    <>
      <Helmet>
        <title>Privacy Policy - CAMAI</title>
        <meta name="description" content="CAMAI Privacy Policy" />
      </Helmet>
      <main className="flex min-h-screen flex-col items-center justify-center">
        <div className="container max-w-3xl mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
          
          <section className="space-y-4 mb-8">
            <h2 className="text-2xl font-semibold">Information We Collect</h2>
            <p>
              We collect information you provide directly to us when using CAMAI,
              including:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Account information (name, email, profile picture)</li>
              <li>Content you create and upload</li>
              <li>Social media account connections</li>
              <li>Usage data and analytics</li>
            </ul>
          </section>

          <section className="space-y-4 mb-8">
            <h2 className="text-2xl font-semibold">How We Use Your Information</h2>
            <p>
              We use the information we collect to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide and improve our services</li>
              <li>Generate AI-powered content</li>
              <li>Manage your social media integrations</li>
              <li>Analyze usage patterns and optimize performance</li>
            </ul>
          </section>

          <section className="space-y-4 mb-8">
            <h2 className="text-2xl font-semibold">Data Sharing and Disclosure</h2>
            <p>
              We may share your information with:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Social media platforms you connect to</li>
              <li>Service providers and partners</li>
              <li>Law enforcement when required by law</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Data Deletion Instructions</h2>
            <p>
              You have the right to request deletion of your personal data. To delete your data:
            </p>
            <ol className="list-decimal pl-6 space-y-2">
              <li>Go to your Account Settings</li>
              <li>Click on "Delete Account"</li>
              <li>Confirm your decision</li>
            </ol>
            <p className="text-sm opacity-75 mt-4">
              Note: This process will permanently remove your data from our systems.
            </p>
          </section>
        </div>
      </main>
    </>
  );
};
