import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2, CheckCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface PasswordRecoveryProps {
  onBack: () => void;
}

export const PasswordRecovery: React.FC<PasswordRecoveryProps> = ({ onBack }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;
      setIsSuccess(true);
    } catch (err: any) {
      console.error('Password recovery error:', err);
      setError(err.message || 'Failed to send recovery email');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">
          Recovery Email Sent
        </h3>
        <p className="text-gray-400 mb-6">
          Check your email for instructions to reset your password
        </p>
        <button
          onClick={onBack}
          className="text-indigo-400 hover:text-indigo-300 flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Sign In
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full"
    >
      <button
        onClick={onBack}
        className="text-indigo-400 hover:text-indigo-300 flex items-center gap-2 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Sign In
      </button>

      <h2 className="text-2xl font-bold text-white mb-2">Reset Password</h2>
      <p className="text-gray-400 mb-6">
        Enter your email address and we'll send you instructions to reset your password
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-200">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full rounded-lg bg-gray-800 border-gray-700 text-white px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
            disabled={isLoading}
          />
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/10 text-red-500 text-sm p-3 rounded-lg"
          >
            {error}
          </motion.div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center items-center py-3 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            'Send Recovery Email'
          )}
        </button>
      </form>
    </motion.div>
  );
};
