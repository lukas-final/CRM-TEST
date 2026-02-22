'use client';
import { useState, useEffect, useMemo } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface Sale {
  id: string;
  date: string;
  amount: number;
  paymentType: string;
  installmentMonths?: number;
  monthlyAmount?: number;
  stage: string;
  closerName: string;
}

interface Expense {
  id: string;
  description: string;
  amount: number;
  date: string;
  closerName?: string;
}

const months = [
  { value: 'all', label: 'Gesamt' },
  { value: new Date().toISOString().slice(0, 7), label: 'Dieser Monat' },
];

function getMonth(dateStr: string) {
  return dateStr.split('T')[0].slice(0, 7);
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(amount);
}

function getStatusStyle(stage: string) {
  const styles: Record<string, string> = {
    'ABSCHLUESSE': 'bg-green-500/20 text-green-400',
    'NO_SHOW': 'bg-orange-500/20 text-orange-400',
    'TERMINIERUNG_VERLOREN': 'bg-red-500/20 text-red-400',
    'LEADS': 'bg-blue-500/20 text-blue-400',
  };
  return styles[stage] || 'bg-gray-500/20 text-gray-400';
}

function getStatusLabel(stage: string) {
  const labels: Record<string, string> = {
    'ABSCHLUESSE': 'Abgeschlossen',
    'NO_SHOW': 'No Show',
    'TERMINIERUNG_VERLOREN': 'Term. verloren',
    'LEADS': 'Lead',
  };
  return labels[stage] || stage;
}

