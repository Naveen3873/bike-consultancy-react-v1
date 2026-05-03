import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../utils/api';
import { formatINR, formatDate } from '../utils/helpers';
import { StatusBadge, SkeletonCard, EmptyState } from '../components/ui/index';
import { Search, Plus, Bike, Filter, Grid, List, Gauge, Calendar } from 'lucide-react';

const STATUSES = ['all', 'Available', 'Pending', 'Sold'];

export default function Vehicles() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [vehicles, setVehicles] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');

  const status = searchParams.get('status') || 'all';
  const search = searchParams.get('search') || '';
  const page = parseInt(searchParams.get('page') || '1');

  const fetchVehicles = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 12 };
      if (status !== 'all') params.status = status;
      if (search) params.search = search;
      const { data } = await api.get('/vehicles', { params });
      setVehicles(data.data.vehicles);
      setPagination(data.data.pagination);
    } catch {}
    finally { setLoading(false); }
  }, [status, search, page]);

  useEffect(() => { fetchVehicles(); }, [fetchVehicles]);

  const setParam = (key, val) => {
    const p = new URLSearchParams(searchParams);
    if (val) p.set(key, val); else p.delete(key);
    if (key !== 'page') p.delete('page');
    setSearchParams(p);
  };

  let searchTimer;
  const handleSearch = (val) => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => setParam('search', val), 400);
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title gradient-text">Inventory</h1>
          <p className="text-dark-300 text-sm mt-1">{pagination.total || 0} vehicles total</p>
        </div>
        <Link to="/vehicles/add" className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Add Vehicle
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-300" />
          <input
            className="input-field pl-10"
            placeholder="Search by name, reg. number, model..."
            defaultValue={search}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {STATUSES.map(s => (
            <button
              key={s}
              onClick={() => setParam('status', s === 'all' ? '' : s)}
              className={`px-3 py-2 rounded-xl text-xs font-heading font-semibold tracking-wide transition-all capitalize
                ${status === s || (s === 'all' && status === 'all')
                  ? 'bg-brand-500 text-white'
                  : 'bg-dark-700 text-dark-300 hover:text-white border border-dark-600'
                }`}
            >
              {s}
            </button>
          ))}
          <div className="flex border border-dark-600 rounded-xl overflow-hidden">
            <button onClick={() => setViewMode('grid')} className={`p-2 ${viewMode === 'grid' ? 'bg-brand-500 text-white' : 'bg-dark-700 text-dark-400 hover:text-white'} transition-colors`}>
              <Grid size={15} />
            </button>
            <button onClick={() => setViewMode('list')} className={`p-2 ${viewMode === 'list' ? 'bg-brand-500 text-white' : 'bg-dark-700 text-dark-400 hover:text-white'} transition-colors`}>
              <List size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : vehicles.length === 0 ? (
        <EmptyState
          icon={<Bike />}
          title="No vehicles found"
          description={search ? 'Try a different search term' : 'Add your first vehicle to get started'}
          action={<Link to="/vehicles/add" className="btn-primary">Add Vehicle</Link>}
        />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {vehicles.map((v) => (
            <Link key={v._id} to={`/vehicles/${v._id}`}>
              <div className="card-hover overflow-hidden group cursor-pointer h-full">
                {/* Image */}
                <div className="relative h-44 bg-dark-700 overflow-hidden">
                  {v.images?.[0] ? (
                    <img src={v.images[0].image_url} alt={v.vehicle_name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Bike size={40} className="text-dark-500" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <StatusBadge status={v.status} />
                  </div>
                  <div className="absolute bottom-2 left-2 bg-dark-900/80 backdrop-blur-sm rounded-lg px-2 py-1">
                    <span className="text-white text-xs font-mono font-semibold">{v.reg_number}</span>
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="text-white font-heading font-semibold text-sm leading-tight mb-0.5 truncate">{v.vehicle_name}</h3>
                  <p className="text-dark-300 text-xs mb-3">{v.year} · {v.no_of_owners} owner</p>
                  <div className="flex items-center gap-3 text-xs text-dark-300 mb-3">
                    <span className="flex items-center gap-1"><Gauge size={12} />{v.mileage_km?.toLocaleString()} km</span>
                    <span className="flex items-center gap-1"><Calendar size={12} />{formatDate(v.purchase_date)}</span>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-dark-600">
                    <span className="text-brand-400 font-heading font-bold text-base">{formatINR(v.selling_cost)}</span>
                    <span className={`text-xs px-2 py-1 rounded-lg font-heading font-semibold
                      ${v.insurance_status === 'Active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                      {v.insurance_status}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        // List view
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-dark-600">
                <tr>
                  {['Vehicle', 'Reg. No.', 'Year', 'Mileage', 'Owners', 'Selling Price', 'Status', 'Insurance'].map(h => (
                    <th key={h} className="text-left text-xs font-heading font-semibold text-dark-300 uppercase tracking-widest py-3 px-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-700">
                {vehicles.map(v => (
                  <tr key={v._id} className="hover:bg-dark-700/50 cursor-pointer transition-colors"
                    onClick={() => window.location.href = `/vehicles/${v._id}`}>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        {v.images?.[0] ? (
                          <img src={v.images[0].image_url} className="w-9 h-9 rounded-lg object-cover" />
                        ) : (
                          <div className="w-9 h-9 rounded-lg bg-dark-600 flex items-center justify-center">
                            <Bike size={14} className="text-dark-400" />
                          </div>
                        )}
                        <div>
                          <p className="text-white text-sm font-heading font-semibold">{v.vehicle_name}</p>
                          <p className="text-dark-400 text-xs">{v.model}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-dark-200 text-sm">{v.reg_number}</td>
                    <td className="py-3 px-4 text-dark-200 text-sm">{v.year}</td>
                    <td className="py-3 px-4 text-dark-200 text-sm">{v.mileage_km?.toLocaleString()} km</td>
                    <td className="py-3 px-4 text-dark-200 text-sm">{v.no_of_owners}</td>
                    <td className="py-3 px-4 text-brand-400 font-semibold text-sm">{formatINR(v.selling_cost)}</td>
                    <td className="py-3 px-4"><StatusBadge status={v.status} /></td>
                    <td className="py-3 px-4">
                      <span className={`text-xs font-semibold ${v.insurance_status === 'Active' ? 'text-emerald-400' : 'text-red-400'}`}>
                        {v.insurance_status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {[...Array(pagination.pages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setParam('page', String(i + 1))}
              className={`w-9 h-9 rounded-xl text-sm font-heading font-semibold transition-all
                ${page === i + 1 ? 'bg-brand-500 text-white' : 'bg-dark-700 text-dark-300 hover:text-white border border-dark-600'}`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
