import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ReactQueryProvider } from '@/components/providers/ReactQueryProvider';
import { ToastProvider } from '@/components/ui/ToastContainer';
import { SessionProvider } from '@/components/providers/SessionProvider';
import type { ReactNode } from 'react';

const inter = Inter({ subsets: ['latin'] });

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://skillhub.proclaw.cc';

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: 'Skill Hub - AI Agent Skills Registry',
    template: '%s | Skill Hub',
  },
  description: 'Enterprise-grade, open-source AI agent skill registry. Discover, publish, and manage high-quality AI agent skills.',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    siteName: 'Skill Hub',
    title: 'Skill Hub - AI Agent Skills Registry',
    description: 'Enterprise-grade, open-source AI agent skill registry. Discover, publish, and manage high-quality AI agent skills.',
    images: [
      {
        url: '/skillhub.png',
        width: 1200,
        height: 630,
        alt: 'Skill Hub',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Skill Hub - AI Agent Skills Registry',
    description: 'Enterprise-grade, open-source AI agent skill registry. Discover, publish, and manage high-quality AI agent skills.',
    images: ['/skillhub.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-video-preview': -1,
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: baseUrl,
  },
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Skill Hub',
    url: baseUrl,
    description: 'Enterprise-grade, open-source AI agent skill registry.',
    inLanguage: 'zh-CN',
    publisher: {
      '@type': 'Organization',
      name: 'Skill Hub',
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/skillhub.png`,
      },
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${baseUrl}/skills?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <html lang="zh-CN">
      <body className={inter.className}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <SessionProvider>
          <ReactQueryProvider>
            <ToastProvider>{children}</ToastProvider>
          </ReactQueryProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
