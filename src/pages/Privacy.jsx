import React from "react";
import { motion } from "framer-motion";
import { 
  FaShieldAlt, 
  FaUserLock, 
  FaGoogle, 
  FaDatabase, 
  FaShareAlt,
  FaHistory,
  FaLock,
  FaUserCog,
  FaBell,
  FaEnvelope,
  FaCheckCircle,
  FaExclamationTriangle,
  FaFingerprint,
  FaUserSecret, // replacement for FaShieldCheck
  FaUser // replacement for FaUserShield
} from "react-icons/fa";

const Privacy = () => {
  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="relative min-h-screen bg-[#0A0A0A] bg-gradient-to-br from-black via-gray-900 to-[#0F0F0F] overflow-hidden py-24 px-4 sm:px-6 lg:px-8 mt-20">
      {/* Enhanced background effects */}
      <div className="absolute inset-0">
        <motion.div 
          className="absolute w-[500px] h-[500px] bg-orange-600/5 rounded-full blur-[120px] -top-20 -left-20"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />
      </div>

      <motion.div className="max-w-4xl mx-auto">
        {/* Enhanced Header Section with fixed positioning */}
        <motion.div className="text-center mb-24 relative pt-8">
          {/* Adjusted floating security indicators */}
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 flex gap-4">
            {[FaShieldAlt, FaFingerprint, FaUserSecret].map((Icon, index) => (
              <motion.div
                key={index}
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                whileHover={{ y: -2, scale: 1.1 }}
                transition={{ 
                  type: "spring",
                  stiffness: 400,
                  damping: 10
                }}
                className="bg-orange-500/10 p-3 rounded-full border border-orange-500/20 hover:bg-orange-500/20 hover:border-orange-500/40 transition-colors duration:200"
              >
                <Icon className="w-5 h-5 text-orange-400" />
              </motion.div>
            ))}
          </div>

          {/* Privacy Matters badge with enhanced hover */}
          <motion.div 
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400 }}
            className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-500/20 text-orange-400 text-sm gap-2 backdrop-blur-sm mb-8 mt-8 hover:bg-orange-500/20 transition-all duration-200"
          >
            <FaShieldAlt className="w-4 h-4" />
            <span>Your Privacy Matters</span>
          </motion.div>

          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-orange-400 via-amber-500 to-orange-600 bg-clip-text text-transparent mb-8">
            Privacy Policy
          </h1>
        </motion.div>

        <div className="space-y-8">
          {/* New Key Points Section */}
          <motion.section
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12"
          >
            {[
              {
                icon: <FaCheckCircle className="w-6 h-6" />,
                title: "Your Data Control",
                points: ["Full access control", "Data portability", "Right to deletion"]
              },
              {
                icon: <FaExclamationTriangle className="w-6 h-6" />,
                title: "Important Notice",
                points: ["GDPR Compliant", "Regular audits", "Transparent processing"]
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.02 }}
                className="bg-gradient-to-br from-gray-800/70 to-gray-900/70 p-6 rounded-2xl border border-orange-500/20"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-orange-400">{item.icon}</div>
                  <h3 className="text-xl font-semibold text-white">{item.title}</h3>
                </div>
                <ul className="space-y-2">
                  {item.points.map((point, i) => (
                    <li key={i} className="flex items-center gap-2 text-gray-300">
                      <span className="w-1.5 h-1.5 bg-orange-400 rounded-full" />
                      {point}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </motion.section>

          {/* Enhanced existing sections */}
          <motion.section 
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            className="grid md:grid-cols-2 gap-8"
          >
            {/* Information Collection Card with enhanced visibility */}
            <div className="bg-gradient-to-br from-gray-800/70 to-gray-900/70 rounded-2xl p-8 border border-orange-500/20 backdrop-blur-sm group hover:border-orange-500/40 transition-all duration-300">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 rounded-xl bg-orange-500/10 text-orange-400 group-hover:scale-110 transition-transform duration-300">
                  <FaUserLock className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-semibold bg-gradient-to-r from-orange-400 to-amber-500 bg-clip-text text-transparent">
                  Information We Collect
                </h2>
              </div>
              <ul className="list-disc pl-6 space-y-3 marker:text-orange-400 text-gray-200">
                <li>Account information (name, email address)</li>
                <li>Task data, preferences, and deadlines</li>
                <li>Google Calendar data (with your explicit consent)</li>
                <li>Usage logs (for improving user experience)</li>
              </ul>
            </div>

            {/* Google Integration Card */}
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-8 border border-orange-500/20 backdrop-blur-sm group hover:border-orange-500/40 transition-all duration-300">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 rounded-xl bg-orange-500/10 text-orange-400 group-hover:scale-110 transition-transform duration-300">
                  <FaGoogle className="w-6 h-6" />
                </div>
                <div className="flex flex-col">
                  <h2 className="text-2xl font-semibold bg-gradient-to-r from-orange-400 to-amber-500 bg-clip-text text-transparent">
                    Google Integration
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    <FaCheckCircle className="text-green-400 w-4 h-4" />
                    <span className="text-green-400 text-sm">Verified by Google</span>
                  </div>
                </div>
              </div>
              <p className="text-gray-200">
                Our application uses Google OAuth 2.0 to allow users to connect their Google Calendar. Calendar data is accessed only with your consent and is used solely to display and sync your events with Effisense tasks.
                <br /><br />
                <strong className="text-orange-400">We do not share Google user data with third parties</strong> or use it outside the scope of providing our app’s core features.
                <br />
                Access tokens are stored securely and can be revoked at any time via your Google account.
              </p>
            </div>
          </motion.section>

          {/* Security Features Grid */}
          <motion.section
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            className="grid md:grid-cols-3 gap-6"
          >
            {[
              { icon: <FaDatabase />, title: "Data Storage", desc: "Secure encryption at rest and in transit" },
              { icon: <FaLock />, title: "Authentication", desc: "OAuth 2.0 secure authentication" },
              { icon: <FaShareAlt />, title: "No Data Sharing", desc: "Your data stays private" }
            ].map((feature, index) => (
              <div key={index} className="bg-gray-800/30 rounded-xl p-6 border border-orange-500/10 backdrop-blur-sm hover:bg-gray-800/50 transition-all duration-300">
                <div className="text-orange-400 mb-4">{feature.icon}</div>
                <h3 className="text-white font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm">{feature.desc}</p>
              </div>
            ))}
          </motion.section>

          {/* Regular sections with improved text visibility */}
          <section className="transform transition-all duration-200 hover:scale-[1.01] hover:bg-white/5 rounded-xl p-6 hover:shadow-lg hover:shadow-orange-500/5 border border-transparent hover:border-orange-500/20">
            <h2 className="text-2xl font-semibold bg-gradient-to-r from-orange-400 to-amber-500 bg-clip-text text-transparent mb-4">
              How We Use Your Information
            </h2>
            <ul className="list-disc pl-6 space-y-3 marker:text-orange-400 text-gray-200">
              <li>To provide core functionality like task management and scheduling</li>
              <li>To sync and display your calendar events (if Google Calendar is connected)</li>
              <li>To personalize your experience</li>
              <li>To send updates or notify you about changes</li>
            </ul>
            <p className="mt-3 text-gray-200">
              <strong className="text-orange-400">We do not use Google user data to develop, improve, or train generalized AI or ML models.</strong>
            </p>
          </section>

          <section className="transform transition-all duration-200 hover:scale-[1.01] hover:bg-white/5 rounded-xl p-6 hover:shadow-lg hover:shadow-orange-500/5 border border-transparent hover:border-orange-500/20">
            <h2 className="text-2xl font-semibold bg-gradient-to-r from-orange-400 to-amber-500 bg-clip-text text-transparent mb-4">
              Data Sharing & Disclosure
            </h2>
            <p className="text-gray-200">
              We do not sell, trade, or share your personal data or Google Calendar data with any third party. The only time data may be disclosed is:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-3 marker:text-orange-400 text-gray-200">
              <li>If required by law or legal request</li>
              <li>To protect the rights and security of our users</li>
            </ul>
          </section>

          {/* Update text colors for all remaining sections */}
          <section className="transform transition-all duration-200 hover:scale-[1.01] hover:bg-white/5 rounded-xl p-6 hover:shadow-lg hover:shadow-orange-500/5 border border-transparent hover:border-orange-500/20">
            <h2 className="text-2xl font-semibold bg-gradient-to-r from-orange-400 to-amber-500 bg-clip-text text-transparent mb-4">
              Data Retention
            </h2>
            <p className="text-gray-200">
              We retain your data only as long as your account is active or as needed to provide you services. You may request deletion of your data at any time by contacting us.
            </p>
          </section>

          <section className="transform transition-all duration-200 hover:scale-[1.01] hover:bg-white/5 rounded-xl p-6 hover:shadow-lg hover:shadow-orange-500/5 border border-transparent hover:border-orange-500/20">
            <h2 className="text-2xl font-semibold bg-gradient-to-r from-orange-400 to-amber-500 bg-clip-text text-transparent mb-4">
              Security
            </h2>
            <p className="text-gray-200">
              We take data protection seriously. All sensitive data is encrypted in transit and at rest. We use OAuth 2.0 for secure authentication and follow industry-standard practices to prevent unauthorized access.
            </p>
          </section>

          <section className="transform transition-all duration-200 hover:scale-[1.01] hover:bg-white/5 rounded-xl p-6 hover:shadow-lg hover:shadow-orange-500/5 border border-transparent hover:border-orange-500/20">
            <h2 className="text-2xl font-semibold bg-gradient-to-r from-orange-400 to-amber-500 bg-clip-text text-transparent mb-4">
              User Control & Rights
            </h2>
            <p className="text-gray-200">
              You have the right to access, update, or delete your personal information. You can also disconnect Google Calendar access at any time from your Google account settings or within Effisense.
            </p>
          </section>

          <section className="transform transition-all duration-200 hover:scale-[1.01] hover:bg-white/5 rounded-xl p-6 hover:shadow-lg hover:shadow-orange-500/5 border border-transparent hover:border-orange-500/20">
            <h2 className="text-2xl font-semibold bg-gradient-to-r from-orange-400 to-amber-500 bg-clip-text text-transparent mb-4">
              Changes to This Policy
            </h2>
            <p className="text-gray-200">
              We may update this Privacy Policy from time to time. If significant changes are made, we will notify you through the app or email. Continued use of the service after changes means you accept the new terms.
            </p>
          </section>

          {/* New Quick Actions Section */}
          <motion.section
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {[
              { label: "Download Data", icon: FaDatabase },
              { label: "Privacy Settings", icon: FaUserCog },
              { label: "Security Check", icon: FaShieldAlt },
              { label: "Contact Support", icon: FaEnvelope }
            ].map((action, index) => (
              <motion.button
                key={index}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 10
                }}
                className="flex flex-col items-center gap-2 p-4 bg-gradient-to-br from-orange-500/10 to-amber-500/10 rounded-xl border border-orange-500/20 text-gray-200 hover:text-white hover:bg-orange-500/20 hover:border-orange-500/40 transition-all duration-200"
              >
                <action.icon className="w-5 h-5 text-orange-400" />
                <span className="text-sm font-medium">{action.label}</span>
              </motion.button>
            ))}
          </motion.section>

          {/* Enhanced Contact Section with better hover animations */}
          <motion.div 
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            className="mt-16 text-center space-y-6"
          >
            <div className="h-px bg-gradient-to-r from-transparent via-orange-700/30 to-transparent" />
            <div className="flex flex-col items-center gap-4">
              <motion.div
                whileHover={{ 
                  scale: 1.05,
                  y: -4,
                }}
                whileTap={{ scale: 0.95 }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 10
                }}
              >
                <a
                  href="mailto:connect@ayush-sharma.in?subject=Privacy%20Policy%20Query"
                  className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-orange-500 to-amber-600 
                    rounded-xl text-white font-medium shadow-lg hover:shadow-xl hover:shadow-orange-500/30 
                    hover:from-orange-600 hover:to-amber-700 transition-all duration-200 cursor-pointer group w-full"
                >
                  <FaEnvelope className="w-5 h-5 group-hover:rotate-12 transition-transform duration-200" />
                  <span>Contact Privacy Team</span>
                  <motion.span
                    className="ml-1"
                    animate={{ x: [0, 4, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    →
                  </motion.span>
                </a>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <a 
                  href="mailto:connect@ayush-sharma.in"
                  className="flex items-center gap-2 justify-center group text-gray-400 hover:text-orange-400 transition-all duration-200"
                >
                  <FaEnvelope className="w-4 h-4 group-hover:rotate-12 transition-transform duration-200" />
                  <span className="border-b border-transparent group-hover:border-orange-400/50">
                    connect@ayush-sharma.in
                  </span>
                </a>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default Privacy;
