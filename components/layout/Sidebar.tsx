"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  LayoutDashboard,
  User,
  Menu,
  X,
  LogOut,
  DiamondIcon,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { ModeToggle } from "@/components/ui/ModeToggle";
import { signOut } from "next-auth/react";

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Chat", href: "/dashboard/chat", icon: MessageCircle },
    { name: "Profile", href: "/dashboard/profile", icon: User },
  ];

  const handleLogout = () => {
    signOut({ callbackUrl: "/" });
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 p-4 shrink-0">
        <div className="p-2 bg-foreground rounded-lg">
          <DiamondIcon className="w-4 h-4 text-background" />
        </div>
        <div>
          <h1 className="font-bold text-base text-foreground">My App</h1>
          <p className="text-xs text-muted-foreground">v0.0.1a</p>
        </div>
      </div>

      <Separator className="shrink-0" />

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto min-h-0">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <motion.div
              key={item.href}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group ${
                  isActive
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                </motion.div>
                <span className="text-sm font-medium">{item.name}</span>
              </Link>
            </motion.div>
          );
        })}
      </nav>

      <div className="mt-auto shrink-0">
        <Separator />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="p-3 space-y-3"
        >
          <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-muted/50">
            <span className="text-xs font-medium text-muted-foreground">
              Theme
            </span>
            <ModeToggle />
          </div>

          <Separator />

          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-medium">Logout</span>
          </Button>
        </motion.div>
      </div>
    </div>
  );

  return (
    <>
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b h-14 flex items-center justify-between px-4"
      >
        {/* <div className="flex items-center gap-3">
          <div className="p-1.5 bg-foreground rounded-lg">
            <DiamondIcon className="w-4 h-4 text-background" />
          </div>
          <div>
            <h1 className="font-bold text-sm">My App</h1>
          </div>
        </div> */}
        <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={isOpen ? "close" : "open"}
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {isOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </motion.div>
          </AnimatePresence>
        </Button>
      </motion.div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={{ x: isOpen ? 0 : "-100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="lg:hidden fixed top-14 left-0 bottom-0 w-64 bg-card border-r z-40"
      >
        <SidebarContent />
      </motion.aside>

      <motion.aside
        initial={{ x: -264, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ type: "spring", damping: 20, stiffness: 100 }}
        className="hidden lg:block fixed top-0 left-0 bottom-0 w-64 border-r bg-card z-30"
      >
        <SidebarContent />
      </motion.aside>

      <div className="hidden lg:block w-64 shrink-0" />
    </>
  );
}
