import '@/styles/globals.css' // Adjust path if needed
import { AuthProvider } from '@/context/AuthContext' // Adjust path if needed
import type { AppProps } from 'next/app' // Import AppProps type

function MyApp({ Component, pageProps }: AppProps) { // Add type for props
  return (
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  )
}

export default MyApp