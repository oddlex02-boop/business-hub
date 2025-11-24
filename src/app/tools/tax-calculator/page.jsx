'use client';
import React, { useState, useMemo } from 'react';
import { Pie, Bar } from 'react-chartjs-2';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import jsPDF from "jspdf";
import "jspdf-autotable";


import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const currencies = [
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
];

/* ======================== GLOBAL FEATURES COMPONENT ======================== */
function GlobalFeatures({ onReset, onExportPDF, onExportExcel, darkMode, setDarkMode, currency, setCurrency }) {
  return (
    <div className="flex flex-wrap items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 mb-4 sm:mb-6">
      {/* Currency Selector */}
      <select
        value={currency}
        onChange={(e) => setCurrency(e.target.value)}
        className="px-3 py-2 bg-black/30 border border-white/20 rounded-lg text-xs sm:text-sm"
      >
        {currencies.map(c => (
          <option key={c.code} value={c.code}>{c.symbol} {c.code}</option>
        ))}
      </select>

      {/* Export Buttons */}
      <button
        onClick={onExportPDF}
        className="px-3 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-xs sm:text-sm transition"
      >
      📄 PDF
      </button>
      <button
        onClick={onExportExcel}
        className="px-3 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-xs sm:text-sm transition"
      >  
      📊 Excel
      </button>

      {/* Reset */}
      <button
        onClick={onReset}
        className="px-3 py-2 bg-orange-600 hover:bg-orange-700 rounded-lg text-xs sm:text-sm transition"
      >
        🔁 Reset
      </button>

      {/* Dark Mode Toggle */}
      <button
        onClick={() => setDarkMode(!darkMode)}
        className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-xs sm:text-sm transition"
      >
        {darkMode ? '☀️ Light' : '🌙 Dark'}
      </button>
    </div>
  );
}

/* ======================== TIP BOX COMPONENT ======================== */
function TipBox({ tip }) {
  return (
    <div className="p-3 sm:p-4 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-xl mb-4">
      <p className="text-xs sm:text-sm">💡 <strong>Pro Tip:</strong> {tip}</p>
    </div>
  );
}

