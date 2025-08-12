"use client";
import Navigation from "@/components/Navigation";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">
            Welcome to Camp Management System
          </h1>
          <p className="text-gray-600">
            Manage camp accommodations, employee assignments, and room bookings
          </p>
        </div>
      </main>
    </div>
  );
}
