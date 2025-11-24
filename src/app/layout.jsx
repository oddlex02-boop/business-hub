import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import '../styles/globals.css';
import { AuthProvider } from '@/components/AuthContext';

export const metadata = {
  title: 'Your All-in-One Platform for Work, Clients & Growth | Oddlex Business Hub',
  description:
    'Oddlex Business Hub - Free professional tools - Invoice Generator, Payment Tracker, clients, projects & growth in one platform. Oddlex offers 40+ free business tools for freelancers and entrepreneurs.',
  keywords:
    'Oddlex Business Hub, business tools, freelancer tools, free invoicing app, online invoice generator, CRM platform, project management, client manager, payment tracker, business platform, freelancer CRM, free business suite, work management, invoice software, inventory tracker, business growth tools, 40+ free tools, all-in-one platform, small business tools, productivity suite',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Mobile/Tablet layout fix */}
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1"
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