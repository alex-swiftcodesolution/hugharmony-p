"use client";

import Sidebar from "./Sidebar";
import { ReactNode } from "react";
import { motion } from "framer-motion";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar - handles its own fixed positioning */}
      <Sidebar />

      {/* Main content area - offset by sidebar width on desktop */}
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="lg:pl-64 min-h-screen"
      >
        {/* Mobile header spacer */}
        <div className="lg:hidden h-14" />

        {/* Page content */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="relative"
        >
          {children}
        </motion.div>
      </motion.main>
    </div>
  );
}
