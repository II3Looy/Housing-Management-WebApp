"use client";
import Link from "next/link";
import { useState } from "react";

export default function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSecondaryMenuOpen, setIsSecondaryMenuOpen] = useState(false);

  return (
    <nav className="bg-black shadow-lg border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-white hover:text-gray-300">
              Housing Management System
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              href="/booking" 
              className="text-white hover:text-gray-300 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Booking
            </Link>
            <Link 
              href="/room" 
              className="text-white hover:text-gray-300 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Room
            </Link>
            <Link 
              href="/employee" 
              className="text-white hover:text-gray-300 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Employee
            </Link>
          </div>

          {/* Desktop Secondary Navigation Button */}
          <div className="hidden md:flex items-center space-x-4 relative">
            <button 
              onClick={() => setIsSecondaryMenuOpen(!isSecondaryMenuOpen)}
              className="text-white hover:text-gray-300 focus:outline-none"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            {/* Desktop Secondary Navigation Dropdown */}
            {isSecondaryMenuOpen && (
              <div className="absolute top-full right-0 mt-1 w-48 bg-black border border-gray-800 rounded-md shadow-lg z-50">
                <div className="py-1">
                  <Link 
                    href="/camp" 
                    className="text-white hover:text-gray-300 block px-4 py-2 text-sm font-medium"
                  >
                    Camp
                  </Link>
                  <Link 
                    href="/building" 
                    className="text-white hover:text-gray-300 block px-4 py-2 text-sm font-medium"
                  >
                    Building
                  </Link>
                  <Link 
                    href="/city" 
                    className="text-white hover:text-gray-300 block px-4 py-2 text-sm font-medium"
                  >
                    City
                  </Link>
                  <Link 
                    href="/nationality" 
                    className="text-white hover:text-gray-300 block px-4 py-2 text-sm font-medium"
                  >
                    Nationality
                  </Link>
                  <Link 
                    href="/roomtype" 
                    className="text-white hover:text-gray-300 block px-4 py-2 text-sm font-medium"
                  >
                    RoomType
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center relative">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-white hover:text-gray-300 focus:outline-none"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            {/* Mobile Navigation */}
            {isMobileMenuOpen && (
              <div className="absolute top-full right-0 mt-1 w-64 bg-black border border-gray-800 rounded-md shadow-lg z-50">
                <div className="py-1">
                  {/* Main Navigation */}
                  <div className="mb-2">
                    <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 py-2">Main</div>
                    <Link 
                      href="/booking" 
                      className="text-white hover:text-gray-300 block px-4 py-2 text-sm font-medium"
                    >
                      Booking
                    </Link>
                    <Link 
                      href="/room" 
                      className="text-white hover:text-gray-300 block px-4 py-2 text-sm font-medium"
                    >
                      Room
                    </Link>
                    <Link 
                      href="/employee" 
                      className="text-white hover:text-gray-300 block px-4 py-2 text-sm font-medium"
                    >
                      Employee
                    </Link>
                  </div>
                  {/* Secondary Navigation */}
                  <div>
                    <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 py-2">Management</div>
                    <Link 
                      href="/camp" 
                      className="text-white hover:text-gray-300 block px-4 py-2 text-sm font-medium"
                    >
                      Camp
                    </Link>
                    <Link 
                      href="/building" 
                      className="text-white hover:text-gray-300 block px-4 py-2 text-sm font-medium"
                    >
                      Building
                    </Link>
                    <Link 
                      href="/city" 
                      className="text-white hover:text-gray-300 block px-4 py-2 text-sm font-medium"
                    >
                      City
                    </Link>
                    <Link 
                      href="/nationality" 
                      className="text-white hover:text-gray-300 block px-4 py-2 text-sm font-medium"
                    >
                      Nationality
                    </Link>
                    <Link 
                      href="/roomtype" 
                      className="text-white hover:text-gray-300 block px-4 py-2 text-sm font-medium"
                    >
                      RoomType
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
} 