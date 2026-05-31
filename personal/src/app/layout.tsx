import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AI Defense Project — Personal Assessment',
  description:
    'A thoughtful look at where you stand with AI. Get your personal scores and a clear path forward.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <script defer src="https://agents.tail9083ed.ts.net/analytics/script.js" data-website-id="8e949287-0a07-41e8-b7d8-ec40bda18dbb"></script>
      </head>
      <body className="min-h-screen bg-cream font-sans antialiased text-ink">
        {children}
      </body>
    </html>
  );
}
