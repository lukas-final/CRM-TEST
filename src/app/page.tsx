'use client';
import { useState, useMemo } from 'react';

// Mock Data - wird später durch Datenbank ersetzt
const mockSales = [
  { id: 1, date: '2025-01-20', closer: 'Alex', amount: 5000, type: 'Full', status: 'Closed' },
  { id: 2, date: '2025-01-19', closer: 'Niklas', amount: 3000, type: 'Installment', status: 'Closed' },
  { id: 3, date: '2025-01-18', closer: 'Alex', amount: 2000, type: 'Full', status: 'No Show' },
  { id: 4, date: '2025-02-17', closer: 'Niklas', amount: 4000, type: 'Installment', status: 'Closed' },
  { id: 5, date: '2025-02-16', closer: 'Alex', amount: 1500, type: 'Full', status: 'Term Lost' },
  { id: 6, date: '2025-02-15', closer: 'Alex', amount: 6000, type: 'Full', status: 'Closed' },
  { id: 7, date: '2025-02-14', closer: 'Niklas', amount: 2500, type: 'Installment', status: 'Closed' },
  { id: 8, date: '2025-02-10', closer: 'Alex', amount: 3500, type: 'Full', status: 'Closed' },
  { id: 9, date: '2025-03-05', closer: 'Niklas', amount: 4500, type: 'Installment', status: 'Closed' },
  { id: 10, date: '2025-03-01', closer: 'Alex', amount: 7000, type: 'Full', status: 'Closed' },
];

const mockExpenses = [
  { id: 1, date: '2025-01-15', category: 'Ads', amount: 500 },
  { id: 2, date: '2025-01-10', category: 'Software', amount: 200 },
  { id: 3, date: '2025-02-15', category: 'Ads', amount: 800 },
  { id: 4, date: '2025-02-10', category: 'Software', amount: 200 },
  { id: 5, date: '2025-03-05', category: 'Ads', amount: 600 },
];

const months = [
  { value: 'all', label: 'Gesamt' },
  { value: '2025-03', label: 'März 2025' },
  { value: '2025-02', label: 'Februar 2025' },
  { value: '2025-01', label: 'Januar 2025' },
];

function getMonth(dateStr: string) {
  return dateStr.substring(0, 7); // "2025-02"
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(amount);
}

function getStatusStyle(status: string) {
  if (status === 'Closed') return 'bg-green-500/20 text-green-400';
  if (status === 'No Show') return 'bg-orange-500/20 text-orange-400';
  return 'bg-red-500/20 text-red-400';
}

