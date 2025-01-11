import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Github,
  Twitter,
  Linkedin,
  Mail,
  Heart,
  Shield,
  Users,
  Award,
} from "lucide-react";

const Footer = () => {
  const fadeInUpVariants = {
    initial: { y: 20, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    transition: { duration: 0.5 },
  };

  const stats = [
    { icon: Users, label: "Active Users", value: "1.2K+" },
    { icon: Shield, label: "Success Rate", value: "98%" },
    { icon: Award, label: "Items Found", value: "500+" },
  ];

  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="relative mt-20 bg-black/30 backdrop-blur-md border-t border-white/10"
    >
      <div className="mx-auto max-w-7xl px-6 py-12">
        {/* Stats Section */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 gap-8 sm:grid-cols-3 mb-12"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className="flex flex-col items-center p-6 bg-white/5 rounded-xl backdrop-blur-sm"
            >
              <stat.icon className="h-8 w-8 text-purple-400 mb-3" />
              <h4 className="text-2xl font-bold text-white">{stat.value}</h4>
              <p className="text-gray-400">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand Section */}
          <motion.div
            variants={fadeInUpVariants}
            initial="initial"
            animate="animate"
            className="space-y-4"
          >
            <h3 className="text-xl font-bold text-white font-iceberg">
              Find&Earn
            </h3>
            <p className="text-gray-400 text-sm">
              Connecting lost items with their rightful owners through
              blockchain technology and community effort.
            </p>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            variants={fadeInUpVariants}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            <h4 className="text-lg font-semibold text-white">Quick Links</h4>
            <ul className="space-y-2">
              {["Home", "Report Lost", "Recent Items", "About"].map((link) => (
                <li key={link}>
                  <Link
                    to="/"
                    className="text-gray-400 hover:text-purple-400 transition-colors duration-200 text-sm"
                  >
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            variants={fadeInUpVariants}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            <h4 className="text-lg font-semibold text-white">Contact</h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="mailto:contact@findearn.com"
                  className="text-gray-400 hover:text-purple-400 transition-colors duration-200 text-sm flex items-center gap-2"
                >
                  <Mail className="h-4 w-4" />
                  contact@findearn.com
                </a>
              </li>
            </ul>
          </motion.div>

          {/* Social Links */}
          <motion.div
            variants={fadeInUpVariants}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.3 }}
            className="space-y-4"
          >
            <h4 className="text-lg font-semibold text-white">Follow Us</h4>
            <div className="flex space-x-4">
              {[
                { icon: Github, link: "https://github.com" },
                { icon: Twitter, link: "https://twitter.com" },
                { icon: Linkedin, link: "https://linkedin.com" },
              ].map((social, index) => (
                <motion.a
                  key={index}
                  href={social.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="text-gray-400 hover:text-purple-400 transition-colors duration-200"
                >
                  <social.icon className="h-5 w-5" />
                </motion.a>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-12 pt-8 border-t border-gray-800"
        >
          <p className="text-center text-gray-400 text-sm flex items-center justify-center gap-1">
            Made with{" "}
            <Heart className="h-4 w-4 text-red-500 inline animate-pulse" /> by
            Find&Earn Team © {new Date().getFullYear()}
          </p>
        </motion.div>
      </div>
    </motion.footer>
  );
};

export default Footer;
