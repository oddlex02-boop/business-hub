'use client';
import React, { useState, useMemo, useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const currencies = [
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
];

/* ======================== TEMPLATE 1: Professional Blue ======================== */
function Template1({ data, totals, currency }) {
  const curr = currencies.find(c => c.code === currency);
  
  return (
    <div className="bg-white text-black p-8 rounded-lg shadow-2xl" style={{ width: '794px', minHeight: '1123px' }}>
      {/* Header */}
      <div className="flex justify-between items-start border-b-4 border-blue-600 pb-4 mb-6">
        <div>
          {data.logo && <img src={data.logo} alt="Logo" className="w-24 h-24 object-contain mb-2" />}
          <h1 className="text-3xl font-bold text-gray-800">{data.businessName || 'Your Business'}</h1>
          <p className="text-sm text-gray-600 mt-1">{data.businessAddress}</p>
          {data.businessEmail && <p className="text-sm text-gray-600">✉ {data.businessEmail}</p>}
          {data.businessPhone && <p className="text-sm text-gray-600">☎ {data.businessPhone}</p>}
        </div>
        <div className="text-right bg-blue-600 text-white p-4 rounded-lg">
          <h2 className="text-3xl font-bold">ESTIMATE</h2>
          <p className="text-sm mt-2">#{data.estimateNumber || 'EST-0001'}</p>
        </div>
      </div>

      {/* Client & Date Info */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className="font-bold text-lg mb-2 text-blue-600">ESTIMATE FOR:</h3>
          <p className="font-bold text-lg">{data.clientName || 'Client Name'}</p>
          {data.clientCompany && <p className="text-sm text-gray-600">{data.clientCompany}</p>}
          {data.clientEmail && <p className="text-sm text-gray-600">✉ {data.clientEmail}</p>}
          {data.clientPhone && <p className="text-sm text-gray-600">☎ {data.clientPhone}</p>}
        </div>
        <div className="text-right">
          <div className="space-y-1 text-sm">
            <p><span className="font-semibold">Estimate Date:</span> {data.estimateDate || new Date().toLocaleDateString()}</p>
            {data.dueDate && <p><span className="font-semibold">Valid Until:</span> {data.dueDate}</p>}
          </div>
        </div>
      </div>

      {/* Items Table */}
      <table className="w-full mb-8 text-sm border-collapse">
        <thead className="bg-blue-600 text-white">
          <tr>
            <th className="text-left p-3 border">ITEM / SERVICE</th>
            <th className="text-left p-3 border">DESCRIPTION</th>
            <th className="text-center p-3 border">QTY</th>
            <th className="text-right p-3 border">PRICE</th>
            <th className="text-right p-3 border">TAX</th>
            <th className="text-right p-3 border">AMOUNT</th>
          </tr>
        </thead>
        <tbody>
          {data.items.map((item, i) => (
            <tr key={i} className="border">
              <td className="p-3 border font-semibold">{item.name}</td>
              <td className="p-3 border text-xs text-gray-600">{item.description}</td>
              <td className="text-center p-3 border">{item.qty}</td>
              <td className="text-right p-3 border">{curr.symbol}{item.price}</td>
              <td className="text-right p-3 border">{item.tax}%</td>
              <td className="text-right p-3 border font-semibold">{curr.symbol}{item.total.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div className="flex justify-end mb-8">
        <div className="w-80 space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>{curr.symbol}{totals.subtotal.toFixed(2)}</span>
          </div>
          {totals.discount > 0 && (
            <div className="flex justify-between text-red-600">
              <span>Discount:</span>
              <span>-{curr.symbol}{totals.discount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Tax Total:</span>
            <span>{curr.symbol}{totals.tax.toFixed(2)}</span>
          </div>
          {totals.shipping > 0 && (
            <div className="flex justify-between">
              <span>Shipping:</span>
              <span>{curr.symbol}{totals.shipping.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-xl border-t-2 border-blue-600 pt-2 text-blue-600">
            <span>TOTAL:</span>
            <span>{curr.symbol}{totals.grandTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Notes & Terms */}
      {(data.notes || data.terms) && (
        <div className="grid grid-cols-1 gap-4 mb-6">
          {data.notes && (
            <div className="bg-blue-50 p-4 rounded">
              <h4 className="font-bold text-sm mb-2 text-blue-600">NOTES:</h4>
              <p className="text-xs text-gray-700 whitespace-pre-line">{data.notes}</p>
            </div>
          )}
          {data.terms && (
            <div className="bg-gray-50 p-4 rounded">
              <h4 className="font-bold text-sm mb-2 text-gray-700">TERMS & CONDITIONS:</h4>
              <p className="text-xs text-gray-700 whitespace-pre-line">{data.terms}</p>
            </div>
          )}
        </div>
      )}

      {/* Signature */}
      {data.signature && (
        <div className="text-right mt-8">
          <img src={data.signature} alt="Signature" className="w-32 h-20 object-contain ml-auto mb-2 border-b-2 border-gray-300" />
          <p className="text-sm font-semibold">Authorized Signature</p>
        </div>
      )}

      {/* Footer */}
      <div className="text-center text-xs text-gray-500 border-t pt-4 mt-8">
        <p>Thank you for your business!</p>
      </div>
    </div>
  );
}

/* ======================== TEMPLATE 2: Modern Green ======================== */
function Template2({ data, totals, currency }) {
  const curr = currencies.find(c => c.code === currency);
  
  return (
    <div className="bg-gradient-to-br from-green-50 to-white text-black p-8" style={{ width: '794px', minHeight: '1123px' }}>
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-500 text-white p-6 rounded-t-xl mb-6">
        <div className="flex justify-between items-center">
          <div>
            {data.logo && <img src={data.logo} alt="Logo" className="w-20 h-20 object-contain mb-2 bg-white p-2 rounded" />}
            <h1 className="text-2xl font-bold">{data.businessName || 'YOUR BUSINESS'}</h1>
            <p className="text-xs mt-1">{data.businessAddress}</p>
          </div>
          <div className="text-right">
            <h2 className="text-4xl font-bold">ESTIMATE</h2>
            <p className="text-sm mt-1">#{data.estimateNumber}</p>
          </div>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-bold mb-2 text-green-600">ESTIMATE FOR:</h3>
          <p className="font-bold">{data.clientName}</p>
          {data.clientCompany && <p className="text-sm text-gray-600">{data.clientCompany}</p>}
          <p className="text-sm text-gray-600">{data.clientEmail}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow text-right">
          <p className="text-sm mb-1"><span className="font-semibold">Date:</span> {data.estimateDate}</p>
          {data.dueDate && <p className="text-sm"><span className="font-semibold">Valid Until:</span> {data.dueDate}</p>}
        </div>
      </div>

      {/* Items */}
      <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
        <table className="w-full text-sm">
          <thead className="bg-green-600 text-white">
            <tr>
              <th className="text-left p-3">SERVICE</th>
              <th className="text-left p-3">DETAILS</th>
              <th className="text-center p-3">QTY</th>
              <th className="text-right p-3">RATE</th>
              <th className="text-right p-3">AMOUNT</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((item, i) => (
              <tr key={i} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                <td className="p-3 font-semibold">{item.name}</td>
                <td className="p-3 text-xs text-gray-600">{item.description}</td>
                <td className="text-center p-3">{item.qty}</td>
                <td className="text-right p-3">{curr.symbol}{item.price}</td>
                <td className="text-right p-3 font-semibold">{curr.symbol}{item.total.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="flex justify-end mb-6">
        <div className="w-72 bg-white p-4 rounded-lg shadow">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span>Subtotal:</span><span>{curr.symbol}{totals.subtotal.toFixed(2)}</span></div>
            {totals.discount > 0 && <div className="flex justify-between text-red-600"><span>Discount:</span><span>-{curr.symbol}{totals.discount.toFixed(2)}</span></div>}
            <div className="flex justify-between"><span>Tax:</span><span>{curr.symbol}{totals.tax.toFixed(2)}</span></div>
            {totals.shipping > 0 && <div className="flex justify-between"><span>Shipping:</span><span>{curr.symbol}{totals.shipping.toFixed(2)}</span></div>}
            <div className="flex justify-between font-bold text-xl border-t-2 border-green-600 pt-2 text-green-600">
              <span>TOTAL:</span>
              <span>{curr.symbol}{totals.grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Notes */}
      {data.notes && (
        <div className="bg-green-50 p-4 rounded-lg mb-4">
          <h4 className="font-bold text-sm mb-2 text-green-600">NOTES:</h4>
          <p className="text-xs whitespace-pre-line">{data.notes}</p>
        </div>
      )}

      {/* Footer */}
      <div className="text-center text-xs text-gray-500 border-t pt-4">
        <p className="font-semibold">Thank you for considering our services!</p>
      </div>
    </div>
  );
}

/* ======================== TEMPLATE 3: Elegant Purple ======================== */
function Template3({ data, totals, currency }) {
  const curr = currencies.find(c => c.code === currency);
  
  return (
    <div className="bg-white text-black p-8" style={{ width: '794px', minHeight: '1123px' }}>
      <div className="border-4 border-purple-600 p-6 rounded-2xl">
        {/* Header */}
        <div className="flex justify-between items-start mb-6 pb-4 border-b-2 border-purple-600">
          <div className="flex items-center gap-4">
            {data.logo && <img src={data.logo} alt="Logo" className="w-16 h-16 object-contain" />}
            <div>
              <h1 className="text-2xl font-bold text-purple-600">{data.businessName}</h1>
              <p className="text-xs">{data.businessAddress}</p>
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-4xl font-bold text-purple-600">QUOTATION</h2>
            <p className="text-sm">#{data.estimateNumber}</p>
          </div>
        </div>

        {/* Info */}
        <div className="grid grid-cols-3 gap-4 mb-6 text-sm">
          <div>
            <h3 className="font-bold text-purple-600 mb-1">TO:</h3>
            <p className="font-semibold">{data.clientName}</p>
            {data.clientCompany && <p className="text-gray-600">{data.clientCompany}</p>}
          </div>
          <div>
            <h3 className="font-bold text-purple-600 mb-1">DATE:</h3>
            <p>{data.estimateDate}</p>
            {data.dueDate && <p className="text-xs text-gray-600">Valid till: {data.dueDate}</p>}
          </div>
          <div className="text-right">
            <h3 className="font-bold text-purple-600 mb-1">AMOUNT:</h3>
            <p className="text-2xl font-bold">{curr.symbol}{totals.grandTotal.toFixed(2)}</p>
          </div>
        </div>

        {/* Items */}
        <table className="w-full mb-6 text-sm border-collapse">
          <thead>
            <tr className="bg-purple-600 text-white">
              <th className="text-left p-2 border">DESCRIPTION</th>
              <th className="text-center p-2 border">QTY</th>
              <th className="text-right p-2 border">RATE</th>
              <th className="text-right p-2 border">TAX</th>
              <th className="text-right p-2 border">TOTAL</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((item, i) => (
              <tr key={i} className="border">
                <td className="p-2 border">
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-xs text-gray-600">{item.description}</p>
                </td>
                <td className="text-center p-2 border">{item.qty}</td>
                <td className="text-right p-2 border">{curr.symbol}{item.price}</td>
                <td className="text-right p-2 border">{item.tax}%</td>
                <td className="text-right p-2 border font-semibold">{curr.symbol}{item.total.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Summary */}
        <div className="flex justify-end mb-6">
          <div className="w-64 text-sm">
            <div className="space-y-1">
              <div className="flex justify-between"><span>Subtotal:</span><span>{curr.symbol}{totals.subtotal.toFixed(2)}</span></div>
              {totals.discount > 0 && <div className="flex justify-between text-red-600"><span>Discount:</span><span>-{curr.symbol}{totals.discount.toFixed(2)}</span></div>}
              <div className="flex justify-between"><span>Tax:</span><span>{curr.symbol}{totals.tax.toFixed(2)}</span></div>
              {totals.shipping > 0 && <div className="flex justify-between"><span>Shipping:</span><span>{curr.symbol}{totals.shipping.toFixed(2)}</span></div>}
              <div className="flex justify-between font-bold text-lg border-t-2 border-purple-600 pt-2 text-purple-600">
                <span>TOTAL:</span>
                <span>{curr.symbol}{totals.grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Notes & Terms */}
        {(data.notes || data.terms) && (
          <div className="space-y-3">
            {data.notes && (
              <div className="bg-purple-50 p-3 rounded">
                <p className="text-xs font-semibold text-purple-600 mb-1">Notes:</p>
                <p className="text-xs whitespace-pre-line">{data.notes}</p>
              </div>
            )}
            {data.terms && (
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-xs font-semibold text-gray-700 mb-1">Terms & Conditions:</p>
                <p className="text-xs whitespace-pre-line">{data.terms}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ======================== TEMPLATE 4: Simple White ======================== */
function Template4({ data, totals, currency }) {
  const curr = currencies.find(c => c.code === currency);
  
  return (
    <div className="bg-white text-black p-8 border border-gray-300" style={{ width: '794px', minHeight: '1123px' }}>
      {/* Header */}
      <div className="flex justify-between items-start mb-8 pb-4 border-b-2 border-gray-800">
        <div>
          {data.logo && <img src={data.logo} alt="Logo" className="w-24 h-24 object-contain mb-3" />}
          <h1 className="text-2xl font-bold">{data.businessName || 'Business Name'}</h1>
          <p className="text-sm text-gray-600">{data.businessAddress}</p>
          <p className="text-sm text-gray-600">{data.businessEmail} | {data.businessPhone}</p>
        </div>
        <div className="text-right">
          <h2 className="text-3xl font-bold">ESTIMATE</h2>
          <p className="text-sm mt-1">#{data.estimateNumber || 'EST-0001'}</p>
          <p className="text-xs text-gray-600 mt-2">Date: {data.estimateDate}</p>
          {data.dueDate && <p className="text-xs text-gray-600">Valid Until: {data.dueDate}</p>}
        </div>
      </div>

      {/* Client Info */}
      <div className="mb-8">
        <h3 className="font-bold mb-2">ESTIMATE FOR:</h3>
        <p className="font-semibold">{data.clientName}</p>
        {data.clientCompany && <p className="text-sm text-gray-600">{data.clientCompany}</p>}
        <p className="text-sm text-gray-600">{data.clientEmail}</p>
        {data.clientPhone && <p className="text-sm text-gray-600">{data.clientPhone}</p>}
      </div>

      {/* Items Table */}
      <table className="w-full mb-8 text-sm">
        <thead className="border-b-2 border-gray-800">
          <tr>
            <th className="text-left p-2">ITEM / SERVICE</th>
            <th className="text-left p-2">DESCRIPTION</th>
            <th className="text-center p-2">QTY</th>
            <th className="text-right p-2">PRICE</th>
            <th className="text-right p-2">TAX</th>
            <th className="text-right p-2">AMOUNT</th>
          </tr>
        </thead>
        <tbody>
          {data.items.map((item, i) => (
            <tr key={i} className="border-b border-gray-200">
              <td className="p-2 font-semibold">{item.name}</td>
              <td className="p-2 text-xs text-gray-600">{item.description}</td>
              <td className="text-center p-2">{item.qty}</td>
              <td className="text-right p-2">{curr.symbol}{item.price}</td>
              <td className="text-right p-2">{item.tax}%</td>
              <td className="text-right p-2 font-semibold">{curr.symbol}{item.total.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div className="flex justify-end mb-8">
        <div className="w-72 text-sm">
          <div className="space-y-1">
            <div className="flex justify-between py-1"><span>Subtotal:</span><span>{curr.symbol}{totals.subtotal.toFixed(2)}</span></div>
            {totals.discount > 0 && <div className="flex justify-between py-1 text-red-600"><span>Discount:</span><span>-{curr.symbol}{totals.discount.toFixed(2)}</span></div>}
            <div className="flex justify-between py-1"><span>Tax Total:</span><span>{curr.symbol}{totals.tax.toFixed(2)}</span></div>
            {totals.shipping > 0 && <div className="flex justify-between py-1"><span>Shipping Charges:</span><span>{curr.symbol}{totals.shipping.toFixed(2)}</span></div>}
            <div className="flex justify-between font-bold text-xl border-t-2 border-gray-800 pt-2 mt-2">
              <span>TOTAL:</span>
              <span>{curr.symbol}{totals.grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Notes */}
      {data.notes && (
        <div className="mb-6">
          <h4 className="font-bold text-sm mb-2">NOTES:</h4>
          <p className="text-xs text-gray-700 whitespace-pre-line bg-gray-50 p-3 rounded">{data.notes}</p>
        </div>
      )}

      {/* Terms */}
      {data.terms && (
        <div className="mb-6">
          <h4 className="font-bold text-sm mb-2">TERMS & CONDITIONS:</h4>
          <p className="text-xs text-gray-700 whitespace-pre-line bg-gray-50 p-3 rounded">{data.terms}</p>
        </div>
      )}

      {/* Signature */}
      {data.signature && (
        <div className="text-right mt-8 pt-8 border-t">
          <img src={data.signature} alt="Signature" className="w-32 h-20 object-contain ml-auto mb-2" />
          <p className="text-sm font-semibold border-t border-gray-800 inline-block pt-1">Authorized Signature</p>
        </div>
      )}

      {/* Footer */}
      <div className="text-center text-xs text-gray-500 mt-8 pt-4 border-t">
        <p>Thank you for your business!</p>
      </div>
    </div>
  );
}

/* ======================== MAIN ESTIMATE GENERATOR PAGE ======================== */
export default function EstimateGeneratorPage() {
  const [template, setTemplate] = useState(1);
  const [currency, setCurrency] = useState('INR');
  const [logo, setLogo] = useState(null);
  const [signature, setSignature] = useState(null);

  const [formData, setFormData] = useState({
    businessName: '',
    businessAddress: '',
    businessEmail: '',
    businessPhone: '',
    clientName: '',
    clientCompany: '',
    clientEmail: '',
    clientPhone: '',
    estimateNumber: 'EST-0001',
    estimateDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    notes: '',
    terms: '',
    discount: 0,
    discountType: 'percent',
    shipping: 0,
    roundOff: false,
    items: [{ id: 1, name: '', description: '', qty: 1, price: 0, tax: 0 }]
  });

  const previewRef = useRef();

  const totals = useMemo(() => {
    let subtotal = 0, totalTax = 0;
    
    const itemsWithTotals = formData.items.map(item => {
      const qty = Number(item.qty) || 0;
      const price = Number(item.price) || 0;
      const tax = Number(item.tax) || 0;
      
      const lineTotal = qty * price;
      const taxAmount = (lineTotal * tax) / 100;
      const total = lineTotal + taxAmount;
      
      subtotal += lineTotal;
      totalTax += taxAmount;
      
      return { ...item, total };
    });
    
    let discountAmount = 0;
    if (formData.discountType === 'percent') {
      discountAmount = (subtotal * Number(formData.discount || 0)) / 100;
    } else {
      discountAmount = Number(formData.discount || 0);
    }
    
    const shipping = Number(formData.shipping || 0);
    let grandTotal = subtotal + totalTax - discountAmount + shipping;
    
    if (formData.roundOff) {
      grandTotal = Math.round(grandTotal);
    }
    
    return {
      subtotal,
      tax: totalTax,
      discount: discountAmount,
      shipping,
      grandTotal,
      items: itemsWithTotals
    };
  }, [formData.items, formData.discount, formData.discountType, formData.shipping, formData.roundOff]);

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { id: Date.now(), name: '', description: '', qty: 1, price: 0, tax: 0 }]
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

  const handleSignatureUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setSignature(reader.result);
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
    pdf.save(`estimate-${formData.estimateNumber}.pdf`);
  };

  const exportImage = async () => {
    const element = previewRef.current;
    const canvas = await html2canvas(element, { scale: 2 });
    const link = document.createElement('a');
    link.download = `estimate-${formData.estimateNumber}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  const saveDraft = () => {
    localStorage.setItem('estimate_draft', JSON.stringify({ formData, logo, signature, currency, template }));
    alert('✅ Draft saved successfully!');
  };

  const convertToInvoice = () => {
    const confirmConvert = confirm('Convert this estimate to invoice? This will redirect you to Invoice Generator.');
    if (confirmConvert) {
      // Store data for invoice page
      localStorage.setItem('convert_from_estimate', JSON.stringify({ formData, logo, currency }));
      window.location.href = '/invoice';
    }
  };

  const shareLink = () => {
    const shareText = `Estimate ${formData.estimateNumber} - Total: ${currencies.find(c => c.code === currency).symbol}${totals.grandTotal.toFixed(2)}`;
    const shareUrl = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: 'Estimate',
        text: shareText,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(shareText);
      alert('📋 Estimate details copied to clipboard!');
    }
  };

  const data = {
    ...formData,
    logo,
    signature,
    currency,
    items: totals.items
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2">🧾 Professional Estimate / Quotation Maker</h1>
          <p className="text-sm sm:text-base text-gray-400">Create professional estimates with 4 beautiful templates</p>
        </div>

        {/* Template & Currency Selector */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-8 p-4 bg-white/5 rounded-xl border border-white/10">
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4].map(t => (
              <button
                key={t}
                onClick={() => setTemplate(t)}
                className={`px-4 py-2 rounded-lg transition text-sm ${
                  template === t
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500'
                    : 'bg-white/10 hover:bg-white/20'
                }`}
              >
                Template {t}
              </button>
            ))}
          </div>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="px-4 py-2 bg-black/30 border border-white/20 rounded-lg text-sm"
          >
            {currencies.map(c => (
              <option key={c.code} value={c.code}>{c.symbol} {c.name}</option>
            ))}
          </select>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
          
          {/* Form Section */}
          <div className="space-y-4">
            
            {/* Business Details */}
            <div className="p-4 sm:p-6 bg-white/5 rounded-2xl border border-white/10">
              <h3 className="text-lg sm:text-xl font-bold mb-4">🏢 Business Details</h3>
              <div className="space-y-3">
                <input
                  placeholder="Business Name *"
                  value={formData.businessName}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-black/20 border border-white/10 text-sm"
                />
                <textarea
                  placeholder="Business Address *"
                  value={formData.businessAddress}
                  onChange={(e) => setFormData({ ...formData, businessAddress: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg bg-black/20 border border-white/10 text-sm"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    placeholder="Email"
                    value={formData.businessEmail}
                    onChange={(e) => setFormData({ ...formData, businessEmail: e.target.value })}
                    className="px-3 py-2 rounded-lg bg-black/20 border border-white/10 text-sm"
                  />
                  <input
                    placeholder="Phone"
                    value={formData.businessPhone}
                    onChange={(e) => setFormData({ ...formData, businessPhone: e.target.value })}
                    className="px-3 py-2 rounded-lg bg-black/20 border border-white/10 text-sm"
                  />
                </div>
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
                  className="w-full px-3 py-2 rounded-lg bg-black/20 border border-white/10 text-sm"
                />
                <input
                  placeholder="Company (optional)"
                  value={formData.clientCompany}
                  onChange={(e) => setFormData({ ...formData, clientCompany: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-black/20 border border-white/10 text-sm"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    placeholder="Email (optional)"
                    value={formData.clientEmail}
                    onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                    className="px-3 py-2 rounded-lg bg-black/20 border border-white/10 text-sm"
                  />
                  <input
                    placeholder="Phone (optional)"
                    value={formData.clientPhone}
                    onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                    className="px-3 py-2 rounded-lg bg-black/20 border border-white/10 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Estimate Info */}
            <div className="p-4 sm:p-6 bg-white/5 rounded-2xl border border-white/10">
              <h3 className="text-lg sm:text-xl font-bold mb-4">📋 Estimate Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-300 block mb-1">Estimate Number</label>
                  <input
                    value={formData.estimateNumber}
                    onChange={(e) => setFormData({ ...formData, estimateNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-black/20 border border-white/10 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-300 block mb-1">Estimate Date</label>
                  <input
                    type="date"
                    value={formData.estimateDate}
                    onChange={(e) => setFormData({ ...formData, estimateDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-black/20 border border-white/10 text-sm"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs text-gray-300 block mb-1">Valid Until (optional)</label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-black/20 border border-white/10 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Logo & Signature Upload */}
            <div className="p-4 sm:p-6 bg-white/5 rounded-2xl border border-white/10">
              <h3 className="text-lg sm:text-xl font-bold mb-4">🖼️ Branding</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-gray-300 block mb-1">Company Logo</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="w-full text-xs"
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

                <div>
                  <label className="text-xs text-gray-300 block mb-1">Signature / Stamp (optional)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleSignatureUpload}
                    className="w-full text-xs"
                  />
                  {signature && (
                    <div className="mt-2 flex items-center gap-2">
                      <img src={signature} alt="Signature" className="w-24 h-16 object-contain bg-white p-1 rounded" />
                      <button
                        onClick={() => setSignature(null)}
                        className="px-3 py-1 bg-red-500 hover:bg-red-600 rounded text-xs"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div className="p-4 sm:p-6 bg-white/5 rounded-2xl border border-white/10">
              <h3 className="text-lg sm:text-xl font-bold mb-4">📦 Items / Services</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-white/10">
                    <tr>
                      <th className="p-2 text-left">Item</th>
                      <th className="p-2 text-left">Description</th>
                      <th className="p-2 text-center">Qty</th>
                      <th className="p-2 text-right">Price</th>
                      <th className="p-2 text-right">Tax%</th>
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
                            className="w-full bg-transparent border-b border-white/20 focus:outline-none text-xs"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            placeholder="Description"
                            value={item.description}
                            onChange={(e) => handleUpdateItem(item.id, 'description', e.target.value)}
                            className="w-full bg-transparent border-b border-white/20 focus:outline-none text-xs"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            value={item.qty}
                            onChange={(e) => handleUpdateItem(item.id, 'qty', e.target.value)}
                            className="w-12 bg-transparent border-b border-white/20 focus:outline-none text-center text-xs"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            value={item.price}
                            onChange={(e) => handleUpdateItem(item.id, 'price', e.target.value)}
                            className="w-16 bg-transparent border-b border-white/20 focus:outline-none text-right text-xs"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            value={item.tax}
                            onChange={(e) => handleUpdateItem(item.id, 'tax', e.target.value)}
                            className="w-12 bg-transparent border-b border-white/20 focus:outline-none text-right text-xs"
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
                  className="mt-3 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-xs"
                >
                  ➕ Add Item
                </button>
              </div>
            </div>

            {/* Summary Options */}
            <div className="p-4 sm:p-6 bg-white/5 rounded-2xl border border-white/10">
              <h3 className="text-lg sm:text-xl font-bold mb-4">💰 Additional Charges</h3>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-gray-300 block mb-1">Discount</label>
                    <input
                      type="number"
                      value={formData.discount}
                      onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-black/20 border border-white/10 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-300 block mb-1">Type</label>
                    <select
                      value={formData.discountType}
                      onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-black/20 border border-white/10 text-sm"
                    >
                      <option value="percent">% Percent</option>
                      <option value="fixed">Fixed Amount</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-300 block mb-1">Shipping Charges (optional)</label>
                  <input
                    type="number"
                    value={formData.shipping}
                    onChange={(e) => setFormData({ ...formData, shipping: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-black/20 border border-white/10 text-sm"
                  />
                </div>

                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.roundOff}
                    onChange={(e) => setFormData({ ...formData, roundOff: e.target.checked })}
                    className="w-4 h-4"
                  />
                  Round Off Total
                </label>
              </div>
            </div>

            {/* Notes & Terms */}
            <div className="p-4 sm:p-6 bg-white/5 rounded-2xl border border-white/10">
              <h3 className="text-lg sm:text-xl font-bold mb-4">📝 Notes & Terms</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-300 block mb-1">Notes to Client</label>
                  <textarea
                    placeholder="e.g., Prices valid for 7 days only..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 rounded-lg bg-black/20 border border-white/10 text-xs"
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-300 block mb-1">Terms & Conditions</label>
                  <textarea
                    placeholder="e.g., 50% advance payment required..."
                    value={formData.terms}
                    onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 rounded-lg bg-black/20 border border-white/10 text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="p-4 sm:p-6 bg-white/5 rounded-2xl border border-white/10">
              <h3 className="text-lg sm:text-xl font-bold mb-4">⚙️ Actions</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                

                <button
                  onClick={exportPDF}
                  className="px-4 py-3 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-semibold transition flex items-center justify-center gap-2"
                >
                  📄 PDF
                </button>

                <button
                  onClick={exportImage}
                  className="px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-semibold transition flex items-center justify-center gap-2"
                >
                  🖼️ Image
                </button>

                <button
                  onClick={shareLink}
                  className="px-4 py-3 bg-green-600 hover:bg-green-700 rounded-lg text-sm font-semibold transition flex items-center justify-center gap-2"
                >
                  📤 Share
                </button>

                
              </div>
            </div>

          </div>

          {/* Preview Section */}
          <div className="sticky top-4 h-fit">
            <div className="p-4 sm:p-6 bg-white/5 rounded-2xl border border-white/10">
             <h3 className="text-lg sm:text-xl font-bold mb-4">👁️ Live Preview</h3>
           <div
            className="bg-gray-100 p-2 sm:p-4 rounded-lg overflow-hidden"
            style={{ maxHeight: 'none' }}
          >
       <div
        ref={previewRef}
        style={{
          transform: 'scale(0.68)',
          transformOrigin: 'top left',
          width: 'auto',
          display: 'inline-block',
        }}
      >
      {template === 1 && (
                  <Template1 data={data} totals={totals} currency={currency} />
                    )}
                    {template === 2 && (
                    <Template2 data={data} totals={totals} currency={currency} />
                    )}
                    {template === 3 && (
                    <Template3 data={data} totals={totals} currency={currency} />
                    )}
                    {template === 4 && (
                    <Template4 data={data} totals={totals} currency={currency} />
                     )}
                 </div>
               </div>
             </div>
           </div>


        </div>
      </div>
    </div>
  );
}