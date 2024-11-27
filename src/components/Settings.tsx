import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { User, Bell, Moon, Shield, HardDrive } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { BackButton } from './common/BackButton';

export const Settings = () => {
  const { profile, updateProfile } = useAuthStore();
  const settings = profile?.settings || {
    darkMode: true,
    notifications: true,
    autoBackup: false
  };

  const handleToggle = async (key: keyof typeof settings) => {
    try {
      await updateProfile({
        settings: {
          ...settings,
          [key]: !settings[key]
        }
      });
    } catch (error) {
      console.error('Error updating settings:', error);
    }
  };

  const settingsItems = [
    {
      title: 'Profile Settings',
      description: 'Manage your personal information and account settings',
      icon: User,
      to: '/profile',
      isLink: true
    },
    {
      title: 'Dark Mode',
      description: 'Toggle dark mode for a better viewing experience',
      icon: Moon,
      isToggle: true,
      key: 'darkMode' as const,
      value: settings.darkMode
    },
    {
      title: 'Notifications',
      description: 'Control push and email notification preferences',
      icon: Bell,
      isToggle: true,
      key: 'notifications' as const,
      value: settings.notifications
    },
    {
      title: 'Auto Backup',
      description: 'Automatically backup your content to the cloud',
      icon: HardDrive,
      isToggle: true,
      key: 'autoBackup' as const,
      value: settings.autoBackup
    }
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center space-x-4 mb-8">
          <BackButton />
          <h1 className="text-2xl font-bold">Settings</h1>
        </div>

        <div className="space-y-6">
          {settingsItems.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-6 bg-gray-800 rounded-xl ${
                item.isLink ? 'hover:bg-gray-700 transition-colors cursor-pointer' : ''
              }`}
            >
              {item.isLink ? (
                <Link to={item.to} className="flex items-start space-x-4">
                  <div className="p-2 bg-indigo-500/20 rounded-lg">
                    <item.icon className="w-6 h-6 text-indigo-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-1">{item.title}</h3>
                    <p className="text-gray-400 text-sm">{item.description}</p>
                  </div>
                </Link>
              ) : (
                <div className="flex items-start justify-between space-x-4">
                  <div className="flex items-start space-x-4">
                    <div className="p-2 bg-indigo-500/20 rounded-lg">
                      <item.icon className="w-6 h-6 text-indigo-500" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-1">{item.title}</h3>
                      <p className="text-gray-400 text-sm">{item.description}</p>
                    </div>
                  </div>
                  {item.isToggle && (
                    <button
                      onClick={() => handleToggle(item.key)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        item.value ? 'bg-indigo-500' : 'bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          item.value ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