export default function CRM() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [sales, setSales] = useState<Sale[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [showAddSale, setShowAddSale] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [newSale, setNewSale] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: '',
    paymentType: 'FULL',
    installmentMonths: '',
    monthlyAmount: '',
    stage: 'ABSCHLUESSE',
  });
  const [newExpense, setNewExpense] = useState({
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      fetchData();
    }
  }, [status, router]);

  async function fetchData() {
    const [salesRes, expensesRes] = await Promise.all([
      fetch('/api/sales'),
      fetch('/api/expenses')
    ]);
    if (salesRes.ok) setSales(await salesRes.json());
    if (expensesRes.ok) setExpenses(await expensesRes.json());
  }

  async function handleAddSale(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch('/api/sales', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...newSale,
        amount: parseFloat(newSale.amount),
        installmentMonths: newSale.paymentType === 'INSTALLMENT' ? parseInt(newSale.installmentMonths) : null,
        monthlyAmount: newSale.paymentType === 'INSTALLMENT' ? parseFloat(newSale.monthlyAmount) : null,
      })
    });
    if (res.ok) {
      setShowAddSale(false);
      fetchData();
      setNewSale({ date: new Date().toISOString().split('T')[0], amount: '', paymentType: 'FULL', installmentMonths: '', monthlyAmount: '', stage: 'ABSCHLUESSE' });
    }
  }

  async function handleAddExpense(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch('/api/expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...newExpense,
        amount: parseFloat(newExpense.amount)
      })
    });
    if (res.ok) {
      setShowAddExpense(false);
      fetchData();
      setNewExpense({ description: '', amount: '', date: new Date().toISOString().split('T')[0] });
    }
  }

  const filteredSales = useMemo(() => {
    if (selectedMonth === 'all') return sales;
    return sales.filter(s => getMonth(s.date) === selectedMonth);
  }, [sales, selectedMonth]);

  const filteredExpenses = useMemo(() => {
    if (selectedMonth === 'all') return expenses;
    return expenses.filter(e => getMonth(e.date) === selectedMonth);
  }, [expenses, selectedMonth]);

  const stats = useMemo(() => {
    const closedSales = filteredSales.filter(s => s.stage === 'ABSCHLUESSE');
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

  const funnel = useMemo(() => ({
    leadsGesamt: filteredSales.length,
    terminierungVerloren: filteredSales.filter(s => s.stage === 'TERMINIERUNG_VERLOREN').length,
    noShow: filteredSales.filter(s => s.stage === 'NO_SHOW').length,
    abschluesse: filteredSales.filter(s => s.stage === 'ABSCHLUESSE').length,
  }), [filteredSales]);

  const closerStats = useMemo(() => {
    const closers: Record<string, { full: number; installment: number; total: number; deals: number }> = {};
    filteredSales.filter(s => s.stage === 'ABSCHLUESSE').forEach(sale => {
      if (!closers[sale.closerName]) {
        closers[sale.closerName] = { full: 0, installment: 0, total: 0, deals: 0 };
      }
      if (sale.paymentType === 'FULL') {
        closers[sale.closerName].full += sale.amount;
      } else {
        closers[sale.closerName].installment += sale.amount;
      }
      closers[sale.closerName].total += sale.amount;
      closers[sale.closerName].deals += 1;
    });
    return Object.entries(closers).map(([closer, data]) => ({
      closer,
      ...data,
      roi: Math.round(((data.total - 500) / 500) * 100)
    }));
  }, [filteredSales]);

  if (status === 'loading') return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">Loading...</div>;
  if (!session) return null;

  return (
    <div className="min-h-screen bg-gray-900 text-white pb-20 md:pb-0">
      <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <h1 className="text-2xl font-bold text-blue-400">Sales CRM</h1>
            <div className="flex items-center gap-4 flex-wrap">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-400"
              >
                {months.map(month => (
                  <option key={month.value} value={month.value}>{month.label}</option>
                ))}
              </select>
              <span className="px-3 py-1 bg-gray-700 rounded-full text-sm">
                {(session.user as any).role === 'ADMIN' ? 'Admin' : 'Closer'}
              </span>
              <span className="text-gray-400 text-sm">{(session.user as any).name}</span>
              <button onClick={() => signOut({ callbackUrl: '/login' })} className="text-sm text-red-400 hover:text-red-300">Logout</button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
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

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-700 flex justify-between items-center">
              <h2 className="font-semibold">Recent Sales</h2>
              {(session.user as any).role === 'ADMIN' && (
                <button onClick={() => setShowAddSale(true)} className="text-sm text-blue-400 hover:text-blue-300">+ Add Sale</button>
              )}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-700/50">
                  <tr>
                    <th className="px-4 py-2 text-left text-gray-400">Date</th>
                    <th className="px-4 py-2 text-left text-gray-400">Closer</th>
                    <th className="px-4 py-2 text-right text-gray-400">Amount</th>
                    <th className="px-4 py-2 text-left text-gray-400">Type</th>
                    <th className="px-4 py-2 text-left text-gray-400">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSales.map((sale) => (
                    <tr key={sale.id} className="border-t border-gray-700/50">
                      <td className="px-4 py-2">{sale.date.split('T')[0]}</td>
                      <td className="px-4 py-2">{sale.closerName}</td>
                      <td className="px-4 py-2 text-right text-green-400">{formatCurrency(sale.amount)}</td>
                      <td className="px-4 py-2 text-xs">
                        {sale.paymentType === 'FULL' ? 'Voll' : `${formatCurrency(sale.monthlyAmount || 0)}/${sale.installmentMonths} Monate`}
                      </td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-0.5 rounded text-xs ${getStatusStyle(sale.stage)}`}>{getStatusLabel(sale.stage)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-700 flex justify-between items-center">
              <h2 className="font-semibold">Expenses</h2>
              {(session.user as any).role === 'ADMIN' && (
                <button onClick={() => setShowAddExpense(true)} className="text-sm text-blue-400 hover:text-blue-300">+ Add Expense</button>
              )}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-700/50">
                  <tr>
                    <th className="px-4 py-2 text-left text-gray-400">Date</th>
                    <th className="px-4 py-2 text-left text-gray-400">Description</th>
                    <th className="px-4 py-2 text-right text-gray-400">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredExpenses.map((expense) => (
                    <tr key={expense.id} className="border-t border-gray-700/50">
                      <td className="px-4 py-2">{expense.date.split('T')[0]}</td>
                      <td className="px-4 py-2">{expense.description}</td>
                      <td className="px-4 py-2 text-right text-red-400">-{formatCurrency(expense.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

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
                  <th className="px-4 py-2 text-right text-gray-400">Raten</th>
                  <th className="px-4 py-2 text-right text-gray-400">Total</th>
                  <th className="px-4 py-2 text-right text-gray-400">Deals</th>
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Add Sale Modal */}
      {showAddSale && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add Sale</h2>
            <form onSubmit={handleAddSale} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Amount (€)</label>
                <input type="number" step="0.01" value={newSale.amount} onChange={(e) => setNewSale({...newSale, amount: e.target.value})} className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2" required />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Payment Type</label>
                <select value={newSale.paymentType} onChange={(e) => setNewSale({...newSale, paymentType: e.target.value})} className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2">
                  <option value="FULL">Full Payment</option>
                  <option value="INSTALLMENT">Installment</option>
                </select>
              </div>
              {newSale.paymentType === 'INSTALLMENT' && (
                <>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Monthly Rate (€)</label>
                    <input type="number" step="0.01" value={newSale.monthlyAmount} onChange={(e) => setNewSale({...newSale, monthlyAmount: e.target.value})} className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Months</label>
                    <input type="number" value={newSale.installmentMonths} onChange={(e) => setNewSale({...newSale, installmentMonths: e.target.value})} className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2" />
                  </div>
                </>
              )}
              <div>
                <label className="block text-sm text-gray-400 mb-1">Stage</label>
                <select value={newSale.stage} onChange={(e) => setNewSale({...newSale, stage: e.target.value})} className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2">
                  <option value="ABSCHLUESSE">Abgeschlossen</option>
                  <option value="NO_SHOW">No Show</option>
                  <option value="TERMINIERUNG_VERLOREN">Termin verloren</option>
                  <option value="LEADS">Lead</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button type="submit" className="flex-1 bg-blue-500 hover:bg-blue-600 py-2 rounded-lg">Save</button>
                <button type="button" onClick={() => setShowAddSale(false)} className="flex-1 bg-gray-700 hover:bg-gray-600 py-2 rounded-lg">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Expense Modal */}
      {showAddExpense && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add Expense</h2>
            <form onSubmit={handleAddExpense} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Description</label>
                <input type="text" value={newExpense.description} onChange={(e) => setNewExpense({...newExpense, description: e.target.value})} className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2" required />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Amount (€)</label>
                <input type="number" step="0.01" value={newExpense.amount} onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})} className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2" required />
              </div>
              <div className="flex gap-2">
                <button type="submit" className="flex-1 bg-blue-500 hover:bg-blue-600 py-2 rounded-lg">Save</button>
                <button type="button" onClick={() => setShowAddExpense(false)} className="flex-1 bg-gray-700 hover:bg-gray-600 py-2 rounded-lg">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <nav className="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 md:hidden">
        <div className="flex justify-around py-3">
          <button className="flex flex-col items-center text-blue-400 text-xs">
            <span className="text-lg mb-1">📊</span>
            Dashboard
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
