import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import '../styles/globals.css';
import { AuthProvider } from '@/components/AuthContext';

export const metadata = {
  // Base title + template (agar baad me per-page title use karo)
  title: {
    default: 'Oddlex Business Hub – All-in-One Tools for Work, Clients & Growth',
    template: '%s | Oddlex Business Hub',
  },

  description:
    'Oddlex Business Hub gives you 40+ free professional tools for invoices, payments, CRM, analytics, projects and growth – all in one powerful business dashboard.',

  keywords: [
    'Oddlex Business Hub',
    'business tools',
    'freelancer tools',
    'invoice generator',
    'payment reminder',
    'payment tracker',
    'online invoicing',
    'CRM platform',
    'client manager',
    'project management',
    'task manager',
    'budget planner',
    'small business tools',
    'productivity suite',
    'free business suite',
    'all in one platform'
  ],

  metadataBase: new URL('https://oddlex.in'),
  alternates: {
    canonical: 'https://oddlex.in',
  },

  openGraph: {
    title: 'Oddlex Business Hub – Enterprise-grade tools for freelancers & small businesses',
    description:
      'Use 40+ free tools to manage invoices, payments, clients, analytics, projects and more from one clean dashboard.',
    url: 'https://oddlex.in',
    siteName: 'Oddlex Business Hub',
    type: 'website',
    images: [
      {
        url: '/og-image.png', // make sure this image exists in /public
        width: 1200,
        height: 630,
        alt: 'Oddlex Business Hub – Dashboard preview',
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    title: 'Oddlex Business Hub – Free Business & Client Tools',
    description:
      'Manage your work, clients, payments and growth with Oddlex Business Hub tools.',
    images: ['/og-image.png'],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-snippet': -1,
      'max-image-preview': 'large',
      'max-video-preview': -1,
    },
  },

  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Mobile / responsive */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        {/* JSON-LD: Software Application schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'SoftwareApplication',
              name: 'Oddlex Business Hub',
              operatingSystem: 'Web',
              applicationCategory: 'BusinessApplication',
              description:
                'Oddlex Business Hub offers free professional tools for invoices, payment reminders, CRM, analytics, projects and productivity.',
              url: 'https://oddlex.in',
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'INR',
              },
              publisher: {
                '@type': 'Organization',
                name: 'Oddlex',
              },
            }),
          }}
        />
      </head>
      <body className="min-w-0 overflow-x-hidden bg-slate-950 text-white">
        <AuthProvider>
          <Navbar />
          <main className="w-full overflow-hidden">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
