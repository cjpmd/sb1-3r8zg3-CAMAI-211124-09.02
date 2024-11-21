import React from 'react';
import { Hero } from '../components/landing/Hero';
import { AuthForm } from '../components/auth/AuthForm';
import { PricingSection } from '../components/landing/PricingSection';

export const LandingPage = () => {
  return (
    <div className="min-h-screen bg-black">
      <Hero />
      <PricingSection />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="flex justify-center">
          <AuthForm />
        </div>
      </div>
    </div>
  );
};