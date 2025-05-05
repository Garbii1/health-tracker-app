import React from 'react';
import Link from 'next/link';
import Image from 'next/image'; // Import Next.js Image component
import { useAuth } from '@/hooks/useAuth'; // Adjust path
import { useRouter } from 'next/router';
import { ArrowLeftOnRectangleIcon, UserPlusIcon, ChartBarIcon, HomeIcon } from '@heroicons/react/24/outline';

const Navbar: React.FC = () => { // Use React.FC for functional component type
  const { user, logoutAction, loading, isAuthenticated } = useAuth();
  const router = useRouter(); // No changes needed for router

  const handleLogout = (): void => { // Add void return type
    logoutAction();
  };

  return (
    <nav className="bg-surface shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-3">
          {/* Logo and App Name */}
          <Link href="/" legacyBehavior>
              <a className="flex items-center space-x-2">
                 {/* Ensure logo path is correct */}
                 <Image src="/logo.svg" alt="App Logo" width={32} height={32} />
                 <span className="text-xl font-semibold text-primary">Health Tracker</span>
              </a>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-4">
            <Link href="/" legacyBehavior>
                <a className="text-text_secondary hover:text-primary transition-colors flex items-center space-x-1">
                    <HomeIcon className="h-5 w-5"/>
                    <span>Home</span>
                </a>
            </Link>

            {/* Conditional rendering based on auth state */}
            {!loading && isAuthenticated && (
              <>
                <Link href="/dashboard" legacyBehavior>
                    <a className="text-text_secondary hover:text-primary transition-colors flex items-center space-x-1">
                      <ChartBarIcon className="h-5 w-5" />
                      <span>Dashboard</span>
                    </a>
                </Link>
                <span className="text-text_secondary">|</span>
                {/* Use optional chaining for user properties */}
                <span className="text-text_secondary font-medium">Hi, {user?.username ?? 'User'}!</span>
                <button
                  onClick={handleLogout}
                  className="flex items-center text-red-500 hover:text-red-700 transition-colors"
                  title="Logout"
                >
                  <ArrowLeftOnRectangleIcon className="h-5 w-5 mr-1" />
                  Logout
                </button>
              </>
            )}
            {!loading && !isAuthenticated && (
              <>
                <Link href="/login" className="text-text_secondary hover:text-primary transition-colors">Login</Link>
                <Link href="/register" legacyBehavior>
                    <a className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-md transition-colors text-sm font-medium flex items-center space-x-1">
                        <UserPlusIcon className="h-5 w-5" />
                        <span>Register</span>
                    </a>
                </Link>
              </>
            )}
             {loading && (
                 <span className="text-text_secondary text-sm">Loading...</span>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;