/* ======================== 1. GST CALCULATOR ======================== */
function GSTCalculator({ currency }) {
  const [amount, setAmount] = useState('');
  const [gstRate, setGstRate] = useState('18');
  const [inclusive, setInclusive] = useState(false);
  const [stateType, setStateType] = useState('intra');

  const result = useMemo(() => {
    const amt = parseFloat(amount) || 0;
    const rate = parseFloat(gstRate) || 0;

    if (inclusive) {
      const base = amt / (1 + rate / 100);
      const gst = amt - base;
      return { base: base.toFixed(2), gst: gst.toFixed(2), total: amt.toFixed(2) };
    } else {
      const gst = (amt * rate) / 100;
      const total = amt + gst;
      return { base: amt.toFixed(2), gst: gst.toFixed(2), total: total.toFixed(2) };
    }
  }, [amount, gstRate, inclusive]);

  const currSymbol = currencies.find(c => c.code === currency)?.symbol || '₹';

  const chartData = {
    labels: ['Base Amount', 'GST'],
    datasets: [{
      data: [parseFloat(result.base), parseFloat(result.gst)],
      backgroundColor: ['#8b5cf6', '#ec4899'],
    }]
  };

  return (
    <div className="space-y-4">
      <TipBox tip="Use GST Calculator to quickly calculate tax on your invoices!" />
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs sm:text-sm mb-2">Amount</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
            className="w-full px-3 py-2 bg-black/20 border border-white/20 rounded-lg text-sm sm:text-base"
          />
        </div>

        <div>
          <label className="block text-xs sm:text-sm mb-2">GST Rate</label>
          <select
            value={gstRate}
            onChange={(e) => setGstRate(e.target.value)}
            className="w-full px-3 py-2 bg-black/20 border border-white/20 rounded-lg text-sm sm:text-base"
          >
            <option value="0">0%</option>
            <option value="5">5%</option>
            <option value="12">12%</option>
            <option value="18">18%</option>
            <option value="28">28%</option>
          </select>
        </div>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-xs sm:text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={inclusive}
              onChange={(e) => setInclusive(e.target.checked)}
              className="w-4 h-4"
            />
            GST Inclusive
          </label>
        </div>

        <div>
          <label className="block text-xs sm:text-sm mb-2">State Type</label>
          <select
            value={stateType}
            onChange={(e) => setStateType(e.target.value)}
            className="w-full px-3 py-2 bg-black/20 border border-white/20 rounded-lg text-sm sm:text-base"
          >
            <option value="intra">Intra-State (CGST + SGST)</option>
            <option value="inter">Inter-State (IGST)</option>
          </select>
        </div>
      </div>

      {/* Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <div className="p-4 bg-white/5 rounded-xl border border-white/10">
          <h3 className="text-lg sm:text-xl font-bold mb-4">📊 Calculation Summary</h3>
          <div className="space-y-2 text-sm sm:text-base">
            <div className="flex justify-between">
              <span>Base Amount:</span>
              <span className="font-bold">{currSymbol}{result.base}</span>
            </div>
            <div className="flex justify-between">
              <span>GST ({gstRate}%):</span>
              <span className="font-bold">{currSymbol}{result.gst}</span>
            </div>
            {stateType === 'intra' && (
              <>
                <div className="flex justify-between text-xs sm:text-sm text-gray-400">
                  <span>CGST ({parseFloat(gstRate) / 2}%):</span>
                  <span>{currSymbol}{(parseFloat(result.gst) / 2).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm text-gray-400">
                  <span>SGST ({parseFloat(gstRate) / 2}%):</span>
                  <span>{currSymbol}{(parseFloat(result.gst) / 2).toFixed(2)}</span>
                </div>
              </>
            )}
            {stateType === 'inter' && (
              <div className="flex justify-between text-xs sm:text-sm text-gray-400">
                <span>IGST ({gstRate}%):</span>
                <span>{currSymbol}{result.gst}</span>
              </div>
            )}
            <div className="flex justify-between text-lg sm:text-xl font-bold border-t border-white/20 pt-2 text-purple-400">
              <span>Total Amount:</span>
              <span>{currSymbol}{result.total}</span>
            </div>
          </div>
        </div>

        <div className="p-4 bg-white/5 rounded-xl border border-white/10">
          <h3 className="text-lg sm:text-xl font-bold mb-4">📈 Visual Breakdown</h3>
          <div className="h-48">
            <Pie data={chartData} options={{ maintainAspectRatio: false }} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ======================== 2. INCOME TAX CALCULATOR ======================== */
function IncomeTaxCalculator({ currency }) {
  const [income, setIncome] = useState('');
  const [deduction80C, setDeduction80C] = useState('');
  const [deduction80D, setDeduction80D] = useState('');
  const [hra, setHra] = useState('');
  const [regime, setRegime] = useState('old');
  const [age, setAge] = useState('below60');

  const result = useMemo(() => {
    const grossIncome = parseFloat(income) || 0;
    const ded80C = parseFloat(deduction80C) || 0;
    const ded80D = parseFloat(deduction80D) || 0;
    const hraAmt = parseFloat(hra) || 0;

    const totalDeductions = regime === 'old' ? ded80C + ded80D + hraAmt : 0;
    const taxableIncome = Math.max(grossIncome - totalDeductions, 0);

    let tax = 0;
    const exemptionLimit = age === 'senior' ? 300000 : 250000;

    if (taxableIncome <= exemptionLimit) {
      tax = 0;
    } else if (regime === 'new') {
      // New regime slabs (simplified)
      if (taxableIncome <= 300000) tax = 0;
      else if (taxableIncome <= 600000) tax = (taxableIncome - 300000) * 0.05;
      else if (taxableIncome <= 900000) tax = 15000 + (taxableIncome - 600000) * 0.10;
      else if (taxableIncome <= 1200000) tax = 45000 + (taxableIncome - 900000) * 0.15;
      else if (taxableIncome <= 1500000) tax = 90000 + (taxableIncome - 1200000) * 0.20;
      else tax = 150000 + (taxableIncome - 1500000) * 0.30;
    } else {
      // Old regime slabs
      if (taxableIncome <= exemptionLimit) tax = 0;
      else if (taxableIncome <= 500000) tax = (taxableIncome - exemptionLimit) * 0.05;
      else if (taxableIncome <= 1000000) tax = (250000 - exemptionLimit) * 0.05 + (taxableIncome - 500000) * 0.20;
      else tax = (250000 - exemptionLimit) * 0.05 + 100000 + (taxableIncome - 1000000) * 0.30;
    }

    const cess = tax * 0.04;
    const totalTax = tax + cess;
    const netIncome = grossIncome - totalTax;

    return {
      taxableIncome: taxableIncome.toFixed(2),
      tax: tax.toFixed(2),
      cess: cess.toFixed(2),
      totalTax: totalTax.toFixed(2),
      netIncome: netIncome.toFixed(2),
    };
  }, [income, deduction80C, deduction80D, hra, regime, age]);

  const currSymbol = currencies.find(c => c.code === currency)?.symbol || '₹';

  return (
    <div className="space-y-4">
      <TipBox tip={`You can save up to ${currSymbol}46,800 in ${regime === 'old' ? 'Old' : 'New'} regime by maximizing deductions!`} />
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs sm:text-sm mb-2">Annual Income</label>
          <input
            type="number"
            value={income}
            onChange={(e) => setIncome(e.target.value)}
            placeholder="Enter annual income"
            className="w-full px-3 py-2 bg-black/20 border border-white/20 rounded-lg text-sm sm:text-base"
          />
        </div>

        <div>
          <label className="block text-xs sm:text-sm mb-2">Tax Regime</label>
          <select
            value={regime}
            onChange={(e) => setRegime(e.target.value)}
            className="w-full px-3 py-2 bg-black/20 border border-white/20 rounded-lg text-sm sm:text-base"
          >
            <option value="old">Old Regime</option>
            <option value="new">New Regime</option>
          </select>
        </div>

        <div>
          <label className="block text-xs sm:text-sm mb-2">Age Group</label>
          <select
            value={age}
            onChange={(e) => setAge(e.target.value)}
            className="w-full px-3 py-2 bg-black/20 border border-white/20 rounded-lg text-sm sm:text-base"
          >
            <option value="below60">Below 60 years</option>
            <option value="senior">Senior Citizen (60+)</option>
          </select>
        </div>

        {regime === 'old' && (
          <>
            <div>
              <label className="block text-xs sm:text-sm mb-2">80C Deduction</label>
              <input
                type="number"
                value={deduction80C}
                onChange={(e) => setDeduction80C(e.target.value)}
                placeholder="Max 1,50,000"
                className="w-full px-3 py-2 bg-black/20 border border-white/20 rounded-lg text-sm sm:text-base"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm mb-2">80D Deduction (Medical)</label>
              <input
                type="number"
                value={deduction80D}
                onChange={(e) => setDeduction80D(e.target.value)}
                placeholder="Max 25,000"
                className="w-full px-3 py-2 bg-black/20 border border-white/20 rounded-lg text-sm sm:text-base"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm mb-2">HRA Exemption</label>
              <input
                type="number"
                value={hra}
                onChange={(e) => setHra(e.target.value)}
                placeholder="Enter HRA"
                className="w-full px-3 py-2 bg-black/20 border border-white/20 rounded-lg text-sm sm:text-base"
              />
            </div>
          </>
        )}
      </div>

      {/* Results */}
      <div className="p-4 sm:p-6 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl border border-purple-500/30 mt-6">
        <h3 className="text-lg sm:text-xl font-bold mb-4">💰 Tax Calculation Result</h3>
        <div className="space-y-2 text-sm sm:text-base">
          <div className="flex justify-between">
            <span>Gross Income:</span>
            <span className="font-bold">{currSymbol}{income || '0'}</span>
          </div>
          <div className="flex justify-between">
            <span>Taxable Income:</span>
            <span className="font-bold">{currSymbol}{result.taxableIncome}</span>
          </div>
          <div className="flex justify-between">
            <span>Income Tax:</span>
            <span className="font-bold">{currSymbol}{result.tax}</span>
          </div>
          <div className="flex justify-between">
            <span>4% Cess:</span>
            <span className="font-bold">{currSymbol}{result.cess}</span>
          </div>
          <div className="flex justify-between text-lg sm:text-xl font-bold border-t border-white/20 pt-2 text-purple-400">
            <span>Total Tax Payable:</span>
            <span>{currSymbol}{result.totalTax}</span>
          </div>
          <div className="flex justify-between text-lg font-bold text-green-400">
            <span>Net Income (In Hand):</span>
            <span>{currSymbol}{result.netIncome}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ======================== 3. BUSINESS TAX CALCULATOR ======================== */
function BusinessTaxCalculator({ currency }) {
  const [turnover, setTurnover] = useState('');
  const [expenses, setExpenses] = useState('');
  const [businessType, setBusinessType] = useState('proprietorship');
  const [gstRegistered, setGstRegistered] = useState(false);

  const result = useMemo(() => {
    const turn = parseFloat(turnover) || 0;
    const exp = parseFloat(expenses) || 0;
    const profit = turn - exp;

    let taxRate = 0;
    if (businessType === 'proprietorship') taxRate = 0.30;
    else if (businessType === 'pvtltd') taxRate = 0.25;
    else if (businessType === 'llp') taxRate = 0.30;

    const incomeTax = profit * taxRate;
    const gstLiability = gstRegistered ? turn * 0.18 : 0;
    const netProfit = profit - incomeTax;

    return {
      profit: profit.toFixed(2),
      incomeTax: incomeTax.toFixed(2),
      gstLiability: gstLiability.toFixed(2),
      netProfit: netProfit.toFixed(2),
    };
  }, [turnover, expenses, businessType, gstRegistered]);

  const currSymbol = currencies.find(c => c.code === currency)?.symbol || '₹';

  return (
    <div className="space-y-4">
      <TipBox tip="Proper expense tracking can reduce your tax liability by up to 30%!" />
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs sm:text-sm mb-2">Annual Turnover</label>
          <input
            type="number"
            value={turnover}
            onChange={(e) => setTurnover(e.target.value)}
            placeholder="Enter turnover"
            className="w-full px-3 py-2 bg-black/20 border border-white/20 rounded-lg text-sm sm:text-base"
          />
        </div>

        <div>
          <label className="block text-xs sm:text-sm mb-2">Total Expenses</label>
          <input
            type="number"
            value={expenses}
            onChange={(e) => setExpenses(e.target.value)}
            placeholder="Enter expenses"
            className="w-full px-3 py-2 bg-black/20 border border-white/20 rounded-lg text-sm sm:text-base"
          />
        </div>

        <div>
          <label className="block text-xs sm:text-sm mb-2">Business Type</label>
          <select
            value={businessType}
            onChange={(e) => setBusinessType(e.target.value)}
            className="w-full px-3 py-2 bg-black/20 border border-white/20 rounded-lg text-sm sm:text-base"
          >
            <option value="proprietorship">Proprietorship (30%)</option>
            <option value="pvtltd">Private Limited (25%)</option>
            <option value="llp">LLP (30%)</option>
          </select>
        </div>

        <div className="flex items-center">
          <label className="flex items-center gap-2 text-xs sm:text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={gstRegistered}
              onChange={(e) => setGstRegistered(e.target.checked)}
              className="w-4 h-4"
            />
            GST Registered
          </label>
        </div>
      </div>

      {/* Results */}
      <div className="p-4 sm:p-6 bg-white/5 rounded-xl border border-white/10 mt-6">
        <h3 className="text-lg sm:text-xl font-bold mb-4">📊 Business Tax Summary</h3>
        <div className="space-y-2 text-sm sm:text-base">
          <div className="flex justify-between">
            <span>Turnover:</span>
            <span className="font-bold">{currSymbol}{turnover || '0'}</span>
          </div>
          <div className="flex justify-between">
            <span>Expenses:</span>
            <span className="font-bold">{currSymbol}{expenses || '0'}</span>
          </div>
          <div className="flex justify-between text-green-400">
            <span>Taxable Profit:</span>
            <span className="font-bold">{currSymbol}{result.profit}</span>
          </div>
          <div className="flex justify-between">
            <span>Income Tax ({businessType === 'pvtltd' ? '25' : '30'}%):</span>
            <span className="font-bold">{currSymbol}{result.incomeTax}</span>
          </div>
          {gstRegistered && (
            <div className="flex justify-between">
              <span>GST Liability (18%):</span>
              <span className="font-bold">{currSymbol}{result.gstLiability}</span>
            </div>
          )}
          <div className="flex justify-between text-lg sm:text-xl font-bold border-t border-white/20 pt-2 text-purple-400">
            <span>Net Profit After Tax:</span>
            <span>{currSymbol}{result.netProfit}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ======================== 4. TDS CALCULATOR ======================== */
function TDSCalculator({ currency }) {
  const [amount, setAmount] = useState('');
  const [tdsRate, setTdsRate] = useState('10');
  const [gstApplicable, setGstApplicable] = useState(false);

  const result = useMemo(() => {
    const amt = parseFloat(amount) || 0;
    const rate = parseFloat(tdsRate) || 0;
    
    const tdsAmount = (amt * rate) / 100;
    const gstAmount = gstApplicable ? (amt * 18) / 100 : 0;
    const netPayable = amt - tdsAmount + gstAmount;

    return {
      tds: tdsAmount.toFixed(2),
      gst: gstAmount.toFixed(2),
      netPayable: netPayable.toFixed(2),
    };
  }, [amount, tdsRate, gstApplicable]);

  const currSymbol = currencies.find(c => c.code === currency)?.symbol || '₹';

  return (
    <div className="space-y-4">
      <TipBox tip="Always collect TDS certificate (Form 16A) from clients for your tax filing!" />
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs sm:text-sm mb-2">Payment Amount</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
            className="w-full px-3 py-2 bg-black/20 border border-white/20 rounded-lg text-sm sm:text-base"
          />
        </div>

        <div>
          <label className="block text-xs sm:text-sm mb-2">TDS Rate</label>
          <select
            value={tdsRate}
            onChange={(e) => setTdsRate(e.target.value)}
            className="w-full px-3 py-2 bg-black/20 border border-white/20 rounded-lg text-sm sm:text-base"
          >
            <option value="2">2% (194J - Professional)</option>
            <option value="5">5% (194C - Contractors)</option>
            <option value="10">10% (194J - Technical Services)</option>
            <option value="20">20% (195 - Non-Residents)</option>
          </select>
        </div>

        <div className="flex items-center">
          <label className="flex items-center gap-2 text-xs sm:text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={gstApplicable}
              onChange={(e) => setGstApplicable(e.target.checked)}
              className="w-4 h-4"
            />
            GST Applicable (18%)
          </label>
        </div>
      </div>

      {/* Results */}
      <div className="p-4 sm:p-6 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl border border-blue-500/30 mt-6">
        <h3 className="text-lg sm:text-xl font-bold mb-4">💳 TDS Calculation</h3>
        <div className="space-y-2 text-sm sm:text-base">
          <div className="flex justify-between">
            <span>Gross Amount:</span>
            <span className="font-bold">{currSymbol}{amount || '0'}</span>
          </div>
          <div className="flex justify-between text-red-400">
            <span>TDS ({tdsRate}%):</span>
            <span className="font-bold">-{currSymbol}{result.tds}</span>
          </div>
          {gstApplicable && (
            <div className="flex justify-between text-green-400">
              <span>GST (18%):</span>
              <span className="font-bold">+{currSymbol}{result.gst}</span>
            </div>
          )}
          <div className="flex justify-between text-lg sm:text-xl font-bold border-t border-white/20 pt-2 text-purple-400">
            <span>Net Payable:</span>
            <span>{currSymbol}{result.netPayable}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ======================== 5. ADVANCE TAX CALCULATOR ======================== */
function AdvanceTaxCalculator({ currency }) {
  const [income, setIncome] = useState('');
  const [deductions, setDeductions] = useState('');

  const result = useMemo(() => {
    const gross = parseFloat(income) || 0;
    const ded = parseFloat(deductions) || 0;
    const taxable = Math.max(gross - ded, 0);

    let tax = 0;
    if (taxable <= 250000) tax = 0;
    else if (taxable <= 500000) tax = (taxable - 250000) * 0.05;
    else if (taxable <= 1000000) tax = 12500 + (taxable - 500000) * 0.20;
    else tax = 112500 + (taxable - 1000000) * 0.30;

    const cess = tax * 0.04;
    const totalTax = tax + cess;

    return {
      totalTax: totalTax.toFixed(2),
      q1: (totalTax * 0.15).toFixed(2),
      q2: (totalTax * 0.45).toFixed(2),
      q3: (totalTax * 0.75).toFixed(2),
      q4: totalTax.toFixed(2),
    };
  }, [income, deductions]);

  const currSymbol = currencies.find(c => c.code === currency)?.symbol || '₹';

  const chartData = {
    labels: ['Q1 (15%)', 'Q2 (45%)', 'Q3 (75%)', 'Q4 (100%)'],
    datasets: [{
      label: 'Advance Tax Due',
      data: [result.q1, result.q2, result.q3, result.q4],
      backgroundColor: ['#8b5cf6', '#ec4899', '#f59e0b', '#10b981'],
    }]
  };

  return (
    <div className="space-y-4">
      <TipBox tip="Pay advance tax on time to avoid 1% interest per month on delayed payments!" />
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs sm:text-sm mb-2">Estimated Annual Income</label>
          <input
            type="number"
            value={income}
            onChange={(e) => setIncome(e.target.value)}
            placeholder="Enter estimated income"
            className="w-full px-3 py-2 bg-black/20 border border-white/20 rounded-lg text-sm sm:text-base"
          />
        </div>

        <div>
          <label className="block text-xs sm:text-sm mb-2">Total Deductions</label>
          <input
            type="number"
            value={deductions}
            onChange={(e) => setDeductions(e.target.value)}
            placeholder="Enter deductions"
            className="w-full px-3 py-2 bg-black/20 border border-white/20 rounded-lg text-sm sm:text-base"
          />
        </div>
      </div>

      {/* Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <div className="p-4 sm:p-6 bg-white/5 rounded-xl border border-white/10">
          <h3 className="text-lg sm:text-xl font-bold mb-4">📅 Quarterly Payment Schedule</h3>
          <div className="space-y-3 text-sm sm:text-base">
            <div className="p-3 bg-purple-500/20 rounded-lg">
              <div className="flex justify-between mb-1">
                <span className="font-semibold">Q1 (by June 15)</span>
                <span className="font-bold">{currSymbol}{result.q1}</span>
              </div>
              <p className="text-xs text-gray-400">15% of annual tax</p>
            </div>

            <div className="p-3 bg-pink-500/20 rounded-lg">
              <div className="flex justify-between mb-1">
                <span className="font-semibold">Q2 (by Sep 15)</span>
                <span className="font-bold">{currSymbol}{result.q2}</span>
              </div>
              <p className="text-xs text-gray-400">45% of annual tax</p>
            </div>

            <div className="p-3 bg-orange-500/20 rounded-lg">
              <div className="flex justify-between mb-1">
                <span className="font-semibold">Q3 (by Dec 15)</span>
                <span className="font-bold">{currSymbol}{result.q3}</span>
              </div>
              <p className="text-xs text-gray-400">75% of annual tax</p>
            </div>

            <div className="p-3 bg-green-500/20 rounded-lg">
              <div className="flex justify-between mb-1">
                <span className="font-semibold">Q4 (by Mar 15)</span>
                <span className="font-bold">{currSymbol}{result.q4}</span>
              </div>
              <p className="text-xs text-gray-400">100% of annual tax</p>
            </div>

            <div className="flex justify-between text-lg font-bold border-t border-white/20 pt-3 text-purple-400">
              <span>Total Annual Tax:</span>
              <span>{currSymbol}{result.totalTax}</span>
            </div>
          </div>

          <button className="mt-4 w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm transition">
            📆 Add to Calendar
          </button>
        </div>

        <div className="p-4 sm:p-6 bg-white/5 rounded-xl border border-white/10">
          <h3 className="text-lg sm:text-xl font-bold mb-4">📊 Payment Timeline</h3>
          <div className="h-64">
            <Bar data={chartData} options={{ maintainAspectRatio: false }} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ======================== 6. CAPITAL GAINS TAX CALCULATOR ======================== */
function CapitalGainsCalculator({ currency }) {
  const [assetType, setAssetType] = useState('equity');
  const [purchaseAmount, setPurchaseAmount] = useState('');
  const [saleAmount, setSaleAmount] = useState('');
  const [holdingPeriod, setHoldingPeriod] = useState('short');
  const [indexedCost, setIndexedCost] = useState('');

  const result = useMemo(() => {
    const purchase = parseFloat(purchaseAmount) || 0;
    const sale = parseFloat(saleAmount) || 0;
    const indexed = parseFloat(indexedCost) || purchase;

    const costBasis = holdingPeriod === 'long' && assetType === 'property' ? indexed : purchase;
    const capitalGain = sale - costBasis;

    let taxRate = 0;
    if (assetType === 'equity') {
      taxRate = holdingPeriod === 'short' ? 0.15 : 0.10;
    } else if (assetType === 'property') {
      taxRate = holdingPeriod === 'short' ? 0.30 : 0.20;
    } else if (assetType === 'debt') {
      taxRate = holdingPeriod === 'short' ? 0.30 : 0.20;
    }

    const tax = Math.max(capitalGain * taxRate, 0);

    return {
      capitalGain: capitalGain.toFixed(2),
      taxRate: (taxRate * 100).toFixed(0),
      tax: tax.toFixed(2),
      netProfit: (capitalGain - tax).toFixed(2),
    };
  }, [assetType, purchaseAmount, saleAmount, holdingPeriod, indexedCost]);

  const currSymbol = currencies.find(c => c.code === currency)?.symbol || '₹';

  return (
    <div className="space-y-4">
      <TipBox tip="Hold equity for >1 year and debt for >3 years to get Long Term Capital Gains benefits!" />
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs sm:text-sm mb-2">Asset Type</label>
          <select
            value={assetType}
            onChange={(e) => setAssetType(e.target.value)}
            className="w-full px-3 py-2 bg-black/20 border border-white/20 rounded-lg text-sm sm:text-base"
          >
            <option value="equity">Equity / Shares</option>
            <option value="property">Property / Real Estate</option>
            <option value="debt">Debt / Bonds</option>
            <option value="crypto">Cryptocurrency</option>
          </select>
        </div>

        <div>
          <label className="block text-xs sm:text-sm mb-2">Holding Period</label>
          <select
            value={holdingPeriod}
            onChange={(e) => setHoldingPeriod(e.target.value)}
            className="w-full px-3 py-2 bg-black/20 border border-white/20 rounded-lg text-sm sm:text-base"
          >
            <option value="short">Short Term</option>
            <option value="long">Long Term</option>
          </select>
        </div>

        <div>
          <label className="block text-xs sm:text-sm mb-2">Purchase Amount</label>
          <input
            type="number"
            value={purchaseAmount}
            onChange={(e) => setPurchaseAmount(e.target.value)}
            placeholder="Enter purchase price"
            className="w-full px-3 py-2 bg-black/20 border border-white/20 rounded-lg text-sm sm:text-base"
          />
        </div>

        <div>
          <label className="block text-xs sm:text-sm mb-2">Sale Amount</label>
          <input
            type="number"
            value={saleAmount}
            onChange={(e) => setSaleAmount(e.target.value)}
            placeholder="Enter sale price"
            className="w-full px-3 py-2 bg-black/20 border border-white/20 rounded-lg text-sm sm:text-base"
          />
        </div>

        {holdingPeriod === 'long' && assetType === 'property' && (
          <div className="col-span-1 sm:col-span-2">
            <label className="block text-xs sm:text-sm mb-2">Indexed Cost (Optional)</label>
            <input
              type="number"
              value={indexedCost}
              onChange={(e) => setIndexedCost(e.target.value)}
              placeholder="Enter indexed cost for property"
              className="w-full px-3 py-2 bg-black/20 border border-white/20 rounded-lg text-sm sm:text-base"
            />
          </div>
        )}
      </div>

      {/* Results */}
      <div className="p-4 sm:p-6 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl border border-green-500/30 mt-6">
        <h3 className="text-lg sm:text-xl font-bold mb-4">💎 Capital Gains Summary</h3>
        <div className="space-y-2 text-sm sm:text-base">
          <div className="flex justify-between">
            <span>Purchase Price:</span>
            <span className="font-bold">{currSymbol}{purchaseAmount || '0'}</span>
          </div>
          <div className="flex justify-between">
            <span>Sale Price:</span>
            <span className="font-bold">{currSymbol}{saleAmount || '0'}</span>
          </div>
          <div className="flex justify-between text-green-400">
            <span>Capital Gain:</span>
            <span className="font-bold">{currSymbol}{result.capitalGain}</span>
          </div>
          <div className="flex justify-between">
            <span>Tax Rate ({holdingPeriod === 'short' ? 'STCG' : 'LTCG'}):</span>
            <span className="font-bold">{result.taxRate}%</span>
          </div>
          <div className="flex justify-between text-red-400">
            <span>Tax Payable:</span>
            <span className="font-bold">{currSymbol}{result.tax}</span>
          </div>
          <div className="flex justify-between text-lg sm:text-xl font-bold border-t border-white/20 pt-2 text-purple-400">
            <span>Net Profit After Tax:</span>
            <span>{currSymbol}{result.netProfit}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ======================== 7. HRA EXEMPTION CALCULATOR ======================== */
function HRAExemptionCalculator({ currency }) {
  const [basicSalary, setBasicSalary] = useState('');
  const [hraReceived, setHraReceived] = useState('');
  const [rentPaid, setRentPaid] = useState('');
  const [cityType, setCityType] = useState('metro');

  const result = useMemo(() => {
    const basic = parseFloat(basicSalary) || 0;
    const hra = parseFloat(hraReceived) || 0;
    const rent = parseFloat(rentPaid) || 0;

    const metroPercentage = cityType === 'metro' ? 0.50 : 0.40;
    const tenPercentBasic = basic * 0.10;

    const exemption1 = hra;
    const exemption2 = basic * metroPercentage;
    const exemption3 = Math.max(rent - tenPercentBasic, 0);

    const hraExemption = Math.min(exemption1, exemption2, exemption3);
    const taxableHRA = hra - hraExemption;

    return {
      hraExemption: hraExemption.toFixed(2),
      taxableHRA: taxableHRA.toFixed(2),
      exemption1: exemption1.toFixed(2),
      exemption2: exemption2.toFixed(2),
      exemption3: exemption3.toFixed(2),
    };
  }, [basicSalary, hraReceived, rentPaid, cityType]);

  const currSymbol = currencies.find(c => c.code === currency)?.symbol || '₹';

  return (
    <div className="space-y-4">
      <TipBox tip={`Increase your rent by ${currSymbol}${(parseFloat(basicSalary) * 0.05).toFixed(0)} to maximize HRA exemption!`} />
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs sm:text-sm mb-2">Basic Salary (Monthly)</label>
          <input
            type="number"
            value={basicSalary}
            onChange={(e) => setBasicSalary(e.target.value)}
            placeholder="Enter basic salary"
            className="w-full px-3 py-2 bg-black/20 border border-white/20 rounded-lg text-sm sm:text-base"
          />
        </div>

        <div>
          <label className="block text-xs sm:text-sm mb-2">HRA Received (Monthly)</label>
          <input
            type="number"
            value={hraReceived}
            onChange={(e) => setHraReceived(e.target.value)}
            placeholder="Enter HRA"
            className="w-full px-3 py-2 bg-black/20 border border-white/20 rounded-lg text-sm sm:text-base"
          />
        </div>

        <div>
          <label className="block text-xs sm:text-sm mb-2">Actual Rent Paid (Monthly)</label>
          <input
            type="number"
            value={rentPaid}
            onChange={(e) => setRentPaid(e.target.value)}
            placeholder="Enter rent paid"
            className="w-full px-3 py-2 bg-black/20 border border-white/20 rounded-lg text-sm sm:text-base"
          />
        </div>

        <div>
          <label className="block text-xs sm:text-sm mb-2">City Type</label>
          <select
            value={cityType}
            onChange={(e) => setCityType(e.target.value)}
            className="w-full px-3 py-2 bg-black/20 border border-white/20 rounded-lg text-sm sm:text-base"
          >
            <option value="metro">Metro City (50%)</option>
            <option value="non-metro">Non-Metro (40%)</option>
          </select>
        </div>
      </div>

      {/* Results */}
      <div className="p-4 sm:p-6 bg-white/5 rounded-xl border border-white/10 mt-6">
        <h3 className="text-lg sm:text-xl font-bold mb-4">🏠 HRA Exemption Breakdown</h3>
        
        <div className="space-y-3 mb-4 text-xs sm:text-sm">
          <div className="p-3 bg-blue-500/10 rounded-lg">
            <div className="flex justify-between mb-1">
              <span>1. Actual HRA Received:</span>
              <span className="font-bold">{currSymbol}{result.exemption1}</span>
            </div>
          </div>

          <div className="p-3 bg-green-500/10 rounded-lg">
            <div className="flex justify-between mb-1">
              <span>2. {cityType === 'metro' ? '50%' : '40%'} of Basic:</span>
              <span className="font-bold">{currSymbol}{result.exemption2}</span>
            </div>
          </div>

          <div className="p-3 bg-orange-500/10 rounded-lg">
            <div className="flex justify-between mb-1">
              <span>3. Rent - 10% of Basic:</span>
              <span className="font-bold">{currSymbol}{result.exemption3}</span>
            </div>
          </div>
        </div>

        <div className="space-y-2 text-sm sm:text-base border-t border-white/20 pt-4">
          <div className="flex justify-between text-green-400">
            <span className="font-semibold">Tax-Free HRA:</span>
            <span className="font-bold">{currSymbol}{result.hraExemption}</span>
          </div>
          <div className="flex justify-between text-red-400">
            <span className="font-semibold">Taxable HRA:</span>
            <span className="font-bold">{currSymbol}{result.taxableHRA}</span>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            * HRA exemption is the minimum of the three amounts calculated above
          </p>
        </div>
      </div>
    </div>
  );
}

/* ======================== MAIN TAX CALCULATOR PAGE ======================== */
export default function TaxCalculatorPage() {
  const [activeTab, setActiveTab] = useState('gst');
  const [currency, setCurrency] = useState('INR');
  const [darkMode, setDarkMode] = useState(true);

  // tableData state to avoid undefined usage in download functions
  const [tableData, setTableData] = useState([]);

  const tabs = [
    { id: 'gst', name: 'GST', icon: '🧾' },
    { id: 'income', name: 'Income Tax', icon: '💰' },
    { id: 'business', name: 'Business Tax', icon: '🏢' },
    { id: 'tds', name: 'TDS', icon: '💳' },
    { id: 'advance', name: 'Advance Tax', icon: '📅' },
    { id: 'capital', name: 'Capital Gains', icon: '📈' },
    { id: 'hra', name: 'HRA', icon: '🏠' },
  ];

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all fields?')) {
      window.location.reload();
    }
  };

  // PDF download - uses tableData state
 const downloadPDF = async () => {
  try {
    // dynamic imports — safer in Next.js App Router / client components
    const jspdfModule = await import('jspdf');
    // jsPDF export can be default or named depending on version
    const jsPDF = jspdfModule.jsPDF || jspdfModule.default || jspdfModule;
    // load and run the autotable plugin (this patches jsPDF prototype)
    await import('jspdf-autotable');

    const doc = new jsPDF();

    // Title
    doc.setFontSize(18);
    doc.text("Transaction Report", 14, 16);

    // Table headers and rows
    const headers = [["Name", "Amount", "Date"]];
    const rows = (tableData || []).map(item => [
      item.name || '',
      item.amount || '',
      item.date || ''
    ]);

    // If autoTable available, use it
    if (typeof doc.autoTable === 'function') {
      doc.autoTable({
        head: headers,
        body: rows,
        startY: 30,
        theme: 'grid',
        styles: { fontSize: 10 },
        headStyles: { fillColor: [79, 70, 229] }, // optional
      });
    } else {
      // fallback: draw a simple text table if autoTable isn't present
      let y = 30;
      const lineHeight = 8;
      // draw headers
      doc.setFontSize(11);
      doc.text(headers[0].join('   |   '), 14, y);
      y += lineHeight;
      rows.forEach(r => {
        doc.text(r.join('   |   '), 14, y);
        y += lineHeight;
        // Add new page if needed
        if (y > 280) {
          doc.addPage();
          y = 20;
        }
      });
    }

    doc.save("report.pdf");
    console.log("PDF created");
  } catch (err) {
    console.error("downloadPDF error:", err);
    // fallback: try a very simple jsPDF usage if imports failed earlier
    try {
      const { jsPDF: jsPDFNamed, default: jsPDFDefault } = await import('jspdf');
      const jsPDFCtor = jsPDFNamed || jsPDFDefault || (await import('jspdf'));
      const doc2 = new (jsPDFCtor.jsPDF || jsPDFCtor)();
      doc2.text("Transaction Report", 14, 20);
      doc2.save("report-fallback.pdf");
    } catch (err2) {
      console.error("fallback pdf failed:", err2);
      alert("PDF generation failed — check console for details and ensure jspdf + jspdf-autotable are installed.");
    }
  }
};


  // -----------------------------------------
  // 🚀 DOWNLOAD EXCEL (.xlsx)
  // -----------------------------------------
  const downloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(tableData || []);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Report");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const file = new Blob([excelBuffer], {
      type:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(file, "report.xlsx");
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white' : 'bg-gray-100 text-black'} px-4 sm:px-6 lg:px-8 py-8 sm:py-12`}>
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2">🧮 ODDLEX Tax Calculator</h1>
          <p className="text-sm sm:text-base text-gray-400">7 Professional Tax Calculators in One Place</p>
        </div>

        {/* Global Features */}
        <GlobalFeatures
          onReset={handleReset}
          onExportPDF={downloadPDF}
          onExportExcel={downloadExcel}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          currency={currency}
          setCurrency={setCurrency}
        />

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6 bg-white/5 p-2 rounded-xl border border-white/10">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 min-w-[100px] px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                  : 'bg-white/10 hover:bg-white/20'
              }`}
            >
              {tab.icon} {tab.name}
            </button>
          ))}
        </div>

        {/* Calculator Content */}
        <div className="p-4 sm:p-6 lg:p-8 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
          {activeTab === 'gst' && <GSTCalculator currency={currency} />}
          {activeTab === 'income' && <IncomeTaxCalculator currency={currency} />}
          {activeTab === 'business' && <BusinessTaxCalculator currency={currency} />}
          {activeTab === 'tds' && <TDSCalculator currency={currency} />}
          {activeTab === 'advance' && <AdvanceTaxCalculator currency={currency} />}
          {activeTab === 'capital' && <CapitalGainsCalculator currency={currency} />}
          {activeTab === 'hra' && <HRAExemptionCalculator currency={currency} />}
        </div>

        {/* Footer Info */}
        <div className="mt-8 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl text-center text-xs sm:text-sm">
          <p>⚠️ <strong>Disclaimer:</strong> These calculators provide estimates only. Please consult a tax professional for accurate filing.</p>
        </div>
      </div>
    </div>
  );
}
