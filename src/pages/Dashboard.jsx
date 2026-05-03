import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import api from '../utils/api';
import { formatINR, formatDate, MONTHS } from '../utils/helpers';
import { PageLoader, StatusBadge } from '../components/ui/index';
import { TrendingUp, Bike, ShoppingCart, CheckCircle, DollarSign, ArrowRight, AlertCircle } from 'lucide-react';

const StatCard = ({ label, value, icon: Icon, color, sub }) => (
  <div className="stat-card animate-slide-up">
    <div className="flex items-center justify-between">
      <p className="text-dark-300 text-xs font-heading font-semibold uppercase tracking-widest">{label}</p>
      <div className={`w-9 h-9 rounded-xl ${color} flex items-center justify-center`}>
        <Icon size={17} className="text-white" />
      </div>
    </div>
    <p className="font-display text-3xl text-white tracking-wide">{value}</p>
    {sub && <p className="text-dark-300 text-xs">{sub}</p>}
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-dark-700 border border-dark-500 rounded-xl p-3 text-sm">
      <p className="text-dark-200 font-heading font-semibold mb-1">{MONTHS[label - 1]}</p>
      <p className="text-brand-400 font-semibold">{formatINR(payload[0]?.value)}</p>
      <p className="text-dark-300 text-xs">{payload[0]?.payload?.count} vehicles</p>
    </div>
  );
};

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard').then(r => setData(r.data.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;
  if (!data) return null;

  const { stats, recentVehicles, recentSales, monthlyRevenue } = data;

  const chartData = monthlyRevenue.map(m => ({
    month: m._id.month, revenue: m.revenue, count: m.count
  }));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="page-title gradient-text">Dashboard</h1>
        <p className="text-dark-300 text-sm mt-1">Overview of your bike consultancy</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Inventory" value={stats.totalVehicles} icon={Bike} color="bg-brand-500" sub={`${stats.availableCount} available`} />
        <StatCard label="Vehicles Sold" value={stats.soldCount} icon={CheckCircle} color="bg-emerald-600" sub="All time" />
        <StatCard label="Total Revenue" value={formatINR(stats.totalRevenue)} icon={DollarSign} color="bg-blue-600" sub="From all sales" />
        <StatCard label="Net Profit" value={formatINR(stats.netProfit)} icon={TrendingUp}
          color={stats.netProfit >= 0 ? 'bg-emerald-600' : 'bg-red-600'}
          sub="Revenue − expenses"
        />
      </div>

      {/* Secondary stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Pending', val: stats.pendingCount, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
          { label: 'Vehicle Expenses', val: formatINR(stats.totalVehicleExpenses), color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20' },
          { label: 'Office Expenses', val: formatINR(stats.totalOfficeExpenses), color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
        ].map(s => (
          <div key={s.label} className={`card border ${s.bg} p-4 text-center`}>
            <p className="text-dark-300 text-xs font-heading font-semibold uppercase tracking-widest mb-1">{s.label}</p>
            <p className={`font-heading font-bold text-lg ${s.color}`}>{s.val}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Revenue Chart */}
        <div className="card p-5 lg:col-span-3">
          <div className="flex items-center justify-between mb-5">
            <h3 className="section-title">Monthly Revenue</h3>
            <span className="text-dark-300 text-xs font-heading">{new Date().getFullYear()}</span>
          </div>
          {chartData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-dark-400 text-sm">No sales data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#242432" />
                <XAxis dataKey="month" tick={{ fill: '#5a5a78', fontSize: 11 }} tickLine={false} axisLine={false}
                  tickFormatter={m => MONTHS[m - 1]} />
                <YAxis tick={{ fill: '#5a5a78', fontSize: 10 }} tickLine={false} axisLine={false}
                  tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="revenue" stroke="#f97316" strokeWidth={2} fill="url(#rev)" dot={false} activeDot={{ r: 4, fill: '#f97316' }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Recent Sales */}
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title">Recent Sales</h3>
            <Link to="/vehicles?status=Sold" className="text-brand-400 text-xs hover:text-brand-300 flex items-center gap-1">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          {recentSales.length === 0 ? (
            <p className="text-dark-400 text-sm text-center py-8">No sales yet</p>
          ) : (
            <div className="space-y-3">
              {recentSales.map(sale => (
                <div key={sale._id} className="flex items-center gap-3 p-3 rounded-xl bg-dark-700 hover:bg-dark-600 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                    <CheckCircle size={14} className="text-emerald-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-xs font-heading font-semibold truncate">
                      {sale.vehicle_id?.vehicle_name}
                    </p>
                    <p className="text-dark-300 text-xs">{sale.buyer_name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-brand-400 text-xs font-semibold">{formatINR(sale.sold_price)}</p>
                    <p className="text-dark-400 text-xs">{formatDate(sale.sold_date)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Vehicles */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="section-title">Recent Inventory</h3>
          <Link to="/vehicles" className="text-brand-400 text-xs hover:text-brand-300 flex items-center gap-1">
            View all <ArrowRight size={12} />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-600">
                {['Vehicle', 'Reg. No.', 'Year', 'Mileage', 'Selling Price', 'Status', ''].map(h => (
                  <th key={h} className="text-left text-xs font-heading font-semibold text-dark-300 uppercase tracking-widest pb-3 pr-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-700">
              {recentVehicles.map(v => (
                <tr key={v._id} className="hover:bg-dark-800/50 transition-colors">
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-3">
                      {v.images?.[0] ? (
                        <img src={v.images[0].image_url} alt="" className="w-10 h-10 rounded-lg object-cover bg-dark-600" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-dark-600 flex items-center justify-center">
                          <Bike size={16} className="text-dark-400" />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-white text-sm font-heading font-semibold">{v.vehicle_name}</p>
                      <p className="text-white text-dark-400 text-xs">{v.model}</p>
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-dark-200 text-sm font-mono">{v.reg_number}</td>
                  <td className="py-3 pr-4 text-dark-200 text-sm">{v.year}</td>
                  <td className="py-3 pr-4 text-dark-200 text-sm">{v.mileage_km?.toLocaleString()} km</td>
                  <td className="py-3 pr-4 text-brand-400 text-sm font-semibold">{formatINR(v.selling_cost)}</td>
                  <td className="py-3 pr-4"><StatusBadge status={v.status} /></td>
                  <td className="py-3">
                    <Link to={`/vehicles/${v._id}`} className="text-brand-400 hover:text-brand-300 text-xs flex items-center gap-1 font-heading">
                      View <ArrowRight size={12} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
