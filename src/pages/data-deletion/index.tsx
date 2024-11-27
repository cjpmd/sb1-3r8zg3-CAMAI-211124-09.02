import { useEffect } from 'react';
import { api } from '@/utils/api';

export default function DataDeletion() {
  const { mutate: handleDataDeletion } = api.dataDeletion.handleDataDeletion.useMutation();

  useEffect(() => {
    // Check for signed_request in URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const signedRequest = urlParams.get('signed_request');

    if (signedRequest) {
      handleDataDeletion({ signed_request: signedRequest });
    }
  }, [handleDataDeletion]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-8">Data Deletion Request</h1>
        
        <div className="bg-white/10 p-8 rounded-lg shadow-lg">
          <p className="text-lg mb-6">
            We take your privacy seriously. When we receive a data deletion request:
          </p>
          
          <ul className="list-disc pl-6 space-y-4 mb-8">
            <li>All your personal information will be permanently deleted</li>
            <li>Your social media connections will be removed</li>
            <li>Your content and preferences will be erased</li>
            <li>Your account will be permanently deactivated</li>
          </ul>
          
          <div className="bg-yellow-500/20 p-4 rounded-md mb-8">
            <h2 className="text-xl font-semibold mb-2">Important Notice</h2>
            <p>
              This process cannot be undone. Once your data is deleted, it cannot be recovered.
            </p>
          </div>
          
          <p className="text-sm opacity-75">
            This data deletion mechanism complies with the requirements of the Instagram Platform.
            For more information about how we handle your data, please refer to our{' '}
            <a href="/privacy" className="text-blue-400 hover:text-blue-300 underline">
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
