import { useContext } from 'react';
// Import the type and the context itself
import { AuthContext, AuthContextType } from '@/context/AuthContext'; // Adjust path

export const useAuth = (): AuthContextType => { // Return the specific context type
  // Use the imported context object here
  const context = useContext(AuthContext);

  // Type guard to ensure context is not null
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};