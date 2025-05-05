// frontend/src/pages/_document.tsx
import { Html, Head, Main, NextScript } from 'next/document'
// No specific TS changes needed here usually, unless using custom props which we are not.

export default function Document() {
  return (
    <Html lang="en" className="scroll-smooth">
      <Head>
        {/* Favicon links etc. */}
         <link rel="icon" href="/favicon.ico" sizes="any" />
         <link rel="icon" href="/logo.svg" type="image/svg+xml" />
         <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
         <meta name="theme-color" content="#10b981" />
      </Head>
      {/* bg-background is defined in tailwind.config.js and applied via globals.css or directly */}
      <body className="bg-background text-text_primary antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}