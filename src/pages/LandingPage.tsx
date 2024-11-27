import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Hero } from '../components/landing/Hero';
import { AuthForm } from '../components/auth/AuthForm';
import { PricingSection } from '../components/landing/PricingSection';

export const LandingPage = () => {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const pricingRef = useRef<HTMLDivElement>(null);
  const authRef = useRef<HTMLDivElement>(null);

  const handleGetStarted = () => {
    pricingRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handlePlanSelect = (priceId: string) => {
    setSelectedPlan(priceId);
    authRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-black overflow-x-hidden">
      <section className="min-h-screen">
        <Hero onGetStarted={handleGetStarted} />
      </section>

      <section ref={pricingRef} className="min-h-screen">
        <PricingSection onSelectPlan={handlePlanSelect} />
      </section>

      <section 
        ref={authRef} 
        className="min-h-screen flex items-center justify-center"
      >
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="flex justify-center">
            <AuthForm selectedPlan={selectedPlan} />
          </div>
        </div>
      </section>
    </div>
  );
};