import type { Metadata } from 'next';
import './globals.css';
import Topnav from '@/components/layout/Topnav';

export const metadata: Metadata = {
  title: "BimaDarpan — India's Insurance Intelligence Platform",
  description:
    "Explore real-time insurance data across all Indian states. Penetration rates, claim ratios, top insurers, and the truth about India's insurance industry.",
  keywords:
    'India insurance data, state wise insurance, IRDAI data, insurance penetration India, claim settlement ratio',
  openGraph: {
    title: 'BimaDarpan',
    description: "India's Insurance Intelligence Platform",
    url: 'https://bimadarpan.in',
    siteName: 'BimaDarpan',
    locale: 'en_IN',
    type: 'website',
  },
  twitter: { card: 'summary_large_image' },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://api.fontshare.com/v2/css?f[]=clash-display@400,500,600,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="aurora-bg">
        <Topnav />
        {children}
      </body>
    </html>
  );
}
