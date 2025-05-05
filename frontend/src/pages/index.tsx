import Layout from '@/components/common/Layout'; // Adjust path
import Link from 'next/link';
import { ArrowRightIcon } from '@heroicons/react/24/solid';
import type { NextPage } from 'next'; // Import page type

const HomePage: NextPage = () => { // Use NextPage type
  return (
    <Layout title="Welcome - Health Tracker">
      <div className="text-center py-16 md:py-24">
        <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
          Track Your Health Journey
        </h1>
        <p className="text-lg md:text-xl text-text_secondary mb-8 max-w-2xl mx-auto">
          Monitor your weight, steps, meals, and fitness goals all in one place.
          Visualize your progress and stay motivated!
        </p>
        <div className="flex justify-center space-x-4">
          <Link href="/register" legacyBehavior>
             {/* legacyBehavior often needed for custom components/styling inside Link */}
             <a className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-lg font-medium text-lg transition-colors duration-200 inline-flex items-center">
                 Get Started
                 <ArrowRightIcon className="h-5 w-5 ml-2" />
             </a>
          </Link>
          <Link href="/login" legacyBehavior>
             <a className="bg-gray-200 hover:bg-gray-300 text-text_primary px-6 py-3 rounded-lg font-medium text-lg transition-colors duration-200">
                 Login
             </a>
          </Link>
        </div>

        {/* Optional: Add feature sections */}
        <div className="mt-16 md:mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto text-left">
            <div className="bg-surface p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-primary mb-2">Track Metrics</h3>
                <p className="text-text_secondary">Log weight, steps, and heart rate easily. See your trends over time with intuitive charts.</p>
            </div>
            <div className="bg-surface p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-primary mb-2">Log Meals</h3>
                <p className="text-text_secondary">Keep a record of your meals and their calorie counts to stay mindful of your nutrition.</p>
            </div>
            <div className="bg-surface p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-primary mb-2">Set Goals</h3>
                <p className="text-text_secondary">Define your fitness goals, track their status, and celebrate your achievements.</p>
            </div>
        </div>
      </div>
    </Layout>
  );
}

export default HomePage;