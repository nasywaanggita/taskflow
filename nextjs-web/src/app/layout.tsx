import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'TaskFlow - Smart Task Management',
  description: 'Organize your tasks efficiently with TaskFlow - A modern task management application with real-time sync and smart notifications.',
  keywords: 'task management, productivity, todo, tasks, organization',
  authors: [{ name: 'TaskFlow Team' }],
  manifest: '/manifest.json',
};

// Pindahkan viewport dan themeColor ke export terpisah
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#3B82F6',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}