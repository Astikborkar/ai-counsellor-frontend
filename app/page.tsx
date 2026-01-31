'use client';

import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-white px-6">

      {/* Logo / Product Name */}
      <div className="mb-6 text-center">
        <h1 className="text-4xl font-bold text-gray-900">
          AI Counsellor
        </h1>
        <p className="mt-2 text-gray-500 text-sm">
          Plan your study-abroad journey with clarity and confidence
        </p>
      </div>

      {/* Headline */}
      <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 text-center max-w-2xl">
        Plan your study-abroad journey with a guided AI counsellor.
      </h2>

      {/* Short Description */}
      <p className="mt-4 text-gray-600 text-center max-w-xl">
        A structured, stage-based platform that guides you from profile building
        to university shortlisting and application preparation.
      </p>

      {/* CTA Buttons */}
      <div className="mt-8 flex gap-4">
        <Link href="/signup">
          <button className="px-6 py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition">
            Get Started
          </button>
        </Link>

        <Link href="/login">
          <button className="px-6 py-3 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition">
            Login
          </button>
        </Link>
      </div>

      {/* Footer Note */}
      <p className="mt-12 text-xs text-gray-400">
        © 2026 AI Counsellor. All rights reserved.
      </p>

    </main>
  );
}
