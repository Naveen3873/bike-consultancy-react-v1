import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { formatINR, formatDate } from '../utils/helpers';
import { PageLoader, StatusBadge, Modal, ConfirmDialog } from '../components/ui/index';
import { ArrowLeft, Edit, Trash2, IndianRupee, Plus, Image, CheckCircle, Gauge, Calendar, User, MapPin, FileText, AlertTriangle, ShieldCheck, Wrench } from 'lucide-react';

const Detail = ({ label, value, className = '' }) => (
  <div>
    <p className="text-dark-400 text-xs font-heading font-semibold uppercase tracking-widest mb-0.5">{label}</p>
    <p className={`text-white text-sm font-body ${className}`}>{value || '—'}</p>
  </div>
);

export default function VehicleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [sellModal, setSellModal] = useState(false);
  const [expenseModal, setExpenseModal] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [sellForm, setSellForm] = useState({ buyer_name: '', buyer_phone: '', buyer_address: '', sold_price: '', payment_mode: 'Cash', sold_date: new Date().toISOString().split('T')[0], notes: '' });
  const [expForm, setExpForm] = useState({ description: '', category: '', amount: '', expense_date: new Date().toISOString().split('T')[0] });
  const [saving, setSaving] = useState(false);

  const fetch = async () => {
    setLoading(true);
    try {
      const { data: d } = await api.get(`/vehicles/${id}`);
      setData(d.data);
    } catch { toast.error('Vehicle not found'); navigate('/vehicles'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, [id]);

  const handleSell = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post(`/vehicles/${id}/sell`, sellForm);
      toast.success('Vehicle marked as sold!');
      setSellModal(false);
      fetch();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleExpense = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post(`/vehicles/${id}/expenses`, expForm);
      toast.success('Expense added!');
      setExpenseModal(false);
      setExpForm({ description: '', category: '', amount: '', expense_date: new Date().toISOString().split('T')[0] });
      fetch();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/vehicles/${id}`);
      toast.success('Vehicle deleted');
      navigate('/vehicles');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  if (loading) return <PageLoader />;
  if (!data) return null;

  const { vehicle: v, soldInfo, totalExpenses } = data;
  const images = v.images || [];
  const expenses = v.expenses || [];
  const profit = soldInfo ? soldInfo.sold_price - (v.purchase_cost || 0) - totalExpenses : null;

  return (
    <div className="max-w-5xl mx-auto animate-fade-in space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="btn-ghost p-2 rounded-xl flex-shrink-0">
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-display text-3xl text-white tracking-wide">{v.vehicle_name}</h1>
              <StatusBadge status={v.status} />
            </div>
            <p className="text-dark-300 text-sm font-mono mt-0.5">{v.reg_number} · {v.year} · {v.model}</p>
          </div>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          {v.status !== 'Sold' && (
            <>
              <button onClick={() => setSellModal(true)} className="btn-primary flex items-center gap-2 text-sm">
                <CheckCircle size={15} /> Mark Sold
              </button>
              <Link to={`/vehicles/${id}/edit`} className="btn-secondary flex items-center gap-2 text-sm">
                <Edit size={15} /> Edit
              </Link>
            </>
          )}
          <button onClick={() => setDeleteDialog(true)} className="p-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-colors">
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-5">
        {/* Images */}
        <div className="lg:col-span-2 space-y-3">
          <div className="card overflow-hidden aspect-[4/3] bg-dark-700">
            {images.length > 0 ? (
              <img src={images[activeImage]?.image_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Image size={48} className="text-dark-500" />
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((img, i) => (
                <button key={img._id} onClick={() => setActiveImage(i)}
                  className={`w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-colors ${i === activeImage ? 'border-brand-500' : 'border-dark-600'}`}>
                  <img src={img.image_url} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Price Card */}
          <div className="card p-4 glow-orange border-brand-500/15">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-dark-400 text-xs font-heading uppercase tracking-widest mb-1">Selling Price</p>
                <p className="text-brand-400 font-display text-2xl">{formatINR(v.selling_cost)}</p>
              </div>
              <div>
                <p className="text-dark-400 text-xs font-heading uppercase tracking-widest mb-1">Purchase Cost</p>
                <p className="text-white font-heading font-bold text-lg">{formatINR(v.purchase_cost)}</p>
              </div>
              <div>
                <p className="text-dark-400 text-xs font-heading uppercase tracking-widest mb-1">Repair Cost</p>
                <p className="text-orange-400 font-heading font-bold text-lg">{formatINR(totalExpenses)}</p>
              </div>
              {soldInfo && (
                <div>
                  <p className="text-dark-400 text-xs font-heading uppercase tracking-widest mb-1">Net Profit</p>
                  <p className={`font-heading font-bold text-lg ${profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{formatINR(profit)}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="lg:col-span-3 space-y-4">
          {/* Vehicle Info */}
          <div className="card p-5">
            <h3 className="section-title mb-4 pb-3 border-b border-dark-600">Vehicle Details</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <Detail label="Mileage" value={`${v.mileage_km?.toLocaleString()} km`} />
              <Detail label="Owners" value={v.no_of_owners} />
              <Detail label="Insurance" value={v.insurance_status} className={v.insurance_status === 'Active' ? 'text-emerald-400' : 'text-red-400'} />
              <Detail label="Hypothetication" value={v.hypothetication ? 'Yes (Loan)' : 'No'} />
              <Detail label="RTO Status" value={v.rto_status} />
              <Detail label="Purchase Date" value={formatDate(v.purchase_date)} />
              <Detail label="Purchase From" value={v.purchase_from} />
              {v.insurance_expiry_date && <Detail label="Insurance Expiry" value={formatDate(v.insurance_expiry_date)} />}
            </div>
          </div>

          {/* RC Details */}
          <div className="card p-5">
            <h3 className="section-title mb-4 pb-3 border-b border-dark-600">RC Book</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Detail label="RC Owner" value={v.rc_owner_name} />
              <Detail label="RC Address" value={v.rc_owner_address} />
            </div>
          </div>

          {v.fine_details && (
            <div className="card p-5 border-amber-500/20 bg-amber-500/5">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle size={15} className="text-amber-400" />
                <h3 className="font-heading font-semibold text-amber-400 text-sm">Fine Details</h3>
              </div>
              <p className="text-dark-200 text-sm">{v.fine_details}</p>
            </div>
          )}
          {v.remark && (
            <div className="card p-5">
              <h3 className="font-heading font-semibold text-dark-200 text-sm mb-2 flex items-center gap-2"><FileText size={14} />Remarks</h3>
              <p className="text-dark-200 text-sm">{v.remark}</p>
            </div>
          )}

          {/* Sold Info */}
          {soldInfo && (
            <div className="card p-5 border-emerald-500/20 bg-emerald-500/5">
              <h3 className="section-title text-emerald-400 mb-4 pb-3 border-b border-emerald-500/20">Sale Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <Detail label="Buyer" value={soldInfo.buyer_name} />
                <Detail label="Phone" value={soldInfo.buyer_phone} />
                <Detail label="Sold Price" value={formatINR(soldInfo.sold_price)} className="text-emerald-400" />
                <Detail label="Payment" value={soldInfo.payment_mode} />
                <Detail label="Sold Date" value={formatDate(soldInfo.sold_date)} />
                <Detail label="Sold By" value={soldInfo.sold_by?.full_name} />
                {soldInfo.buyer_address && <Detail label="Address" value={soldInfo.buyer_address} />}
                {soldInfo.notes && <Detail label="Notes" value={soldInfo.notes} />}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Expenses */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="section-title">Vehicle Expenses</h3>
            <p className="text-dark-400 text-xs mt-0.5">Total: <span className="text-orange-400 font-semibold">{formatINR(totalExpenses)}</span></p>
          </div>
          {v.status !== 'Sold' && (
            <button onClick={() => setExpenseModal(true)} className="btn-secondary flex items-center gap-2 text-sm">
              <Plus size={14} /> Add Expense
            </button>
          )}
        </div>
        {expenses.length === 0 ? (
          <p className="text-dark-400 text-sm text-center py-8">No expenses recorded yet</p>
        ) : (
          <div className="space-y-2">
            {expenses.map(exp => (
              <div key={exp._id} className="flex items-center justify-between p-3 rounded-xl bg-dark-700 hover:bg-dark-600 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-orange-500/15 border border-orange-500/20 flex items-center justify-center">
                    <Wrench size={13} className="text-orange-400" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-heading font-semibold">{exp.description}</p>
                    <p className="text-dark-400 text-xs">{exp.category} · {formatDate(exp.expense_date)}</p>
                  </div>
                </div>
                <span className="text-orange-400 font-heading font-bold text-sm">{formatINR(exp.amount)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sell Modal */}
      <Modal open={sellModal} onClose={() => setSellModal(false)} title="Mark Vehicle as Sold" size="md">
        <form onSubmit={handleSell} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {[
              { k: 'buyer_name', l: 'Buyer Name *', req: true, type: 'text', ph: 'Full name' },
              { k: 'buyer_phone', l: 'Phone', type: 'text', ph: '+91 99999 99999' },
              { k: 'sold_price', l: 'Sold Price (₹) *', req: true, type: 'number', ph: '70000' },
              { k: 'sold_date', l: 'Sold Date *', req: true, type: 'date' },
            ].map(f => (
              <div key={f.k}>
                <label className="label">{f.l}</label>
                <input type={f.type} className="input-field" placeholder={f.ph} required={f.req}
                  value={sellForm[f.k]} onChange={e => setSellForm(p => ({ ...p, [f.k]: e.target.value }))} />
              </div>
            ))}
            <div>
              <label className="label">Payment Mode *</label>
              <select className="input-field" value={sellForm.payment_mode} onChange={e => setSellForm(p => ({ ...p, payment_mode: e.target.value }))}>
                {['Cash','Bank Transfer','Cheque','EMI'].map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Notes</label>
              <input className="input-field" placeholder="Optional notes" value={sellForm.notes}
                onChange={e => setSellForm(p => ({ ...p, notes: e.target.value }))} />
            </div>
          </div>
          <div>
            <label className="label">Buyer Address</label>
            <textarea className="input-field resize-none" rows={2} value={sellForm.buyer_address}
              onChange={e => setSellForm(p => ({ ...p, buyer_address: e.target.value }))} />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setSellModal(false)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
              {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Confirm Sale'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Expense Modal */}
      <Modal open={expenseModal} onClose={() => setExpenseModal(false)} title="Add Expense" size="sm">
        <form onSubmit={handleExpense} className="space-y-4">
          {[
            { k: 'description', l: 'Description *', req: true, ph: 'e.g. Engine repair' },
            { k: 'category', l: 'Category', ph: 'Repair / Cleaning / RTO' },
          ].map(f => (
            <div key={f.k}>
              <label className="label">{f.l}</label>
              <input className="input-field" placeholder={f.ph} required={f.req}
                value={expForm[f.k]} onChange={e => setExpForm(p => ({ ...p, [f.k]: e.target.value }))} />
            </div>
          ))}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Amount (₹) *</label>
              <input type="number" className="input-field" placeholder="500" required
                value={expForm.amount} onChange={e => setExpForm(p => ({ ...p, amount: e.target.value }))} />
            </div>
            <div>
              <label className="label">Date *</label>
              <input type="date" className="input-field" required value={expForm.expense_date}
                onChange={e => setExpForm(p => ({ ...p, expense_date: e.target.value }))} />
            </div>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={() => setExpenseModal(false)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
              {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Add Expense'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={deleteDialog}
        onClose={() => setDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Delete Vehicle"
        message={`Are you sure you want to delete ${v.vehicle_name}? This action cannot be undone.`}
        danger
      />
    </div>
  );
}
