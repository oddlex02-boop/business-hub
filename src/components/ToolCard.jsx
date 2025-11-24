"use client";
import React from 'react';
import Link from 'next/link';

export default function ToolCard({ name, icon, link, ads }) {
  return (
    <Link href={link}>
      <div className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-2xl transition-all duration-300 cursor-pointer border border-gray-100">
        <div className="text-base sm:text-lg md:text-xl sm:text-lg sm:text-base sm:text-lg md:text-xl md:text-2xl md:text-3xl sm:text-lg sm:text-base sm:text-lg md:text-xl md:text-2xl sm:text-base sm:text-lg md:text-xl sm:text-lg sm:text-base sm:text-lg md:text-xl md:text-2xl md:text-3xl md:text-4xl md:text-base sm:text-lg md:text-xl sm:text-lg sm:text-base sm:text-lg md:text-xl md:text-2xl md:text-3xl sm:text-lg sm:text-base sm:text-lg md:text-xl md:text-2xl sm:text-base sm:text-lg md:text-xl sm:text-lg sm:text-base sm:text-lg md:text-xl md:text-2xl md:text-3xl md:text-4xl md:text-5xl lg:text-6xl mb-4">{icon}</div>
        <h3 className="font-bold text-base sm:text-lg md:text-xl text-gray-800">{name}</h3>
        {ads && <span className="text-xs text-green-600 mt-2 block">Ad</span>}
      </div>
    </Link>
  );
}