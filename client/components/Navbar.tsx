"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useRouter, usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Brain } from "lucide-react";
import Link from "next/link";

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  if (pathname === "/") {
    return null;
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-900/80 backdrop-blur-md border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 text-transparent bg-clip-text">
                Crowdfund
              </span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            {/* <NavLink href="/" label="Home" isActive={isActive('/')} /> */}
            {/* <NavLink href="/explore" label="Explore" isActive={isActive('/explore')} />
            <NavLink href="/docs" label="Docs" isActive={isActive('/docs')} /> */}
          </div>

          {/* Wallet Connection */}
          <div className="flex items-center">
            <ConnectButton />
          </div>
        </div>
      </div>
    </nav>
  );
}

interface NavLinkProps {
  href: string;
  label: string;
  isActive: boolean;
}

function NavLink({ href, label, isActive }: NavLinkProps) {
  return (
    <Link href={href} className="relative">
      <span
        className={`text-sm font-medium transition-colors duration-200 ${
          isActive ? "text-blue-400" : "text-gray-300 hover:text-blue-400"
        }`}
      >
        {label}
      </span>
      {isActive && (
        <motion.div
          layoutId="activeNav"
          className="absolute -bottom-[21px] left-0 right-0 h-0.5 bg-blue-500"
          initial={false}
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
        />
      )}
    </Link>
  );
}
