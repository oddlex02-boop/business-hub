import React from "react";

export const metadata = {
  title: "Terms of Service | Oddlex Business Hub",
  description:
    "Read the Terms of Service for using Oddlex Business Hub and its free business tools.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white pb-20">
      {/* Container */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">

        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
            Terms of Service
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Please read these terms carefully before using Oddlex Business Hub tools.
          </p>
        </div>

        {/* Content Box */}
        <div className="max-w-4xl mx-auto bg-white/5 backdrop-blur-sm border border-white/10 p-8 lg:p-12 rounded-3xl space-y-10">

          {/* 1. Acceptance */}
          <section>
            <h2 className="text-2xl font-bold mb-3">1. Acceptance of Terms</h2>
            <p className="text-gray-300 leading-relaxed">
              By accessing or using Oddlex and its tools, you agree to follow and be bound by 
              these Terms of Service. If you do not agree, please do not use the platform.
            </p>
          </section>

          {/* 2. Services */}
          <section>
            <h2 className="text-2xl font-bold mb-3">2. Services Provided</h2>
            <p className="text-gray-300 leading-relaxed">
              Oddlex offers 40+ free business tools including invoice generators, calculators,
              document makers, and productivity features. All services are available “as-is”
              and may be updated or improved regularly.
            </p>
          </section>

          {/* 3. User Responsibilities */}
          <section>
            <h2 className="text-2xl font-bold mb-3">3. User Responsibilities</h2>
            <ul className="list-disc ml-6 text-gray-300 leading-relaxed">
              <li>You must use Oddlex tools for legal purposes only.</li>
              <li>You agree not to misuse, exploit, or attempt to hack the platform.</li>
              <li>You are responsible for the accuracy of the data you submit.</li>
            </ul>
          </section>

          {/* 4. Data Security */}
          <section>
            <h2 className="text-2xl font-bold mb-3">4. Data Security</h2>
            <p className="text-gray-300 leading-relaxed">
              Oddlex takes data safety seriously. While we use secure systems, you understand
              that no platform can guarantee 100% security. We recommend avoiding sensitive 
              personal or financial data unless necessary.
            </p>
          </section>

          {/* 5. Tool Availability */}
          <section>
            <h2 className="text-2xl font-bold mb-3">5. Tool Availability</h2>
            <p className="text-gray-300 leading-relaxed">
              All tools are offered free of cost, but availability may vary depending on updates,
              maintenance, or technical issues. Oddlex reserves the right to modify or remove
              tools at any time.
            </p>
          </section>

          {/* 6. Limitation of Liability */}
          <section>
            <h2 className="text-2xl font-bold mb-3">6. Limitation of Liability</h2>
            <p className="text-gray-300 leading-relaxed">
              Oddlex is not liable for any business loss, financial damage, data loss, or
              inaccuracies caused by tool usage. Tools are intended to assist, not replace,
              professional advice.
            </p>
          </section>

          {/* 7. Updates to Terms */}
          <section>
            <h2 className="text-2xl font-bold mb-3">7. Changes to These Terms</h2>
            <p className="text-gray-300 leading-relaxed">
              These Terms may be updated at any time. Continued use of Oddlex after updates
              means you accept the new Terms.
            </p>
          </section>

          {/* 8. Contact */}
          <section>
            <h2 className="text-2xl font-bold mb-3">8. Contact Information</h2>
            <p className="text-gray-300 leading-relaxed">
              For any questions regarding these Terms, email us at{" "}
              <span className="text-purple-400 font-semibold">support@oddlex.com</span>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
