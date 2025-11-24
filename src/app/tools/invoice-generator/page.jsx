'use client';
import React, { useState, useMemo, useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const currencyList = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
  { code: "AED", symbol: "د.إ", name: "UAE Dirham" },
];

/* ======================== TEMPLATE 1: Modern Orange ======================== */
function Template1({ data, totals }) {
  const curr = currencyList.find(c => c.code === data.currency) || currencyList[1];
  
  return (
    <div className="bg-white text-black p-8 rounded-lg shadow-2xl" style={{ width: '794px', minHeight: '1123px' }}>
      {/* Header */}
      <div className="flex justify-between items-start border-b-4 border-orange-500 pb-4 mb-6">
        <div>
          {data.logo && <img src={data.logo} alt="Logo" className="w-24 h-24 object-contain mb-2" />}
          <h1 className="text-3xl font-bold text-gray-800">{data.companyName || 'Your Company'}</h1>
          <p className="text-sm text-gray-600 mt-1">{data.companyAddress}</p>
          {data.companyEmail && <p className="text-sm text-gray-600">✉ {data.companyEmail}</p>}
          {data.companyPhone && <p className="text-sm text-gray-600">☎ {data.companyPhone}</p>}
        </div>
        <div className="text-right bg-orange-500 text-white p-4 rounded-lg">
          <h2 className="text-3xl font-bold">INVOICE</h2>
          <p className="text-sm mt-2">#{data.invoiceNumber || 'INV-0001'}</p>
        </div>
      </div>

      {/* Bill To & Invoice Details */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className="font-bold text-lg mb-2 text-orange-600">BILL TO:</h3>
          <p className="font-bold text-lg">{data.clientName || 'Client Name'}</p>
          {data.clientCompany && <p className="text-sm text-gray-600">{data.clientCompany}</p>}
          <p className="text-sm text-gray-600 mt-1">{data.clientAddress}</p>
          {data.clientEmail && <p className="text-sm text-gray-600">✉ {data.clientEmail}</p>}
        </div>
        <div className="text-right">
          <div className="space-y-1">
            <p><span className="font-semibold">Issue Date:</span> {data.issueDate || new Date().toLocaleDateString()}</p>
            <p><span className="font-semibold">Due Date:</span> {data.dueDate || 'N/A'}</p>
            <p className="text-2xl font-bold text-orange-600 mt-4">
              Total: {curr.symbol}{totals.grandTotal.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <table className="w-full mb-8 text-sm">
        <thead className="bg-orange-500 text-white">
          <tr>
            <th className="text-left p-3">DESCRIPTION</th>
            <th className="text-center p-3">QTY</th>
            <th className="text-right p-3">PRICE</th>
            <th className="text-right p-3">TAX</th>
            <th className="text-right p-3">AMOUNT</th>
          </tr>
        </thead>
        <tbody>
          {data.items.map((item, i) => (
            <tr key={i} className="border-b border-gray-200">
              <td className="p-3">{item.name}</td>
              <td className="text-center p-3">{item.qty}</td>
              <td className="text-right p-3">{curr.symbol}{item.price}</td>
              <td className="text-right p-3">{item.tax}%</td>
              <td className="text-right p-3 font-semibold">{curr.symbol}{item.total.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div className="flex justify-end mb-8">
        <div className="w-64 space-y-2">
          <div className="flex justify-between text-sm">
            <span>Subtotal:</span>
            <span>{curr.symbol}{totals.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Tax:</span>
            <span>{curr.symbol}{totals.tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Discount:</span>
            <span>-{curr.symbol}{totals.discount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold text-lg border-t-2 border-orange-500 pt-2">
            <span>TOTAL:</span>
            <span className="text-orange-600">{curr.symbol}{totals.grandTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Notes & Footer */}
      {data.notes && (
        <div className="bg-orange-50 p-4 rounded mb-4">
          <h4 className="font-bold text-sm mb-1 text-orange-600">NOTES:</h4>
          <p className="text-xs text-gray-700">{data.notes}</p>
        </div>
      )}
      
      <div className="text-center text-xs text-gray-500 border-t pt-4">
        <p>Thank you for your business!</p>
        {data.companyWebsite && <p>{data.companyWebsite}</p>}
      </div>
    </div>
  );
}

/* ======================== TEMPLATE 2: Elegant Yellow ======================== */
function Template2({ data, totals }) {
  const curr = currencyList.find(c => c.code === data.currency) || currencyList[1];
  
  return (
    <div className="bg-white text-black p-8" style={{ width: '794px', minHeight: '1123px' }}>
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-700 to-gray-600 text-white p-6 rounded-t-lg mb-8">
        <div className="flex justify-between items-center">
          <div>
            {data.logo && <img src={data.logo} alt="Logo" className="w-20 h-20 object-contain mb-2 bg-white p-2 rounded" />}
            <h1 className="text-2xl font-bold">{data.companyName || 'YOUR COMPANY'}</h1>
            <p className="text-xs mt-1">{data.companyAddress}</p>
            <p className="text-xs">{data.companyEmail} | {data.companyPhone}</p>
          </div>
          <div className="bg-yellow-400 text-black px-6 py-4 rounded-lg">
            <h2 className="text-3xl font-bold italic">Invoice</h2>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="bg-gray-50 p-4 rounded">
          <h3 className="font-bold mb-2">BILL TO:</h3>
          <p className="font-bold">{data.clientName}</p>
          {data.clientCompany && <p className="text-sm">{data.clientCompany}</p>}
          <p className="text-sm">{data.clientAddress}</p>
        </div>
        <div className="text-right">
          <p className="text-sm"><span className="font-semibold">Invoice #:</span> {data.invoiceNumber}</p>
          <p className="text-sm"><span className="font-semibold">Issue Date:</span> {data.issueDate || new Date().toLocaleDateString()}</p>
          <p className="text-sm"><span className="font-semibold">Due Date:</span> {data.dueDate}</p>
          <p className="text-xl font-bold mt-4">Total: {curr.symbol}{totals.grandTotal.toFixed(2)}</p>
        </div>
      </div>

      {/* Table */}
      <table className="w-full mb-6 text-sm">
        <thead className="bg-yellow-400">
          <tr>
            <th className="text-left p-2">DESCRIPTION</th>
            <th className="text-center p-2">QTY</th>
            <th className="text-right p-2">UNIT PRICE</th>
            <th className="text-right p-2">AMOUNT</th>
          </tr>
        </thead>
        <tbody>
          {data.items.map((item, i) => (
            <tr key={i} className={i % 2 === 0 ? 'bg-gray-50' : ''}>
              <td className="p-2">{item.name}</td>
              <td className="text-center p-2">{item.qty}</td>
              <td className="text-right p-2">{curr.symbol}{item.price}</td>
              <td className="text-right p-2 font-semibold">{curr.symbol}{item.total.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div className="flex justify-end mb-6">
        <div className="w-64 bg-gray-50 p-4 rounded">
          <div className="flex justify-between mb-1 text-sm"><span>Sub Total:</span><span>{curr.symbol}{totals.subtotal.toFixed(2)}</span></div>
          <div className="flex justify-between mb-1 text-sm"><span>Tax ({totals.taxPercent}%):</span><span>{curr.symbol}{totals.tax.toFixed(2)}</span></div>
          <div className="flex justify-between mb-3 text-sm"><span>Discount:</span><span>-{curr.symbol}{totals.discount.toFixed(2)}</span></div>
          <div className="flex justify-between font-bold text-lg border-t-2 border-gray-300 pt-2">
            <span>Total Due:</span>
            <span>{curr.symbol}{totals.grandTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t-2 border-gray-700 pt-4 text-center text-xs">
        <p className="font-semibold">Thank you for your time & business!</p>
        {data.notes && <p className="mt-2 text-gray-600">{data.notes}</p>}
      </div>
    </div>
  );
}

/* ======================== TEMPLATE 3: Professional Blue ======================== */
function Template3({ data, totals }) {
  const curr = currencyList.find(c => c.code === data.currency) || currencyList[1];
  
  return (
    <div className="bg-white text-black p-8" style={{ width: '794px', minHeight: '1123px' }}>
      <div className="border-4 border-blue-600 p-6 rounded-lg">
        {/* Header */}
        <div className="flex justify-between mb-6 border-b-2 border-blue-600 pb-4">
          <div className="flex items-center gap-4">
            {data.logo && <img src={data.logo} alt="Logo" className="w-16 h-16 object-contain" />}
            <div>
              <h1 className="text-2xl font-bold text-blue-600">{data.companyName}</h1>
              <p className="text-xs">{data.companyAddress}</p>
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-4xl font-bold text-blue-600">INVOICE</h2>
            <p className="text-sm mt-1">#{data.invoiceNumber}</p>
          </div>
        </div>

        {/* Bill Info */}
        <div className="grid grid-cols-3 gap-4 mb-6 text-sm">
          <div>
            <h3 className="font-bold text-blue-600 mb-1">BILL TO:</h3>
            <p className="font-semibold">{data.clientName}</p>
            <p>{data.clientAddress}</p>
          </div>
          <div>
            <h3 className="font-bold text-blue-600 mb-1">DATES:</h3>
            <p>Issue: {data.issueDate}</p>
            <p>Due: {data.dueDate}</p>
          </div>
          <div className="text-right">
            <h3 className="font-bold text-blue-600 mb-1">AMOUNT DUE:</h3>
            <p className="text-2xl font-bold">{curr.symbol}{totals.grandTotal.toFixed(2)}</p>
          </div>
        </div>

        {/* Items */}
        <table className="w-full mb-6 text-sm border-collapse">
          <thead>
            <tr className="bg-blue-600 text-white">
              <th className="text-left p-2 border">ITEM</th>
              <th className="text-center p-2 border">QTY</th>
              <th className="text-right p-2 border">RATE</th>
              <th className="text-right p-2 border">TAX</th>
              <th className="text-right p-2 border">TOTAL</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((item, i) => (
              <tr key={i} className="border">
                <td className="p-2 border">{item.name}</td>
                <td className="text-center p-2 border">{item.qty}</td>
                <td className="text-right p-2 border">{curr.symbol}{item.price}</td>
                <td className="text-right p-2 border">{item.tax}%</td>
                <td className="text-right p-2 border font-semibold">{curr.symbol}{item.total.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Summary */}
        <div className="flex justify-end">
          <div className="w-64 text-sm">
            <div className="flex justify-between py-1"><span>Subtotal:</span><span>{curr.symbol}{totals.subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between py-1"><span>Tax:</span><span>{curr.symbol}{totals.tax.toFixed(2)}</span></div>
            <div className="flex justify-between py-1"><span>Discount:</span><span>-{curr.symbol}{totals.discount.toFixed(2)}</span></div>
            <div className="flex justify-between py-2 border-t-2 border-blue-600 mt-2 font-bold text-lg">
              <span>TOTAL:</span>
              <span className="text-blue-600">{curr.symbol}{totals.grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        {data.notes && (
          <div className="mt-6 bg-blue-50 p-3 rounded">
            <p className="text-xs font-semibold text-blue-600">Notes:</p>
            <p className="text-xs">{data.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ======================== MAIN PAGE ======================== */
export default function InvoiceGeneratorPage() {
  const [template, setTemplate] = useState(1);
  const [currency, setCurrency] = useState('INR');
  const [logo, setLogo] = useState(null);
  
  const [formData, setFormData] = useState({
    companyName: '',
    companyAddress: '',
    companyEmail: '',
    companyPhone: '',
    companyWebsite: '',
    clientName: '',
    clientCompany: '',
    clientAddress: '',
    clientEmail: '',
    invoiceNumber: 'INV-0001',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    notes: '',
    items: [{ id: 1, name: '', qty: 1, price: 0, tax: 0, discount: 0 }]
  });

  const previewRef = useRef();

  const totals = useMemo(() => {
    let subtotal = 0, totalTax = 0, totalDiscount = 0;
    
    const itemsWithTotals = formData.items.map(item => {
      const qty = Number(item.qty) || 0;
      const price = Number(item.price) || 0;
      const tax = Number(item.tax) || 0;
      const discount = Number(item.discount) || 0;
      
      const lineTotal = qty * price;
      const taxAmount = (lineTotal * tax) / 100;
      const discountAmount = (lineTotal * discount) / 100;
      const total = lineTotal + taxAmount - discountAmount;
      
      subtotal += lineTotal;
      totalTax += taxAmount;
      totalDiscount += discountAmount;
      
      return { ...item, total };
    });
    
    return {
      subtotal,
      tax: totalTax,
      discount: totalDiscount,
      grandTotal: subtotal + totalTax - totalDiscount,
      items: itemsWithTotals
    };
  }, [formData.items]);

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { id: Date.now(), name: '', qty: 1, price: 0, tax: 0, discount: 0 }]
    });
  };

  const handleRemoveItem = (id) => {
    setFormData({
      ...formData,
      items: formData.items.filter(i => i.id !== id)
    });
  };

  const handleUpdateItem = (id, field, value) => {
    setFormData({
      ...formData,
      items: formData.items.map(i => i.id === id ? { ...i, [field]: value } : i)
    });
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setLogo(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const exportPDF = async () => {
    const element = previewRef.current;
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`invoice-${formData.invoiceNumber}.pdf`);
  };

  const exportImage = async () => {
    const element = previewRef.current;
    const canvas = await html2canvas(element, { scale: 2 });
    const link = document.createElement('a');
    link.download = `invoice-${formData.invoiceNumber}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  const data = {
    ...formData,
    logo,
    currency,
    items: totals.items
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2">🧾 Professional Invoice Generator</h1>
          <p className="text-sm sm:text-base text-gray-400">Create beautiful invoices in minutes</p>
        </div>

        {/* Template Selector */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {[1, 2, 3].map(t => (
            <button
              key={t}
              onClick={() => setTemplate(t)}
              className={`px-4 sm:px-6 py-2 rounded-lg transition text-sm sm:text-base ${
                template === t
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500'
                  : 'bg-white/10 hover:bg-white/20'
              }`}
            >
              Template {t}
            </button>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
          
          {/* Form Section */}
          <div className="space-y-4">
            
            {/* Company Details */}
            <div className="p-4 sm:p-6 bg-white/5 rounded-2xl border border-white/10">
              <h3 className="text-lg sm:text-xl font-bold mb-4">🏢 Company Details</h3>
              <div className="space-y-3">
                <input
                  placeholder="Company Name *"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-black/20 border border-white/10 text-sm sm:text-base"
                />
                <textarea
                  placeholder="Address *"
                  value={formData.companyAddress}
                  onChange={(e) => setFormData({ ...formData, companyAddress: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg bg-black/20 border border-white/10 text-sm sm:text-base"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    placeholder="Email"
                    value={formData.companyEmail}
                    onChange={(e) => setFormData({ ...formData, companyEmail: e.target.value })}
                    className="px-3 py-2 rounded-lg bg-black/20 border border-white/10 text-sm"
                  />
                  <input
                    placeholder="Phone"
                    value={formData.companyPhone}
                    onChange={(e) => setFormData({ ...formData, companyPhone: e.target.value })}
                    className="px-3 py-2 rounded-lg bg-black/20 border border-white/10 text-sm"
                  />
                </div>
                <input
                  placeholder="Website (optional)"
                  value={formData.companyWebsite}
                  onChange={(e) => setFormData({ ...formData, companyWebsite: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-black/20 border border-white/10 text-sm"
                />
              </div>
            </div>

            {/* Client Details */}
            <div className="p-4 sm:p-6 bg-white/5 rounded-2xl border border-white/10">
              <h3 className="text-lg sm:text-xl font-bold mb-4">👤 Client Details</h3>
              <div className="space-y-3">
                <input
                  placeholder="Client Name *"
                  value={formData.clientName}
                  onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-black/20 border border-white/10 text-sm sm:text-base"
                />
                <input
                  placeholder="Company"
                  value={formData.clientCompany}
                  onChange={(e) => setFormData({ ...formData, clientCompany: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-black/20 border border-white/10 text-sm"
                />
                <textarea
                  placeholder="Address *"
                  value={formData.clientAddress}
                  onChange={(e) => setFormData({ ...formData, clientAddress: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg bg-black/20 border border-white/10 text-sm"
                />
                <input
                  placeholder="Email"
                  value={formData.clientEmail}
                  onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-black/20 border border-white/10 text-sm"
                />
              </div>
            </div>

            {/* Logo & Settings */}
            <div className="p-4 sm:p-6 bg-white/5 rounded-2xl border border-white/10">
              <h3 className="text-lg sm:text-xl font-bold mb-4">⚙️ Settings</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs sm:text-sm text-gray-300 block mb-1">Logo</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="w-full text-xs sm:text-sm"
                  />
                  {logo && (
                    <div className="mt-2 flex items-center gap-2">
                      <img src={logo} alt="Logo" className="w-16 h-16 object-contain bg-white p-1 rounded" />
                      <button
                        onClick={() => setLogo(null)}
                        className="px-3 py-1 bg-red-500 hover:bg-red-600 rounded text-xs"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs sm:text-sm text-gray-300 block mb-1">Invoice #</label>
                    <input
                      value={formData.invoiceNumber}
                      onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-black/20 border border-white/10 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs sm:text-sm text-gray-300 block mb-1">Currency</label>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-black/20 border border-white/10 text-sm"
                    >
                      {currencyList.map(c => (
                        <option key={c.code} value={c.code}>{c.symbol} {c.code}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs sm:text-sm text-gray-300 block mb-1">Issue Date</label>
                    <input
                      type="date"
                      value={formData.issueDate}
                      onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-black/20 border border-white/10 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs sm:text-sm text-gray-300 block mb-1">Due Date</label>
                    <input
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-black/20 border border-white/10 text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Items */}
            <div className="p-4 sm:p-6 bg-white/5 rounded-2xl border border-white/10">
              <h3 className="text-lg sm:text-xl font-bold mb-4">📦 Items</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs sm:text-sm">
                  <thead className="bg-white/10">
                    <tr>
                      <th className="p-2 text-left">Item</th>
                      <th className="p-2 text-center">Qty</th>
                      <th className="p-2 text-right">Price</th>
                      <th className="p-2 text-right">Tax%</th>
                      <th className="p-2 text-right">Disc%</th>
                      <th className="p-2"></th>
                      </tr>
                  </thead>
                  <tbody>
                    {formData.items.map((item) => (
                      <tr key={item.id} className="border-t border-white/10">
                        <td className="p-2">
                          <input
                            placeholder="Item name"
                            value={item.name}
                            onChange={(e) => handleUpdateItem(item.id, 'name', e.target.value)}
                            className="w-full bg-transparent border-b border-white/20 focus:outline-none text-xs sm:text-sm"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            value={item.qty}
                            onChange={(e) => handleUpdateItem(item.id, 'qty', e.target.value)}
                            className="w-12 sm:w-16 bg-transparent border-b border-white/20 focus:outline-none text-center text-xs sm:text-sm"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            value={item.price}
                            onChange={(e) => handleUpdateItem(item.id, 'price', e.target.value)}
                            className="w-16 sm:w-20 bg-transparent border-b border-white/20 focus:outline-none text-right text-xs sm:text-sm"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            value={item.tax}
                            onChange={(e) => handleUpdateItem(item.id, 'tax', e.target.value)}
                            className="w-12 sm:w-16 bg-transparent border-b border-white/20 focus:outline-none text-right text-xs sm:text-sm"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            value={item.discount}
                            onChange={(e) => handleUpdateItem(item.id, 'discount', e.target.value)}
                            className="w-12 sm:w-16 bg-transparent border-b border-white/20 focus:outline-none text-right text-xs sm:text-sm"
                          />
                        </td>
                        <td className="p-2">
                          <button
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-red-400 hover:text-red-500 text-sm"
                          >
                            ✖
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <button
                  onClick={handleAddItem}
                  className="mt-3 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-xs sm:text-sm"
                >
                  ➕ Add Item
                </button>
              </div>
            </div>

            {/* Notes */}
            <div className="p-4 sm:p-6 bg-white/5 rounded-2xl border border-white/10">
              <h3 className="text-lg sm:text-xl font-bold mb-4">📝 Notes</h3>
              <textarea
                placeholder="Additional notes or payment terms (optional)"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 rounded-lg bg-black/20 border border-white/10 text-xs sm:text-sm"
              />
            </div>

            {/* Export Buttons */}
            <div className="p-4 sm:p-6 bg-white/5 rounded-2xl border border-white/10">
              <h3 className="text-lg sm:text-xl font-bold mb-4">💾 Export Invoice</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={exportPDF}
                  className="px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 rounded-lg font-semibold text-sm sm:text-base transition transform hover:scale-105 flex items-center justify-center gap-2"
                >
                  📄 Download PDF
                </button>
                <button
                  onClick={exportImage}
                  className="px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-lg font-semibold text-sm sm:text-base transition transform hover:scale-105 flex items-center justify-center gap-2"
                >
                  🖼️ Download Image
                </button>
              </div>
            </div>

          </div>

          {/* Preview Section */}
          <div className="sticky top-4 h-fit">
           <div className="p-4 sm:p-6 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10">
            <h3 className="text-lg sm:text-xl font-bold mb-4">👁️ Live Preview</h3>

            <div
              className="bg-gray-100 p-4 rounded-lg overflow-auto flex justify-center"
              style={{

                overflow: "hidden",
                maxHeight: '100%',
                minHeight: '600px', // ensures full height alignment
             }}
            >
             <div
               ref={previewRef}
               style={{
                 transform: 'scale(0.68)',         // adjust zoom level
                 transformOrigin: 'top center',   // keeps preview centered
                 width: '147%',                   // proportional width for scale 0.8
                 height: 'auto',
               }}
             >
               {template === 1 && <Template1 data={data} totals={totals} />}
               {template === 2 && <Template2 data={data} totals={totals} />}
               {template === 3 && <Template3 data={data} totals={totals} />}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}