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
              This Privacy Policy outlines how Effisense ("we," "our," or "us") collects, uses, and protects your information when you use our task management application.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Information We Collect</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Account information (name, email)</li>
              <li>Task and calendar data</li>
              <li>Google Calendar integration data (with your explicit consent)</li>
              <li>Usage information and preferences</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">How We Use Your Information</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>To provide and maintain our service</li>
              <li>To sync your tasks with Google Calendar (when enabled)</li>
              <li>To improve and personalize your experience</li>
              <li>To communicate with you about service updates</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Data Protection</h2>
            <p>
              We implement appropriate security measures to protect your personal information. Your data is encrypted and stored securely using industry-standard protocols.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Google Calendar Integration</h2>
            <p>
              When you choose to integrate with Google Calendar, we only access the calendar data necessary for task synchronization. We do not store your Google credentials, and you can revoke access at any time.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Your Rights</h2>
            <p>
              You have the right to access, update, or delete your personal information. You can also disable Google Calendar integration at any time through your settings.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at connect@ayush-sharma.in
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