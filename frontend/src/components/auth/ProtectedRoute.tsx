import React, { useEffect, ReactNode } from 'react'; // Import ReactNode
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/router';
import Layout from '@/components/common/Layout'; // For consistent layout during loading

// Define props type
interface ProtectedRouteProps {
    children: ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If finished loading and not authenticated, redirect to login
    if (!loading && !isAuthenticated) {
        // Using replace avoids adding the dashboard URL to history when redirecting away
      router.replace('/login');
    }
  }, [loading, isAuthenticated, router]);

  // If loading or not authenticated (and waiting for redirect), show loading or null/Layout
  if (loading || !isAuthenticated) {
    return <Layout title="Loading..."><div className='text-center p-10'>Loading user data...</div></Layout>;
    // Alternatively return null; or a dedicated spinner component
    // return null;
  }

  // If authenticated, render the child components. Fragment <></> is fine.
  return <>{children}</>;
};

export default ProtectedRoute;