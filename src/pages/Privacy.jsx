import React from "react";
import { motion } from "framer-motion";

const Privacy = () => {
  return (
    <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto bg-gray-800/50 backdrop-blur-sm p-6 sm:p-8 rounded-2xl border border-orange-700/30"
      >
        <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-amber-500 bg-clip-text text-transparent mb-6">
          Privacy Policy
        </h1>

        <div className="space-y-6 text-gray-300">
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Introduction</h2>
            <p>
              This Privacy Policy outlines how Effisense ("we," "our," or "us") collects, uses, and protects your personal information when you use our task management application.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Information We Collect</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Account information (name, email address)</li>
              <li>Task data, preferences, and deadlines</li>
              <li>Google Calendar data (with your explicit consent)</li>
              <li>Usage logs (for improving user experience)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">How We Use Your Information</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>To provide core functionality like task management and scheduling</li>
              <li>To sync and display your calendar events (if Google Calendar is connected)</li>
              <li>To personalize your experience</li>
              <li>To send updates or notify you about changes</li>
            </ul>
            <p className="mt-3">
              <strong>We do not use Google user data to develop, improve, or train generalized AI or ML models.</strong>
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Google Workspace API Data Usage</h2>
            <p>
              Our application uses Google OAuth 2.0 to allow users to connect their Google Calendar. Calendar data is accessed only with your consent and is used solely to display and sync your events with Effisense tasks.
              <br /><br />
              <strong>We do not share Google user data with third parties</strong> or use it outside the scope of providing our app’s core features.
              <br />
              Access tokens are stored securely and can be revoked at any time via your Google account.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Data Sharing & Disclosure</h2>
            <p>
              We do not sell, trade, or share your personal data or Google Calendar data with any third party. The only time data may be disclosed is:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>If required by law or legal request</li>
              <li>To protect the rights and security of our users</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Data Retention</h2>
            <p>
              We retain your data only as long as your account is active or as needed to provide you services. You may request deletion of your data at any time by contacting us.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Security</h2>
            <p>
              We take data protection seriously. All sensitive data is encrypted in transit and at rest. We use OAuth 2.0 for secure authentication and follow industry-standard practices to prevent unauthorized access.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">User Control & Rights</h2>
            <p>
              You have the right to access, update, or delete your personal information. You can also disconnect Google Calendar access at any time from your Google account settings or within Effisense.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. If significant changes are made, we will notify you through the app or email. Continued use of the service after changes means you accept the new terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Contact Us</h2>
            <p>
              For questions about this Privacy Policy or your data, please contact us at <a href="mailto:connect@ayush-sharma.in" className="text-orange-400">connect@ayush-sharma.in</a>
            </p>
          </section>

          <section className="text-sm text-gray-400">
            <p>Last updated: {new Date().toLocaleDateString()}</p>
          </section>
        </div>
      </motion.div>
    </div>
  );
};

export default Privacy;
