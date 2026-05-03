import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend, LineChart, Line
} from 'recharts';
import api from '../utils/api';
import { formatINR, formatDate, MONTHS } from '../utils/helpers';
import { PageLoader } from '../components/ui/index';
import { TrendingUp, TrendingDown, BarChart3, IndianRupee } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-dark-700 border border-dark-500 rounded-xl p-3 text-xs space-y-1">
      <p className="text-dark-200 font-heading font-semibold mb-2">{MONTHS[label - 1]}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color }}>{p.name}: {formatINR(p.value)}</p>
      ))}
    </div>
  );
};

export default function Reports() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    setLoading(true);
    api.get('/reports', { params: { year } })
      .then(r => setData(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [year]);

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  if (loading) return <PageLoader />;

  const { soldVehiclesWithProfit = [], monthlyStats = [] } = data || {};

  const totalRevenue = soldVehiclesWithProfit.reduce((s, v) => s + v.sold_price, 0);
  const totalProfit = soldVehiclesWithProfit.reduce((s, v) => s + v.profit, 0);
  const totalPurchase = soldVehiclesWithProfit.reduce((s, v) => s + (v.vehicle?.purchase_cost || 0), 0);
  const totalRepair = soldVehiclesWithProfit.reduce((s, v) => s + v.totalExpenses, 0);

  const chartData = monthlyStats.map(m => ({
    month: m._id,
    Revenue: m.revenue,
    Purchase: m.purchaseCost,
    Repair: m.repairCost,
    Profit: m.revenue - m.purchaseCost - m.repairCost,
    count: m.count,
  }));

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title gradient-text">Reports</h1>
          <p className="text-dark-300 text-sm mt-1">Profit & loss analysis</p>
        </div>
        <select
          className="input-field max-w-[110px]"
          value={year}
          onChange={e => setYear(e.target.value)}
        >
          {years.map(y => <option key={y}>{y}</option>)}
        </select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue', val: totalRevenue, icon: IndianRupee, color: 'text-brand-400', bg: 'bg-brand-500/10 border-brand-500/20' },
          { label: 'Purchase Cost', val: totalPurchase, icon: TrendingDown, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
          { label: 'Repair Cost', val: totalRepair, icon: BarChart3, color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20' },
          { label: 'Net Profit', val: totalProfit, icon: TrendingUp, color: totalProfit >= 0 ? 'text-emerald-400' : 'text-red-400', bg: totalProfit >= 0 ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-red-500/10 border-red-500/20' },
        ].map(s => (
          <div key={s.label} className={`card border p-5 ${s.bg}`}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-dark-300 text-xs font-heading font-semibold uppercase tracking-widest">{s.label}</p>
              <s.icon size={16} className={s.color} />
            </div>
            <p className={`font-display text-2xl ${s.color}`}>{formatINR(s.val)}</p>
            <p className="text-dark-400 text-xs mt-1">{soldVehiclesWithProfit.length} vehicles in {year}</p>
          </div>
        ))}
      </div>

      {/* Monthly Chart */}
      {chartData.length > 0 && (
        <div className="card p-5">
          <h3 className="section-title mb-5">Monthly Breakdown — {year}</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#242432" />
              <XAxis dataKey="month" tickFormatter={m => MONTHS[m - 1]} tick={{ fill: '#5a5a78', fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: '#5a5a78', fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '11px', color: '#8888aa', paddingTop: '12px' }} />
              <Bar dataKey="Revenue" fill="#f97316" radius={[4, 4, 0, 0]} maxBarSize={30} />
              <Bar dataKey="Purchase" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={30} />
              <Bar dataKey="Repair" fill="#f59e0b" radius={[4, 4, 0, 0]} maxBarSize={30} />
              <Bar dataKey="Profit" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={30} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Profit Line Chart */}
      {chartData.length > 0 && (
        <div className="card p-5">
          <h3 className="section-title mb-5">Profit Trend</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#242432" />
              <XAxis dataKey="month" tickFormatter={m => MONTHS[m - 1]} tick={{ fill: '#5a5a78', fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: '#5a5a78', fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="Profit" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4, fill: '#10b981' }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Per-Vehicle Profit Table */}
      <div className="card overflow-hidden">
        <div className="p-5 border-b border-dark-600">
          <h3 className="section-title">Vehicle-wise Profit — {year}</h3>
          <p className="text-dark-400 text-xs mt-1">{soldVehiclesWithProfit.length} vehicles sold</p>
        </div>
        {soldVehiclesWithProfit.length === 0 ? (
          <p className="text-dark-400 text-sm text-center py-12">No sales data for {year}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-dark-600">
                <tr>
                  {['Vehicle', 'Sold Date', 'Buyer', 'Purchase', 'Repair', 'Sold Price', 'Profit'].map(h => (
                    <th key={h} className="text-left text-xs font-heading font-semibold text-dark-300 uppercase tracking-widest py-3 px-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-700">
                {soldVehiclesWithProfit.map(s => (
                  <tr key={s._id} className="hover:bg-dark-700/30 transition-colors">
                    <td className="py-3 px-4">
                      <p className="text-white text-sm font-heading font-semibold">{s.vehicle?.vehicle_name}</p>
                      <p className="text-dark-400 text-xs font-mono">{s.vehicle?.reg_number}</p>
                    </td>
                    <td className="py-3 px-4 text-dark-200 text-sm">{formatDate(s.sold_date)}</td>
                    <td className="py-3 px-4 text-dark-200 text-sm">{s.buyer_name}</td>
                    <td className="py-3 px-4 text-blue-400 text-sm font-semibold">{formatINR(s.vehicle?.purchase_cost)}</td>
                    <td className="py-3 px-4 text-amber-400 text-sm font-semibold">{formatINR(s.totalExpenses)}</td>
                    <td className="py-3 px-4 text-brand-400 text-sm font-semibold">{formatINR(s.sold_price)}</td>
                    <td className="py-3 px-4">
                      <span className={`font-heading font-bold text-sm ${s.profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {s.profit >= 0 ? '+' : ''}{formatINR(s.profit)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t-2 border-dark-500 bg-dark-700/50">
                <tr>
                  <td className="py-3 px-4 text-white font-heading font-bold text-sm" colSpan={3}>Totals</td>
                  <td className="py-3 px-4 text-blue-400 font-bold text-sm">{formatINR(totalPurchase)}</td>
                  <td className="py-3 px-4 text-amber-400 font-bold text-sm">{formatINR(totalRepair)}</td>
                  <td className="py-3 px-4 text-brand-400 font-bold text-sm">{formatINR(totalRevenue)}</td>
                  <td className="py-3 px-4">
                    <span className={`font-display text-lg ${totalProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {totalProfit >= 0 ? '+' : ''}{formatINR(totalProfit)}
                    </span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
