export const metadata = {
  title: 'About Oddlex - Free Business Tools for Entrepreneurs | Our Mission & Values',
  description: 'Learn about Oddlex - providing 40+ professional-grade business tools completely free. Discover our mission to empower entrepreneurs, small businesses, and freelancers with accessible, high-quality solutions. No hidden costs, forever free.',
  keywords: [
    'about oddlex',
    'free business tools',
    'entrepreneur tools',
    'small business software',
    'free invoice generator',
    'free crm',
    'business management tools',
    'startup tools',
    'oddlex mission',
    'free accounting software',
    'business productivity tools',
    'professional business tools',
    'free forever tools',
    'small business solutions',
  ],
  authors: [{ name: 'Oddlex Business Hub' }],
  creator: 'Oddlex Business Hub',
  publisher: 'Oddlex Founder & CEO',

  openGraph: {
    title: 'About Oddlex Business Hub - 40+ Free Business Tools for Everyone',
    description: 'Empowering 10,000+ entrepreneurs with professional business tools. 100% free, forever. No hidden charges, no premium tiers.',
    url: 'https://oddlex.com/about',
    siteName: 'Oddlex Business Hub',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: '/og-about.jpg',
        width: 1200,
        height: 630,
        alt: 'Oddlex - Free Business Tools',
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    title: 'About Oddlex - Free Business Tools for All',
    description: '40+ professional tools, 10,000+ happy users, 100% free forever. Empowering small businesses & entrepreneurs.',
    images: ['/twitter-about.jpg'],
    creator: '@oddlex',
  },

  alternates: {
    canonical: 'https://oddlex.com/about',
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  category: 'Business Tools',
};

export default function AboutLayout({ children }) {
  return (
    // SIRF YEH LINE RETURN KARO - <html> aur <body> HATA DO
    <>{children}</>
  );
}