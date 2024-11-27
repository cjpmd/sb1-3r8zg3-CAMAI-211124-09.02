import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

export default function DeletionStatus() {
  const [searchParams] = useSearchParams();
  const confirmationId = searchParams.get('id');

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="bg-white/10 p-8 rounded-lg shadow-lg">
          <h1 className="text-3xl font-bold mb-6">Data Deletion Status</h1>
          
          <div className="space-y-4">
            <p className="text-lg">
              Confirmation Code: <span className="font-mono">{confirmationId}</span>
            </p>
            
            <div className="bg-green-500/20 p-4 rounded-md">
              <h2 className="text-xl font-semibold text-green-400 mb-2">
                Data Deletion Complete
              </h2>
              <p>
                Your data has been successfully deleted from our platform. This process cannot be undone.
              </p>
            </div>
            
            <div className="mt-8 text-sm opacity-75">
              <p>
                If you have any questions about your data deletion request, please contact our support team
                or refer to our{' '}
                <a href="/privacy" className="text-blue-400 hover:text-blue-300 underline">
                  Privacy Policy
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
