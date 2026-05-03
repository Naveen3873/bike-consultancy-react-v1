import { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { formatINR, formatDate } from '../utils/helpers';
import { PageLoader, Modal, ConfirmDialog, EmptyState } from '../components/ui/index';
import { Plus, Trash2, Receipt, DollarSign } from 'lucide-react';

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [total, setTotal] = useState(0);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState({ month: '', year: '' });

  const [form, setForm] = useState({
    description: '', category_id: '', amount: '',
    expense_date: new Date().toISOString().split('T')[0], receipt: null,
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page };
      if (filter.month) params.month = filter.month;
      if (filter.year) params.year = filter.year;
      const { data } = await api.get('/expenses/office', { params });
      setExpenses(data.data.expenses);
      setTotal(data.data.totalAmount);
      setPagination(data.data.pagination);
    } catch {}
    finally { setLoading(false); }
  }, [page, filter]);

  useEffect(() => {
    api.get('/expenses/categories').then(r => setCategories(r.data.data.categories));
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (k !== 'receipt' && v) fd.append(k, v); });
      if (form.receipt) fd.append('receipt', form.receipt);
      await api.post('/expenses/office', fd);
      toast.success('Expense recorded!');
      setModal(false);
      setForm({ description: '', category_id: '', amount: '', expense_date: new Date().toISOString().split('T')[0], receipt: null });
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/expenses/office/${id}`);
      toast.success('Deleted');
      load();
    } catch { toast.error('Failed to delete'); }
  };

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: k === 'receipt' ? e.target.files[0] : e.target.value }));

  const MONTHS_OPTS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title gradient-text">Office Expenses</h1>
          <p className="text-dark-300 text-sm mt-1">Track all business running costs</p>
        </div>
        <button onClick={() => setModal(true)} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Add Expense
        </button>
      </div>

      {/* Total Banner */}
      <div className="card p-5 flex items-center gap-4 border-brand-500/20 bg-brand-500/5">
        <div className="w-12 h-12 rounded-2xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center">
          <DollarSign size={22} className="text-brand-400" />
        </div>
        <div>
          <p className="text-dark-300 text-xs font-heading uppercase tracking-widest">Total Expenses {filter.month ? `(${MONTHS_OPTS[filter.month - 1]} ${filter.year})` : '(Filtered)'}</p>
          <p className="font-display text-3xl text-brand-400">{formatINR(total)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <select className="input-field max-w-[140px]" value={filter.month} onChange={e => setFilter(p => ({ ...p, month: e.target.value }))}>
          <option value="">All Months</option>
          {MONTHS_OPTS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
        </select>
        <select className="input-field max-w-[120px]" value={filter.year} onChange={e => setFilter(p => ({ ...p, year: e.target.value }))}>
          <option value="">All Years</option>
          {years.map(y => <option key={y}>{y}</option>)}
        </select>
        {(filter.month || filter.year) && (
          <button onClick={() => setFilter({ month: '', year: '' })} className="btn-secondary">Clear</button>
        )}
      </div>

      {/* Table */}
      {loading ? <PageLoader /> : expenses.length === 0 ? (
        <EmptyState icon={<Receipt />} title="No expenses" description="Start tracking office expenses" action={<button onClick={() => setModal(true)} className="btn-primary">Add Expense</button>} />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-dark-600">
                <tr>
                  {['Description', 'Category', 'Amount', 'Date', 'Added By', ''].map(h => (
                    <th key={h} className="text-left text-xs font-heading font-semibold text-dark-300 uppercase tracking-widest py-3 px-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-700">
                {expenses.map(e => (
                  <tr key={e._id} className="hover:bg-dark-700/50 transition-colors">
                    <td className="py-3 px-4">
                      <p className="text-white text-sm font-heading font-semibold">{e.description}</p>
                      {e.receipt_url && (
                        <a href={e.receipt_url} target="_blank" className="text-brand-400 text-xs hover:underline flex items-center gap-1 mt-0.5">
                          <Receipt size={10} /> View Receipt
                        </a>
                      )}
                    </td>
                    <td className="py-3 px-4 text-dark-200 text-sm">{e.category_id?.name || '—'}</td>
                    <td className="py-3 px-4 text-brand-400 font-heading font-bold text-sm">{formatINR(e.amount)}</td>
                    <td className="py-3 px-4 text-dark-200 text-sm">{formatDate(e.expense_date)}</td>
                    <td className="py-3 px-4 text-dark-200 text-sm">{e.added_by?.full_name || e.added_by?.username}</td>
                    <td className="py-3 px-4">
                      <button onClick={() => setDeleteId(e._id)}
                        className="p-1.5 rounded-lg text-dark-400 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                        <Trash2 size={14} />
                      </button>
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
            <button key={i} onClick={() => setPage(i + 1)}
              className={`w-9 h-9 rounded-xl text-sm font-heading font-semibold transition-all ${page === i + 1 ? 'bg-brand-500 text-white' : 'bg-dark-700 text-dark-300 border border-dark-600'}`}>
              {i + 1}
            </button>
          ))}
        </div>
      )}

      {/* Add Modal */}
      <Modal open={modal} onClose={() => setModal(false)} title="Add Office Expense">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Description *</label>
            <input className="input-field" placeholder="e.g. Monthly rent" required value={form.description} onChange={set('description')} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Category *</label>
              <select className="input-field" required value={form.category_id} onChange={set('category_id')}>
                <option value="">Select category</option>
                {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Amount (₹) *</label>
              <input type="number" className="input-field" placeholder="5000" min="0" required value={form.amount} onChange={set('amount')} />
            </div>
            <div className="col-span-2">
              <label className="label">Date *</label>
              <input type="date" className="input-field" required value={form.expense_date} onChange={set('expense_date')} />
            </div>
            <div className="col-span-2">
              <label className="label">Receipt (optional)</label>
              <input type="file" className="input-field text-sm" accept="image/*" onChange={set('receipt')} />
            </div>
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={() => setModal(false)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
              {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Save Expense'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteId} onClose={() => setDeleteId(null)}
        onConfirm={() => handleDelete(deleteId)}
        title="Delete Expense" message="Are you sure you want to delete this expense?" danger
      />
    </div>
  );
}
