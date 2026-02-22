'use client';
import { useState } from 'react';

// Mock Data
const mockData = {
  stats: {
    totalLeads: 42,
    deals: 18,
    revenue: 24500,
    roi: 156
  },
  funnel: {
    leadsGesamt: 42,
    terminierungVerloren: 8,
    noShow: 6,
    abschluesse: 18
  },
  sales: [
    { id: 1, date: '2024-02-20', closer: 'Alex', amount: 5000, type: 'Full', status: 'Closed' },
    { id: 2, date: '2024-02-19', closer: 'Niklas', amount: 3000, type: 'Installment', status: 'Closed' },
    { id: 3, date: '2024-02-18', closer: 'Alex', amount: 2000, type: 'Full', status: 'No Show' },
    { id: 4, date: '2024-02-17', closer: 'Niklas', amount: 4000, type: 'Installment', status: 'Closed' },
    { id: 5, date: '2024-02-16', closer: 'Alex', amount: 1500, type: 'Full', status: 'Term Lost' },
  ],
  expenses: [
    { id: 1, date: '2024-02-15', category: 'Ads', amount: 500 },
    { id: 2, date: '2024-02-10', category: 'Software', amount: 200 },
    { id: 3, date: '2024-02-05', category: 'Ads', amount: 300 },
  ],
  closerStats: [
    { closer: 'Alex', full: 8500, installment: 0, total: 8500, deals: 3 },
    { closer: 'Niklas', full: 0, installment: 7000, total: 7000, deals: 2 },
  ]
};

function getStatusStyle(status: string) {
  if (status === 'Closed') return 'bg-green-500/20 text-green-400';
  if (status === 'No Show') return 'bg-orange-500/20 text-orange-400';
  return 'bg-red-500/20 text-red-400';
}