export default function CRM() {
  const [selectedMonth, setSelectedMonth] = useState('all');

  // Filter data based on selected month
  const filteredSales = useMemo(() => {
    if (selectedMonth === 'all') return mockSales;
    return mockSales.filter(sale => getMonth(sale.date) === selectedMonth);
  }, [selectedMonth]);

  const filteredExpenses = useMemo(() => {
    if (selectedMonth === 'all') return mockExpenses;
    return mockExpenses.filter(expense => getMonth(expense.date) === selectedMonth);
  }, [selectedMonth]);

  // Auto-calculate stats
  const stats = useMemo(() => {
    const closedSales = filteredSales.filter(s => s.status === 'Closed');
    const totalRevenue = closedSales.reduce((sum, s) => sum + s.amount, 0);
    const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
    const roi = totalExpenses > 0 ? Math.round(((totalRevenue - totalExpenses) / totalExpenses) * 100) : 0;
    
    return {
      totalLeads: filteredSales.length,
      deals: closedSales.length,
      revenue: totalRevenue,
      expenses: totalExpenses,
      roi,
      profit: totalRevenue - totalExpenses
    };
  }, [filteredSales, filteredExpenses]);

  // Funnel stats
  const funnel = useMemo(() => ({
    leadsGesamt: filteredSales.length,
    terminierungVerloren: filteredSales.filter(s => s.status === 'Term Lost').length,
    noShow: filteredSales.filter(s => s.status === 'No Show').length,
    abschluesse: filteredSales.filter(s => s.status === 'Closed').length,
  }), [filteredSales]);

  // Closer performance
  const closerStats = useMemo(() => {
    const closers: Record<string, { full: number; installment: number; total: number; deals: number }> = {};
    
    filteredSales.filter(s => s.status === 'Closed').forEach(sale => {
      if (!closers[sale.closer]) {
        closers[sale.closer] = { full: 0, installment: 0, total: 0, deals: 0 };
      }
      if (sale.type === 'Full') {
        closers[sale.closer].full += sale.amount;
      } else {
        closers[sale.closer].installment += sale.amount;
      }
      closers[sale.closer].total += sale.amount;
      closers[sale.closer].deals += 1;
    });

    return Object.entries(closers).map(([closer, data]) => ({
      closer,
      ...data,
      roi: Math.round(((data.total - 500) / 500) * 100) // Simplified ROI per closer
    }));
  }, [filteredSales]);

  return (
    <div className="min-h-screen bg-gray-900 text-white pb-20 md:pb-0">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <h1 className="text-2xl font-bold text-blue-400">Sales CRM</h1>
            <div className="flex items-center gap-4">
              {/* Month Selector */}
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-400"
              >
                {months.map(month => (
                  <option key={month.value} value={month.value}>{month.label}</option>
                ))}
              </select>
              <div className="flex gap-4 text-sm">
                <span className="px-3 py-1 bg-gray-700 rounded-full">Admin</span>
                <span className="text-gray-400">Lukas</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <p className="text-gray-400 text-sm">Total Leads</p>
            <p className="text-2xl font-bold">{stats.totalLeads}</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <p className="text-gray-400 text-sm">Deals</p>
            <p className="text-2xl font-bold text-green-400">{stats.deals}</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <p className="text-gray-400 text-sm">Revenue</p>
            <p className="text-2xl font-bold text-green-400">{formatCurrency(stats.revenue)}</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <p className="text-gray-400 text-sm">Profit</p>
            <p className="text-2xl font-bold text-blue-400">{formatCurrency(stats.profit)}</p>
          </div>
        </div>

        {/* ROI & Expenses */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 rounded-xl p-4 border border-blue-500/30">
            <p className="text-blue-400 text-sm">ROI</p>
            <p className="text-3xl font-bold text-blue-400">{stats.roi}%</p>
          </div>
          <div className="bg-gradient-to-br from-red-500/20 to-red-600/10 rounded-xl p-4 border border-red-500/30">
            <p className="text-red-400 text-sm">Expenses</p>
            <p className="text-3xl font-bold text-red-400">{formatCurrency(stats.expenses)}</p>
          </div>
        </div>

        {/* Funnel */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-8">
          <h2 className="text-lg font-semibold mb-4">Sales Funnel</h2>
          <div className="flex items-center justify-between gap-2 overflow-x-auto">
            <div className="flex-1 bg-blue-500/20 rounded-lg p-3 text-center min-w-[80px]">
              <p className="text-blue-400 font-bold text-lg">{funnel.leadsGesamt}</p>
              <p className="text-xs text-gray-400">Leads</p>
            </div>
            <div className="text-gray-500 hidden md:block">→</div>
            <div className="flex-1 bg-red-500/20 rounded-lg p-3 text-center min-w-[80px]">
              <p className="text-red-400 font-bold text-lg">{funnel.terminierungVerloren}</p>
              <p className="text-xs text-gray-400">Term. Lost</p>
            </div>
            <div className="text-gray-500 hidden md:block">→</div>
            <div className="flex-1 bg-orange-500/20 rounded-lg p-3 text-center min-w-[80px]">
              <p className="text-orange-400 font-bold text-lg">{funnel.noShow}</p>
              <p className="text-xs text-gray-400">No Show</p>
            </div>
            <div className="text-gray-500 hidden md:block">→</div>
            <div className="flex-1 bg-green-500/20 rounded-lg p-3 text-center min-w-[80px]">
              <p className="text-green-400 font-bold text-lg">{funnel.abschluesse}</p>
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
                  {filteredSales.map((sale) => (
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
                  {filteredExpenses.map((expense) => (
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
          <div className="p-4 border-b border-gray-700 flex justify-between items-center">
            <h2 className="font-semibold">Performance by Closer</h2>
            <button className="text-sm text-blue-400 hover:text-blue-300">+ Add Closer</button>
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
                  <th className="px-4 py-2 text-right text-gray-400">ROI</th>
                </tr>
              </thead>
              <tbody>
                {closerStats.map((closer) => (
                  <tr key={closer.closer} className="border-t border-gray-700/50">
                    <td className="px-4 py-2 font-medium">{closer.closer}</td>
                    <td className="px-4 py-2 text-right text-green-400">{formatCurrency(closer.full)}</td>
                    <td className="px-4 py-2 text-right text-blue-400">{formatCurrency(closer.installment)}</td>
                    <td className="px-4 py-2 text-right font-bold">{formatCurrency(closer.total)}</td>
                    <td className="px-4 py-2 text-right">{closer.deals}</td>
                    <td className="px-4 py-2 text-right text-blue-400">{closer.roi}%</td>
                  </tr>
                ))}
                <tr className="border-t border-gray-600 bg-gray-700/30">
                  <td className="px-4 py-2 font-bold">Total</td>
                  <td className="px-4 py-2 text-right text-green-400 font-bold">{formatCurrency(closerStats.reduce((s, c) => s + c.full, 0))}</td>
                  <td className="px-4 py-2 text-right text-blue-400 font-bold">{formatCurrency(closerStats.reduce((s, c) => s + c.installment, 0))}</td>
                  <td className="px-4 py-2 text-right font-bold text-xl">{formatCurrency(closerStats.reduce((s, c) => s + c.total, 0))}</td>
                  <td className="px-4 py-2 text-right font-bold">{closerStats.reduce((s, c) => s + c.deals, 0)}</td>
                  <td className="px-4 py-2 text-right text-blue-400 font-bold">{stats.roi}%</td>
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
