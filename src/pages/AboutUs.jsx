import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { FaGithub, FaGlobe, FaEnvelope, FaLinkedin } from "react-icons/fa";

const AboutUs = () => {
  return (
    <div className="relative min-h-screen bg-[#0A0A0A] bg-gradient-to-br from-black via-gray-900 to-[#0F0F0F] overflow-hidden">
      {/* Animated Background Effects */}
      <div className="absolute inset-0">
        <motion.div 
          className="absolute w-[500px] h-[500px] bg-orange-600/5 rounded-full blur-[120px] -top-20 -left-20"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ 
            duration: 8,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />
        <motion.div 
          className="absolute w-[500px] h-[500px] bg-amber-600/5 rounded-full blur-[120px] -bottom-20 -right-20"
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.4, 0.3],
          }}
          transition={{ 
            duration: 10,
            repeat: Infinity,
            repeatType: "reverse",
            delay: 1
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 py-20">
        {/* Header Section with Enhanced Animation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-500/20 text-orange-400 text-sm gap-2 backdrop-blur-sm mb-6"
          >
            <span className="relative flex h-2 w-2">
              <motion.span 
                className="absolute inline-flex h-full w-full rounded-full bg-orange-400"
                animate={{ scale: [1, 1.5, 1], opacity: [0.7, 0, 0.7] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"/>
            </span>
            <span>Transforming Task Management</span>
          </motion.div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-400">
              About Effisense
            </span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Revolutionizing productivity through AI innovation and intelligent task management
          </p>
        </motion.div>

        {/* About Effisense Section with Interactive Cards */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-24"
        >
          <div className="grid md:grid-cols-2 gap-8">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-8 border border-orange-500/20 backdrop-blur-sm"
            >
              <h2 className="text-2xl font-bold text-orange-400 mb-4">Our Mission</h2>
              <p className="text-gray-300">
                Empowering individuals and teams with AI-driven tools that adapt to their unique working styles, 
                making task management more efficient and enjoyable than ever before.
              </p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-8 border border-orange-500/20 backdrop-blur-sm"
            >
              <h2 className="text-2xl font-bold text-orange-400 mb-4">Our Vision</h2>
              <p className="text-gray-300">
                To lead the future of productivity tools by combining artificial intelligence with 
                intuitive design, creating solutions that truly understand and enhance how people work.
              </p>
            </motion.div>
          </div>

          {/* Values Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-12"
          >
            <h2 className="text-3xl font-bold text-center mb-8 text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-400">
              Our Core Values
            </h2>
            <div className="grid md:grid-cols-4 gap-6">
              {[
                { title: "Innovation", desc: "Pushing boundaries with cutting-edge AI solutions" },
                { title: "Privacy", desc: "Ensuring user data security and confidentiality" },
                { title: "Excellence", desc: "Delivering exceptional user experiences" },
                { title: "Adaptability", desc: "Evolving with user needs and technology" }
              ].map((value, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  className="bg-gray-800/30 rounded-xl p-6 border border-orange-500/10 backdrop-blur-sm"
                >
                  <h3 className="text-orange-400 font-semibold mb-2">{value.title}</h3>
                  <p className="text-gray-400 text-sm">{value.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.section>

        {/* Developer Section with Enhanced Layout */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="relative"
        >
          {/* Background glow effects */}
          <motion.div 
            className="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-amber-500/5 to-orange-500/10 blur-3xl"
            animate={{
              opacity: [0.5, 0.8, 0.5],
              scale: [0.98, 1.02, 0.98]
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          />

          <div className="bg-gradient-to-br from-gray-800/80 via-gray-800/50 to-gray-900/80 rounded-2xl p-8 md:p-12 border border-orange-500/20 backdrop-blur-sm relative overflow-hidden">
            {/* Grid pattern background */}
            <div className="absolute inset-0 grid grid-cols-8 gap-2 opacity-10">
              {Array.from({ length: 64 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="aspect-square border border-orange-500/20 rounded-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.01 }}
                />
              ))}
            </div>

            <div className="flex flex-col md:flex-row items-center gap-12 relative z-10">
              <motion.div className="relative group">
                <motion.div
                  className="absolute -inset-1 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full opacity-50 group-hover:opacity-70 blur-md"
                  animate={{
                    scale: [1, 1.05, 1],
                    opacity: [0.5, 0.7, 0.5]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                />
                <motion.img 
                  src="https://avatars.githubusercontent.com/u/69210117?v=4"
                  alt="Ayush Sharma"
                  className="w-48 h-48 rounded-full border-4 border-orange-500/30 shadow-lg shadow-orange-500/20 relative"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                />
              </motion.div>

              <div className="flex-1 text-center md:text-left">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-400 mb-4">
                    Meet the Developer
                  </h2>
                  <h3 className="text-2xl font-bold text-white mb-2">Ayush Sharma</h3>
                  <motion.div
                    className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r 
                      from-orange-500/10 to-amber-500/10 border border-orange-500/20 text-orange-400 
                      text-sm gap-2 backdrop-blur-sm mb-6"
                  >
                    <span className="relative flex h-2 w-2">
                      <motion.span 
                        className="absolute inline-flex h-full w-full rounded-full bg-orange-400"
                        animate={{ scale: [1, 1.5, 1], opacity: [0.7, 0, 0.7] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"/>
                    </span>
                    <span>Full Stack Developer & AI Enthusiast</span>
                  </motion.div>
                  
                  <p className="text-gray-300 mb-6 max-w-2xl leading-relaxed">
                    A passionate developer with expertise in building innovative solutions that combine cutting-edge 
                    technology with practical functionality. Specializing in full-stack development, AI integration, 
                    and creating seamless user experiences.
                  </p>

                  <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                    {[
                      { icon: <FaGlobe className="w-5 h-5" />, href: "https://cyberboyayush.in/", label: "Portfolio", color: "from-blue-500 to-sky-500" },
                      { icon: <FaGithub className="w-5 h-5" />, href: "https://github.com/cyberboyayush", label: "GitHub", color: "from-gray-600 to-gray-500" },
                      { icon: <FaEnvelope className="w-5 h-5" />, href: "mailto:connect@ayush-sharma.in", label: "Email", color: "from-orange-500 to-amber-500" },
                      { icon: <FaLinkedin className="w-5 h-5" />, href: "https://linkedin.com/in/cyberboyayush", label: "LinkedIn", color: "from-blue-600 to-blue-500" }
                    ].map((link, index) => (
                      <motion.a
                        key={index}
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`px-5 py-3 bg-gradient-to-r ${link.color} rounded-xl text-white 
                          shadow-lg transition-all duration-200 flex items-center gap-2 hover:shadow-xl`}
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {link.icon}
                        <span>{link.label}</span>
                      </motion.a>
                    ))}
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center"
        >
          <Link
            to="/signup"
            className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-orange-600 to-amber-600 
              text-white font-semibold rounded-xl hover:from-orange-500 hover:to-amber-500 
              transition-all duration-200 shadow-lg shadow-orange-500/20"
          >
            Get Started with Effisense
            <motion.span
              animate={{ x: [0, 4, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="ml-2"
            >
              →
            </motion.span>
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default AboutUs;
