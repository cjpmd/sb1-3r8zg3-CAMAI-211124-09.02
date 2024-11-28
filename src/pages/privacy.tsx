// Privacy Policy Component - Last updated: 2024-11-28
import { Card } from "@/components/ui/card";

export default function PrivacyPolicy() {
  return (
    <Card className="max-w-4xl mx-auto p-8">
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Privacy Policy</h1>
        
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Data Collection</h2>
          <p>We collect and process your data to provide our services.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Data Protection</h2>
          <p>We protect your data using industry-standard security measures.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Data Deletion</h2>
          <p>To delete your data:</p>
          <ol className="list-decimal pl-6 space-y-2">
            <li>Open Facebook Settings</li>
            <li>Go to Settings and Privacy</li>
            <li>Select Apps and Websites</li>
            <li>Find and Remove CAMAI {'>'}</li>
          </ol>
          <p>Or email cmcdonald002@dundee.ac.uk for data deletion.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Contact</h2>
          <p>Email: cmcdonald002@dundee.ac.uk</p>
        </section>
      </div>
    </Card>
  );
}
