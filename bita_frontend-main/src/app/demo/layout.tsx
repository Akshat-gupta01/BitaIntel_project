import type { Metadata, Viewport } from 'next';
import '../globals.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { JsonLd } from '@/components/shared/JsonLd';
import { createWebsiteJsonLd } from '@/lib/schema';
import { AuthProvider } from '@/context/AuthContext';
import { site } from '@/config/site';
import { themeConfig, getThemeCssString, getPrimaryPalette } from '@/config/theme';
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: 'BITAINTEL — Enterprise B2B Verification & Trust Intelligence',
    template: '%s | BITAINTEL',
  },
  description: site.description,
  applicationName: site.name,
  keywords: [
    'B2B Verification',
    'Vendor Due Diligence',
    'MCA Company Search',
    'GSTN Filing Verification',
    'Corporate Trust Score',
    'Enterprise Risk Management',
    'Supplier Auditing',
  ],
  authors: [{ name: 'BITAINTEL Technologies' }],
  openGraph: {
    type: 'website',
    siteName: site.name,
    title: 'BITAINTEL — Verify Before You Trust',
    description: site.description,
    locale: 'en_US',
  },
  robots: {
    index: true,
    follow: true,
  },
  formatDetection: {
    telephone: false,
    email: false,
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32' },
      { url: '/icon.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: getPrimaryPalette(themeConfig.primaryColor)[600],
};

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const themeCss = getThemeCssString(themeConfig.primaryColor);

  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <style id="theme-tokens" dangerouslySetInnerHTML={{ __html: themeCss }} />
      </head>
      <body
        className="min-h-screen flex flex-col bg-[var(--canvas)] text-[var(--text)] antialiased selection:bg-primary-100 selection:text-primary-900"
        suppressHydrationWarning
      >
        <AuthProvider>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-slate-900 focus:px-4 focus:py-2 focus:text-xs focus:font-bold focus:!text-white focus:text-white focus:shadow-xl"
          >
            Skip to main content
          </a>
          <Header />
          <main id="main-content" className="flex-1">
            {children}
          </main>
          <Footer />
          <JsonLd schema={createWebsiteJsonLd()} />
          <Toaster
            position="top-right"
            richColors
            closeButton
            toastOptions={{
              style: {
                borderRadius: '1rem',
                border: '1px solid #e2e8f0',
                fontSize: '0.8125rem',
                boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.08)',
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