export default function CRM() {
  const formatCurrency = (amount: number) => new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(amount);
  
  return (
    <div className="min-h-screen bg-gray-900 text-white pb-20 md:pb-0">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-blue-400">Sales CRM</h1>
            <div className="flex gap-4 text-sm">
              <span className="px-3 py-1 bg-gray-700 rounded-full">Admin</span>
              <span className="text-gray-400">Lukas</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <p className="text-gray-400 text-sm">Total Leads</p>
            <p className="text-2xl font-bold">{mockData.stats.totalLeads}</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <p className="text-gray-400 text-sm">Deals</p>
            <p className="text-2xl font-bold text-green-400">{mockData.stats.deals}</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <p className="text-gray-400 text-sm">Revenue</p>
            <p className="text-2xl font-bold text-green-400">{formatCurrency(mockData.stats.revenue)}</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <p className="text-gray-400 text-sm">ROI</p>
            <p className="text-2xl font-bold text-blue-400">{mockData.stats.roi}%</p>
          </div>
        </div>

        {/* Funnel */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-8">
          <h2 className="text-lg font-semibold mb-4">Sales Funnel</h2>
          <div className="flex items-center justify-between gap-2 overflow-x-auto">
            <div className="flex-1 bg-blue-500/20 rounded-lg p-3 text-center min-w-[80px]">
              <p className="text-blue-400 font-bold text-lg">{mockData.funnel.leadsGesamt}</p>
              <p className="text-xs text-gray-400">Leads</p>
            </div>
            <div className="text-gray-500">→</div>
            <div className="flex-1 bg-red-500/20 rounded-lg p-3 text-center min-w-[80px]">
              <p className="text-red-400 font-bold text-lg">{mockData.funnel.terminierungVerloren}</p>
              <p className="text-xs text-gray-400">Term. Lost</p>
            </div>
            <div className="text-gray-500">→</div>
            <div className="flex-1 bg-orange-500/20 rounded-lg p-3 text-center min-w-[80px]">
              <p className="text-orange-400 font-bold text-lg">{mockData.funnel.noShow}</p>
              <p className="text-xs text-gray-400">No Show</p>
            </div>
            <div className="text-gray-500">→</div>
            <div className="flex-1 bg-green-500/20 rounded-lg p-3 text-center min-w-[80px]">
              <p className="text-green-400 font-bold text-lg">{mockData.funnel.abschluesse}</p>
              <p className="text-xs text-gray-400">Closed</p>
            </div>
          </div>
        </div>

        {/* Tables */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Sales */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-700 flex justify-between items-center">
              <h2 className="font-semibold">Recent Sales</h2>
              <button className="text-sm text-blue-400 hover:text-blue-300">+ Add Sale</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-700/50">
                  <tr>
                    <th className="px-4 py-2 text-left text-gray-400">Date</th>
                    <th className="px-4 py-2 text-left text-gray-400">Closer</th>
                    <th className="px-4 py-2 text-right text-gray-400">Amount</th>
                    <th className="px-4 py-2 text-left text-gray-400">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {mockData.sales.map((sale) => (
                    <tr key={sale.id} className="border-t border-gray-700/50">
                      <td className="px-4 py-2">{sale.date}</td>
                      <td className="px-4 py-2">{sale.closer}</td>
                      <td className="px-4 py-2 text-right text-green-400">{formatCurrency(sale.amount)}</td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-0.5 rounded text-xs ${getStatusStyle(sale.status)}`}>{sale.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Expenses */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-700 flex justify-between items-center">
              <h2 className="font-semibold">Expenses</h2>
              <button className="text-sm text-blue-400 hover:text-blue-300">+ Add Expense</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-700/50">
                  <tr>
                    <th className="px-4 py-2 text-left text-gray-400">Date</th>
                    <th className="px-4 py-2 text-left text-gray-400">Category</th>
                    <th className="px-4 py-2 text-right text-gray-400">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {mockData.expenses.map((expense) => (
                    <tr key={expense.id} className="border-t border-gray-700/50">
                      <td className="px-4 py-2">{expense.date}</td>
                      <td className="px-4 py-2">{expense.category}</td>
                      <td className="px-4 py-2 text-right text-red-400">-{formatCurrency(expense.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Closer Stats */}
        <div className="mt-6 bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-700">
            <h2 className="font-semibold">Performance by Closer</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-700/50">
                <tr>
                  <th className="px-4 py-2 text-left text-gray-400">Closer</th>
                  <th className="px-4 py-2 text-right text-gray-400">Full</th>
                  <th className="px-4 py-2 text-right text-gray-400">Installment</th>
                  <th className="px-4 py-2 text-right text-gray-400">Total</th>
                  <th className="px-4 py-2 text-right text-gray-400">Deals</th>
                </tr>
              </thead>
              <tbody>
                {mockData.closerStats.map((closer) => (
                  <tr key={closer.closer} className="border-t border-gray-700/50">
                    <td className="px-4 py-2 font-medium">{closer.closer}</td>
                    <td className="px-4 py-2 text-right text-green-400">{formatCurrency(closer.full)}</td>
                    <td className="px-4 py-2 text-right text-blue-400">{formatCurrency(closer.installment)}</td>
                    <td className="px-4 py-2 text-right font-bold">{formatCurrency(closer.total)}</td>
                    <td className="px-4 py-2 text-right">{closer.deals}</td>
                  </tr>
                ))}
                <tr className="border-t border-gray-600 bg-gray-700/30">
                  <td className="px-4 py-2 font-bold">Total</td>
                  <td className="px-4 py-2 text-right text-green-400 font-bold">{formatCurrency(8500)}</td>
                  <td className="px-4 py-2 text-right text-blue-400 font-bold">{formatCurrency(7000)}</td>
                  <td className="px-4 py-2 text-right font-bold text-xl">{formatCurrency(15500)}</td>
                  <td className="px-4 py-2 text-right font-bold">5</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Mobile Tab Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 md:hidden">
        <div className="flex justify-around py-3">
          <button className="flex flex-col items-center text-blue-400 text-xs">
            <span className="text-lg mb-1">📊</span>
            Dashboard
          </button>
          <button className="flex flex-col items-center text-gray-500 text-xs">
            <span className="text-lg mb-1">💰</span>
            Sales
          </button>
          <button className="flex flex-col items-center text-gray-500 text-xs">
            <span className="text-lg mb-1">📝</span>
            Expenses
          </button>
          <button className="flex flex-col items-center text-gray-500 text-xs">
            <span className="text-lg mb-1">👤</span>
            Profile
          </button>
        </div>
      </nav>
    </div>
  );
}
