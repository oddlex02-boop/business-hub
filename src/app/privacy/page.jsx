// src/app/privacy/page.jsx
import Link from "next/link";

export const metadata = {
  title: "Privacy Policy — Oddlex Business Hub",
  description:
    "Oddlex Privacy Policy — how we collect, use, store and protect your data. Learn about cookies, third-party services, rights, and contact information.",
  keywords: ["Oddlex", "Privacy Policy", "data protection", "cookies", "GDPR", "terms"],
};

const LAST_UPDATED = "November 20, 2025";
const SUPPORT_EMAIL = "support@oddlex.com";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Card */}
        <div className="relative mb-8 p-8 bg-gradient-to-r from-purple-600/10 to-pink-600/10 backdrop-blur-sm rounded-3xl border border-white/10">
          <div className="inline-block px-3 py-1 bg-purple-500 rounded-full text-sm font-medium mb-4">
            Privacy
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">Privacy Policy</h1>
          <p className="text-gray-300 max-w-2xl">
            This Privacy Policy explains how <strong>Oddlex</strong> ("we", "us", "our") collects, uses, shares
            and protects personal information when you use our website and services. Last updated: {LAST_UPDATED}.
          </p>
          <div className="mt-4 text-sm text-gray-400">
            <Link href="/" className="underline">Home</Link> · <Link href="/about" className="underline">About</Link> · <Link href="/terms" className="underline">Terms</Link>
          </div>
        </div>

        {/* Content Card */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-8 prose prose-invert max-w-none">
          <section>
            <h2>1. Introduction</h2>
            <p>
              Oddlex provides an all-in-one business hub offering free tools for freelancers, small businesses and startups.
              We respect your privacy and commit to protecting your personal information. This policy describes what we collect,
              why we collect it, and how you can control it.
            </p>
          </section>

          <section>
            <h2>2. Information We Collect</h2>
            <p>We collect information in three main categories:</p>
            <ul>
              <li>
                <strong>Personal Information</strong> — data you provide directly: name, email address, phone number, business name,
                profile photo, uploaded files (invoices, logos), billing details (if you provide them), and other contact information.
              </li>
              <li>
                <strong>Usage & Technical Data</strong> — automatically collected information when you use our services:
                IP address, browser type, device information, operating system, pages visited, timestamps, referrer, and usage events.
              </li>
              <li>
                <strong>Transactional Data</strong> — information produced when you use financial or invoicing tools (invoice numbers,
                amounts, taxes). This is stored securely to power the service and reporting.
              </li>
            </ul>
          </section>

          <section>
            <h2>3. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul>
              <li>Provide, operate, maintain and improve the services and user experience.</li>
              <li>Process invoices, exports, and other transactions (when applicable).</li>
              <li>Communicate with you — account messages, updates, and support replies.</li>
              <li>Send optional marketing communications if you opt in, and transactional emails (password resets, receipts).</li>
              <li>Analyze usage trends, generate analytics, and improve product features.</li>
              <li>Comply with legal obligations and protect our rights.</li>
            </ul>
          </section>

          <section>
            <h2>4. Legal Basis for Processing (where applicable)</h2>
            <p>
              If you are in the EEA or other jurisdictions requiring a legal basis, we rely on:
            </p>
            <ul>
              <li><strong>Performance of a contract:</strong> to provide the services you requested (e.g., invoice creation).</li>
              <li><strong>Consent:</strong> for marketing communications or optional features where you grant consent.</li>
              <li><strong>Legitimate interests:</strong> to operate and secure our service, prevent fraud, and improve our product.</li>
            </ul>
          </section>

          <section>
            <h2>5. Cookies & Tracking</h2>
            <p>
              We and our third-party partners use cookies, local storage and similar technologies to collect anonymous analytics and
              to keep your session. Cookies may be used for:
            </p>
            <ul>
              <li>Authentication and session management</li>
              <li>Remembering preferences and settings</li>
              <li>Analytics and performance measurement</li>
              <li>Advertising and marketing (only when explicitly used and disclosed)</li>
            </ul>
            <p>
              You can control cookies in your browser settings. Disabling certain cookies may impact the functionality of the site.
            </p>
          </section>

          <section>
            <h2>6. Third-Party Services & Integrations</h2>
            <p>
              We use trusted third-party services to operate and improve Oddlex (for example hosting, analytics, email delivery,
              and payment gateways). These providers may collect limited information to perform their services on our behalf.
              Examples include (but are not limited to): hosting providers, analytics tools, email delivery services, and payment processors.
            </p>
            <p>
              When you use an integration (for example, connect a payment method), the provider’s own privacy policy will apply
              to their processing. We recommend reviewing those third-party privacy policies.
            </p>
          </section>

          <section>
            <h2>7. Data Sharing & Disclosure</h2>
            <p>We will never sell your personal information. We may share information with:</p>
            <ul>
              <li>Service providers who help deliver and operate the service.</li>
              <li>Legal authorities, when required by law or to protect our rights.</li>
              <li>Other users, where you explicitly share information (for example, sharing an invoice link).</li>
            </ul>
          </section>

          <section>
            <h2>8. Data Retention</h2>
            <p>
              We retain personal information as long as necessary to provide the services, comply with legal obligations,
              resolve disputes, and enforce our agreements. When information is no longer needed, we will securely delete or anonymize it.
            </p>
          </section>

          <section>
            <h2>9. Data Security</h2>
            <p>
              We implement industry-standard technical and organizational measures to protect your data from unauthorized access,
              modification, or deletion. However, no system is 100% secure — if you suspect a security issue, contact us immediately
              at <a href={`mailto:${SUPPORT_EMAIL}`} className="underline">{SUPPORT_EMAIL}</a>.
            </p>
          </section>

          <section>
            <h2>10. Your Rights</h2>
            <p>
              Depending on your jurisdiction, you may have rights regarding your personal data, including:
            </p>
            <ul>
              <li>Access: request a copy of your personal data.</li>
              <li>Correction: ask us to correct inaccurate information.</li>
              <li>Deletion: request deletion of your account and personal data (subject to legal retention).</li>
              <li>Portability: request your data in a common machine-readable format (e.g., JSON).</li>
              <li>Restriction & objection: ask to limit or object to certain processing.</li>
            </ul>
            <p>
              To exercise any of these rights, contact us at <a href={`mailto:${SUPPORT_EMAIL}`} className="underline">{SUPPORT_EMAIL}</a>.
              We may need to verify your identity before fulfilling requests.
            </p>
          </section>

          <section>
            <h2>11. Children</h2>
            <p>
              Our services are not directed to children under 13 (or the applicable age in your jurisdiction). We do not knowingly
              collect personal information from children. If you believe a child has provided us personal information, contact us to
              request removal.
            </p>
          </section>

          <section>
            <h2>12. International Transfers</h2>
            <p>
              Oddlex may store and process information in servers located in different countries. We will take steps to ensure transfers
              are carried out with appropriate safeguards (for example standard contractual clauses) where required by law.
            </p>
          </section>

          <section>
            <h2>13. Third-Party Links</h2>
            <p>
              Our service may contain links to third-party websites. We are not responsible for the privacy practices of those websites.
              Please review their privacy policies before providing any personal information.
            </p>
          </section>

          <section>
            <h2>14. Changes to this Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. When we do, we will update the "Last updated" date at the top of
              this page. Significant changes will be notified via the service or by email where appropriate.
            </p>
          </section>

          <section>
            <h2>15. Contact Us</h2>
            <p>
              If you have questions, requests, or concerns about this policy or your data, please contact:
            </p>
            <div className="bg-white/3 p-4 rounded-lg border border-white/5 text-sm">
              <div><strong>Oddlex Business Hub</strong></div>
              <div>Email: <a href={`mailto:${SUPPORT_EMAIL}`} className="underline">{SUPPORT_EMAIL}</a></div>
              <div>Website: <Link href="/" className="underline">oddlex.com</Link></div>
            </div>
          </section>

          <section>
            <h2>16. Additional Notes for Businesses & Account Holders</h2>
            <p>
              If you use Oddlex to store or manage your customers’ personal information (for invoicing or CRM), you are responsible
              for ensuring you have lawful grounds to process that information and for complying with applicable data protection laws.
            </p>
          </section>

          <footer className="mt-6 text-sm text-gray-400">
            <div>Last updated: {LAST_UPDATED}</div>
            <div className="mt-2">If you need a printable or shareable copy, use the browser <strong>Print → Save as PDF</strong> option.</div>
          </footer>
        </div>
      </div>
    </div>
  );
}
