import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { siteName, siteTagline } from '@/app/site-metadata';

export const metadata: Metadata = {
  title: siteName,
  description: siteTagline,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="sv">
      <body>{children}</body>
    </html>
  );
}
