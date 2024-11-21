import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';

export const AuthForm = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const { signIn, signUp } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      if (isLogin) {
        await signIn(email, password);
      } else {
        await signUp(email, password, username);
      }
      navigate('/app');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleBypassAuth = () => {
    localStorage.setItem('bypassAuth', 'true');
    navigate('/app');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {!isLogin && (
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-200">
              Username
            </label>
            <input
              id="username"
              type="text"
              required={!isLogin}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 block w-full rounded-lg bg-gray-800 border-gray-700 text-white px-4 py-2 focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-200">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full rounded-lg bg-gray-800 border-gray-700 text-white px-4 py-2 focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-200">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full rounded-lg bg-gray-800 border-gray-700 text-white px-4 py-2 focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {error && (
          <p className="text-red-500 text-sm">{error}</p>
        )}

        <button
          type="submit"
          className="w-full flex justify-center py-3 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition-colors"
        >
          {isLogin ? 'Sign In' : 'Sign Up'}
        </button>

        <button
          type="button"
          onClick={handleBypassAuth}
          className="w-full flex justify-center py-3 px-4 rounded-lg bg-gray-600 hover:bg-gray-700 text-white font-medium transition-colors"
        >
          Bypass Authentication (Test Mode)
        </button>

        <p className="text-center text-sm text-gray-400">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-indigo-400 hover:text-indigo-300"
          >
            {isLogin ? 'Sign Up' : 'Sign In'}
          </button>
        </p>
      </form>
    </motion.div>
  );
};