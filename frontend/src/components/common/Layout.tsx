import React, { ReactNode } from 'react'; // Import ReactNode
import Head from 'next/head';
import Navbar from './Navbar';

// Define props type
interface LayoutProps {
    children: ReactNode; // Use ReactNode for children
    title?: string; // Optional title prop
}

// Use React.FC (Functional Component) type and props type
const Layout: React.FC<LayoutProps> = ({ children, title = "Health & Fitness Tracker" }) => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Head>
        <title>{title}</title>
        <meta name="description" content="Personalized Health and Fitness Tracker" />
        <link rel="icon" href="/favicon.ico" /> {/* Add a favicon */}
      </Head>

      <Navbar /> {/* Assumes Navbar requires no props for now */}

      <main className="flex-grow container mx-auto px-4 py-8">
        {children}
      </main>

      <footer className="bg-gray-100 text-center py-4 text-text_secondary text-sm">
        © {new Date().getFullYear()} Health Tracker App. All rights reserved.
      </footer>
    </div>
  );
};

export default Layout;