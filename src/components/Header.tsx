'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaTerminal, FaSearch, FaCog, FaUser, FaLock } from 'react-icons/fa';
import { ThemeToggle } from './ThemeToggle';
import SearchModal from './SearchModal';

interface AdminUser {
  id: number;
  username: string;
  last_login?: string;
}

const Header = () => {
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [setupForm, setSetupForm] = useState({ username: '', password: '', confirmPassword: '', setupKey: '' });
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasAdminUser, setHasAdminUser] = useState(true);

  // Check admin session on component mount
  useEffect(() => {
    checkAdminSession();
    checkAdminUserExists();
  }, []);

  const checkAdminSession = async () => {
    try {
      const response = await fetch('/api/admin/auth');
      const data = await response.json();
      
      if (data.authenticated) {
        setIsAdminMode(true);
        setAdminUser(data.user || null);
      } else {
        setIsAdminMode(false);
        setAdminUser(null);
      }
    } catch (error) {
      console.error('Error checking admin session:', error);
      setIsAdminMode(false);
      setAdminUser(null);
    }
  };

  const checkAdminUserExists = async () => {
    try {
      const response = await fetch('/api/admin/setup');
      const data = await response.json();
      setHasAdminUser(data.hasAdminUser);
    } catch (error) {
      console.error('Error checking admin user existence:', error);
    }
  };

  const handleAdminToggle = () => {
    if (isAdminMode) {
      handleLogout();
    } else {
      if (!hasAdminUser) {
        setShowSetupModal(true);
      } else {
        setShowAdminModal(true);
      }
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(loginForm)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setIsAdminMode(true);
        setAdminUser(data.user);
        setShowAdminModal(false);
        setLoginForm({ username: '', password: '' });
        // Dispatch custom event to notify other components
        window.dispatchEvent(new Event('adminModeChanged'));
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    if (setupForm.password !== setupForm.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }
    
    try {
      const response = await fetch('/api/admin/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: setupForm.username,
          password: setupForm.password,
          setupKey: setupForm.setupKey
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setHasAdminUser(true);
        setShowSetupModal(false);
        setSetupForm({ username: '', password: '', confirmPassword: '', setupKey: '' });
        // Auto login with the created user
        setLoginForm({ username: setupForm.username, password: setupForm.password });
        setTimeout(() => {
          setShowAdminModal(true);
        }, 500);
      } else {
        setError(data.error || 'Setup failed');
      }
    } catch (error) {
      console.error('Setup error:', error);
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth', { method: 'DELETE' });
      setIsAdminMode(false);
      setAdminUser(null);
      // Dispatch custom event to notify other components
      window.dispatchEvent(new Event('adminModeChanged'));
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <>
      <header className="bg-card-bg/95 backdrop-blur-sm border-b border-cyber-green/30 sticky top-0 z-[100]">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2 group">
              <FaTerminal className="text-cyber-green text-2xl group-hover:animate-pulse" />
              <span className="text-xl font-cyber font-bold glitch" data-text="0xJerry&apos;s Lab">
                0xJerry&apos;s Lab
              </span>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <Link 
                href="/" 
                className="hover:text-cyber-blue transition-colors duration-300 hover:glow"
              >
                ~/home
              </Link>
              <Link 
                href="/machines" 
                className="hover:text-cyber-blue transition-colors duration-300"
              >
                ./htb
              </Link>
              <Link 
                href="/news" 
                className="hover:text-cyber-blue transition-colors duration-300"
              >
                ./news
              </Link>
              <Link 
                href="/forums" 
                className="hover:text-cyber-blue transition-colors duration-300"
              >
                ./forums
              </Link>
              <Link 
                href="/tools" 
                className="hover:text-cyber-blue transition-colors duration-300"
              >
                ./tools
              </Link>
              <Link 
                href="/about" 
                className="hover:text-cyber-blue transition-colors duration-300"
              >
                ./about
              </Link>
            </nav>

            {/* Theme, Admin & Search */}
            <div className="flex items-center space-x-4">
              <button 
                className="text-cyber-green hover:text-cyber-blue transition-colors"
                title="Search"
                onClick={() => setShowSearchModal(true)}
              >
                <FaSearch />
              </button>
              <ThemeToggle />
              <div className="relative">
                <button 
                  onClick={handleAdminToggle}
                  className={`p-2 rounded-full transition-all duration-300 ${
                    isAdminMode 
                      ? 'bg-cyber-pink/20 text-cyber-pink hover:text-red-400' 
                      : 'text-cyber-green hover:text-cyber-blue hover:bg-cyber-green/20'
                  }`}
                  title={isAdminMode ? 'Exit Admin Mode' : 'Enter Admin Mode'}
                >
                  <FaCog className={isAdminMode ? 'animate-spin' : ''} />
                </button>
                {isAdminMode && (
                  <div className="absolute -bottom-2 -right-1 w-3 h-3 bg-cyber-pink rounded-full animate-pulse" />
                )}
              </div>
            </div>
          </div>

          {/* Mobile Navigation */}
          <nav className="md:hidden mt-4 flex flex-wrap gap-4">
            <Link href="/" className="text-sm hover:text-cyber-blue">~/home</Link>
            <Link href="/machines" className="text-sm hover:text-cyber-blue">./htb</Link>
            <Link href="/news" className="text-sm hover:text-cyber-blue">./news</Link>
            <Link href="/forums" className="text-sm hover:text-cyber-blue">./forums</Link>
            <Link href="/tools" className="text-sm hover:text-cyber-blue">./tools</Link>
            <Link href="/about" className="text-sm hover:text-cyber-blue">./about</Link>
          </nav>
        </div>
      </header>

      {/* Admin Login Modal */}
      {showAdminModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[200]">
          <div className="bg-card-bg border border-cyber-green p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-bold mb-4 text-center">
              <span className="glitch" data-text="ADMIN ACCESS REQUIRED">
                ADMIN ACCESS REQUIRED
              </span>
            </h3>
            {error && (
              <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded text-red-400 text-sm">
                {error}
              </div>
            )}
            <form onSubmit={handleAdminLogin}>
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Username"
                  value={loginForm.username}
                  onChange={(e) => setLoginForm({...loginForm, username: e.target.value})}
                  className="w-full bg-terminal-bg border border-cyber-green/50 p-3 rounded text-cyber-green focus:border-cyber-green focus:outline-none mb-3"
                  required
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                  className="w-full bg-terminal-bg border border-cyber-green/50 p-3 rounded text-cyber-green focus:border-cyber-green focus:outline-none"
                  required
                />
              </div>
              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-cyber-green text-black py-2 px-4 rounded hover:bg-cyber-blue transition-colors font-bold disabled:opacity-50"
                >
                  {loading ? 'AUTHENTICATING...' : 'ACCESS'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAdminModal(false);
                    setLoginForm({ username: '', password: '' });
                    setError('');
                  }}
                  className="flex-1 bg-transparent border border-cyber-green text-cyber-green py-2 px-4 rounded hover:bg-cyber-green hover:text-black transition-colors"
                >
                  ABORT
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Setup Modal */}
      {showSetupModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[200]">
          <div className="bg-card-bg border border-cyber-green p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-bold mb-4 text-center">
              <span className="glitch" data-text="ADMIN SETUP REQUIRED">
                ADMIN SETUP REQUIRED
              </span>
            </h3>
            <p className="text-sm text-gray-400 mb-4 text-center">
              Create the first admin user for this system.
            </p>
            {error && (
              <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded text-red-400 text-sm">
                {error}
              </div>
            )}
            <form onSubmit={handleAdminSetup}>
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Setup Key"
                  value={setupForm.setupKey}
                  onChange={(e) => setSetupForm({...setupForm, setupKey: e.target.value})}
                  className="w-full bg-terminal-bg border border-cyber-green/50 p-3 rounded text-cyber-green focus:border-cyber-green focus:outline-none mb-3"
                  required
                />
                <input
                  type="text"
                  placeholder="Admin Username"
                  value={setupForm.username}
                  onChange={(e) => setSetupForm({...setupForm, username: e.target.value})}
                  className="w-full bg-terminal-bg border border-cyber-green/50 p-3 rounded text-cyber-green focus:border-cyber-green focus:outline-none mb-3"
                  required
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={setupForm.password}
                  onChange={(e) => setSetupForm({...setupForm, password: e.target.value})}
                  className="w-full bg-terminal-bg border border-cyber-green/50 p-3 rounded text-cyber-green focus:border-cyber-green focus:outline-none mb-3"
                  required
                />
                <input
                  type="password"
                  placeholder="Confirm Password"
                  value={setupForm.confirmPassword}
                  onChange={(e) => setSetupForm({...setupForm, confirmPassword: e.target.value})}
                  className="w-full bg-terminal-bg border border-cyber-green/50 p-3 rounded text-cyber-green focus:border-cyber-green focus:outline-none"
                  required
                />
              </div>
              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-cyber-green text-black py-2 px-4 rounded hover:bg-cyber-blue transition-colors font-bold disabled:opacity-50"
                >
                  {loading ? 'CREATING...' : 'CREATE ADMIN'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowSetupModal(false);
                    setSetupForm({ username: '', password: '', confirmPassword: '', setupKey: '' });
                    setError('');
                  }}
                  className="flex-1 bg-transparent border border-cyber-green text-cyber-green py-2 px-4 rounded hover:bg-cyber-green hover:text-black transition-colors"
                >
                  CANCEL
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Search Modal */}
      <SearchModal 
        isOpen={showSearchModal} 
        onClose={() => setShowSearchModal(false)} 
      />
    </>
  );
};

export default Header;
