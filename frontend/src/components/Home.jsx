import React from "react";
import { Link } from "react-router-dom";
import Navbar from "./Navbar";
import TopRewards from "./TopRewards";
import { motion } from "framer-motion";
import Footer from "./Footer";

const Home = ({ account, onDisconnect }) => {
  if (!account) return null;

  return (
    <div
      className="min-h-screen relative bg-gray-100"
      style={{
        backgroundImage: 'url("/homebg.png")',
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <Navbar account={account} onDisconnect={onDisconnect} />

      <div className="relative z-10 flex flex-col items-center min-h-[calc(100vh-64px)]">
        <div className="container mx-auto px-4 pt-20 flex flex-col items-center">
          {/* Main Content */}
          <main className="relative mt-20 w-full max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative z-10 text-center"
            >
              <h1 className="text-5xl font-bold leading-tight text-white md:text-6xl font-iceberg">
                Lost or Found? We've got you covered.
              </h1>
              <p className="mt-6 text-xl text-white/90">
                Connect with finders and recover your lost items quickly and
                securely
              </p>
              <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4 wallet-connect">
                <Link to="/report-lost">
                  <button className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-full transition-colors duration-200 w-full sm:w-auto">
                    Report lost
                  </button>
                </Link>

                <Link to="/recent-lost-items">
                  <button className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-full transition-colors duration-200 w-full sm:w-auto">
                    View Recent Lost Items
                  </button>
                </Link>
              </div>
            </motion.div>
          </main>

          {/* Top Rewards Section with Glass Effect */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-16 relative z-10 w-full max-w-4xl"
          >
            <div className="backdrop-blur-md bg-white/10 rounded-xl shadow-xl p-6">
              <div className="relative">
                <TopRewards />
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Background Overlay */}
      <div className="absolute inset-0 bg-black/50 z-0"></div>

      {/* Footer */}
      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
};

export default Home;
