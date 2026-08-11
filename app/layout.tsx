import './globals.css';
import type { Metadata } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-space' });

export const metadata: Metadata = {
  metadataBase: new URL('https://inflationos.app'),
  title: 'InflationOS — Personal Inflation Intelligence Platform',
  description:
    'AI-powered financial intelligence that predicts how inflation affects YOUR salary, savings, investments and future lifestyle. Know Your Future Before Inflation Changes It.',
  keywords: [
    'inflation',
    'personal finance',
    'AI financial advisor',
    'savings planner',
    'retirement planner',
    'investment advisor',
  ],
  openGraph: {
    title: 'InflationOS — Personal Inflation Intelligence Platform',
    description:
      'AI-powered financial intelligence that predicts how inflation affects YOUR salary, savings, investments and future lifestyle.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'InflationOS — Personal Inflation Intelligence Platform',
    description:
      'AI-powered financial intelligence that predicts how inflation affects YOUR salary, savings, investments and future lifestyle.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en-IN" className={`${inter.variable} ${spaceGrotesk.variable} dark`} suppressHydrationWarning>
      <body className="bg-background text-foreground antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
