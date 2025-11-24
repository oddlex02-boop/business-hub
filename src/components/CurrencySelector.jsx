'use client';

import { useState } from 'react';

export default function CurrencySelector({ currency, setCurrency }) {
  const currencies = [
    { code: 'INR', symbol: '₹' },
    { code: 'USD', symbol: '$' },
    { code: 'EUR', symbol: '€' },
    { code: 'GBP', symbol: '£' },
  ];

  return (
    <select
      value={currency}
      onChange={(e) => setCurrency(e.target.value)}
      className="bg-white border border-purple-300 rounded-lg px-4 py-2 font-bold text-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
    >
      {currencies.map((c) => (
        <option key={c.code} value={c.code}>
          {c.symbol} {c.code}
        </option>
      ))}
    </select>
  );
}