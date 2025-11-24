import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-white/10 bg-gradient-to-t from-slate-950 via-slate-900/80 to-transparent backdrop-blur-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 sm:gap-3 lg:gap-4 sm:gap-3 sm:gap-2 sm:gap-3 lg:gap-4 lg:gap-6 lg:gap-8">

          {/* ✅ Logo + Text Fixed */}
          <div className="flex items-start space-x-3">
            <img
              src="/logo-invoice.png"
              alt="Oddlex Business Hub Logo"
              className="w-10 h-10 rounded-lg"
            />
            <div>
              <h2 className="text-base sm:text-lg md:text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Oddlex Business Hub
              </h2>
              <p className="text-gray-400 text-sm mt-1 leading-relaxed">
                Your all-in-one business platform with 40+ free tools for invoicing, CRM, analytics, and more — built for businesses & freelancers.
              </p>
            </div>
          </div>

          {/* ✅ Tools */}
          <div>
            <h4 className="font-bold mb-4">Tools</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><Link href="/Invoice" className="hover:text-purple-400 transition">Invoice Generator</Link></li>
              <li><Link href="/tools/budget-planner" className="hover:text-purple-400 transition">Budget Planner</Link></li>
              <li><Link href="/tools/expense-tracker" className="hover:text-purple-400 transition">Expense Tracker</Link></li>
              <li><Link href="/tools" className="hover:text-purple-400 transition">All Tools</Link></li>
            </ul>
          </div>

          {/* ✅ Company */}
          <div>
            <h4 className="font-bold mb-4">Company</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><Link href="/about" className="hover:text-purple-400 transition">About</Link></li>
              <li><Link href="/blog" className="hover:text-purple-400 transition">Blog</Link></li>
              <li><Link href="/contact" className="hover:text-purple-400 transition">Contact</Link></li>
            </ul>
          </div>

          {/* ✅ Legal */}
          <div>
            <h4 className="font-bold mb-4">Legal</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><Link href="/privacy" className="hover:text-purple-400 transition">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-purple-400 transition">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        {/* ✅ Bottom Bar */}
        <div className="border-t border-white/10 mt-6 pt-4 text-center text-gray-400 text-xs">
          <p>
            © 2025 <span className="text-white font-semibold">Oddlex</span>. All rights reserved. 
            Made with ❤️ for businesses & freelancers.
          </p>
        </div>
      </div>
    </footer>
  );
}
