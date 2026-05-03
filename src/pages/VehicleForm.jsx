import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { Upload, X, ImagePlus, ArrowLeft, Save } from 'lucide-react';
import { PageLoader } from '../components/ui/index';

const FIELD = ({ label, children }) => (
  <div><label className="label">{label}</label>{children}</div>
);

export default function VehicleForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);

  const [form, setForm] = useState({
    reg_number: '', vehicle_name: '', model: '', year: new Date().getFullYear(),
    rc_owner_name: '', rc_owner_address: '', no_of_owners: '1st',
    selling_cost: '', purchase_cost: '', mileage_km: '',
    insurance_status: 'Active', insurance_expiry_date: '', hypothetication: false,
    purchase_date: '', purchase_from: '', fine_details: '', remark: '',
    rto_status: 'Not Applicable', status: 'Available',
  });

  useEffect(() => {
    if (isEdit) {
      setLoading(true);
      api.get(`/vehicles/${id}`)
        .then(r => {
          const v = r.data.data.vehicle;
          setForm({
            reg_number: v.reg_number || '', vehicle_name: v.vehicle_name || '',
            model: v.model || '', year: v.year || new Date().getFullYear(),
            rc_owner_name: v.rc_owner_name || '', rc_owner_address: v.rc_owner_address || '',
            no_of_owners: v.no_of_owners || '1st', selling_cost: v.selling_cost || '',
            purchase_cost: v.purchase_cost || '', mileage_km: v.mileage_km || '',
            insurance_status: v.insurance_status || 'Active',
            insurance_expiry_date: v.insurance_expiry_date ? v.insurance_expiry_date.split('T')[0] : '',
            hypothetication: v.hypothetication || false,
            purchase_date: v.purchase_date ? v.purchase_date.split('T')[0] : '',
            purchase_from: v.purchase_from || '', fine_details: v.fine_details || '',
            remark: v.remark || '', rto_status: v.rto_status || 'Not Applicable',
            status: v.status || 'Available',
          });
        })
        .catch(() => toast.error('Failed to load vehicle'))
        .finally(() => setLoading(false));
    }
  }, [id, isEdit]);

  const set = (k) => (e) => {
    const v = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm(p => ({ ...p, [k]: v }));
  };

  const handleImages = (e) => {
    const files = Array.from(e.target.files);
    setImages(prev => [...prev, ...files]);
    const newPreviews = files.map(f => URL.createObjectURL(f));
    setPreviews(prev => [...prev, ...newPreviews]);
  };

  const removeImage = (i) => {
    setImages(prev => prev.filter((_, idx) => idx !== i));
    setPreviews(prev => prev.filter((_, idx) => idx !== i));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (isEdit) {
        await api.put(`/vehicles/${id}`, form);
        if (images.length > 0) {
          const fd = new FormData();
          images.forEach(f => fd.append('images', f));
          await api.post(`/vehicles/${id}/images`, fd);
        }
        toast.success('Vehicle updated!');
      } else {
        const fd = new FormData();
        Object.entries(form).forEach(([k, v]) => fd.append(k, v));
        images.forEach(f => fd.append('images', f));
        const { data } = await api.post('/vehicles', fd);
        toast.success('Vehicle added!');
        navigate(`/vehicles/${data.data.vehicle._id}`);
        return;
      }
      navigate(`/vehicles/${id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save vehicle');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="btn-ghost p-2 rounded-xl">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="page-title gradient-text">{isEdit ? 'Edit Vehicle' : 'Add Vehicle'}</h1>
          <p className="text-dark-300 text-sm">{isEdit ? 'Update vehicle details' : 'Add a new bike to inventory'}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Basic Info */}
        <div className="card p-5 space-y-4">
          <h3 className="section-title border-b border-dark-600 pb-3">Basic Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FIELD label="Registration Number *">
              <input className="input-field uppercase" placeholder="MH-10-AB-1000" value={form.reg_number}
                onChange={set('reg_number')} required />
            </FIELD>
            <FIELD label="Vehicle Name *">
              <input className="input-field" placeholder="Yamaha R15 V4" value={form.vehicle_name}
                onChange={set('vehicle_name')} required />
            </FIELD>
            <FIELD label="Model *">
              <input className="input-field" placeholder="R15 V4" value={form.model}
                onChange={set('model')} required />
            </FIELD>
            <FIELD label="Year *">
              <input type="number" className="input-field" placeholder="2022" min="1990" max={new Date().getFullYear() + 1}
                value={form.year} onChange={set('year')} required />
            </FIELD>
            <FIELD label="No. of Owners *">
              <select className="input-field" value={form.no_of_owners} onChange={set('no_of_owners')}>
                {['1st','2nd','3rd','4th+'].map(o => <option key={o}>{o}</option>)}
              </select>
            </FIELD>
            <FIELD label="Mileage (km) *">
              <input type="number" className="input-field" placeholder="12000" min="0"
                value={form.mileage_km} onChange={set('mileage_km')} required />
            </FIELD>
          </div>
        </div>

        {/* RC Details */}
        <div className="card p-5 space-y-4">
          <h3 className="section-title border-b border-dark-600 pb-3">RC Book Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FIELD label="RC Owner Name *">
              <input className="input-field" placeholder="Owner's name" value={form.rc_owner_name}
                onChange={set('rc_owner_name')} required />
            </FIELD>
            <div className="sm:col-span-1">
              <FIELD label="RC Owner Address *">
                <textarea className="input-field resize-none" rows={2} placeholder="Full address"
                  value={form.rc_owner_address} onChange={set('rc_owner_address')} required />
              </FIELD>
            </div>
          </div>
        </div>

        {/* Purchase */}
        <div className="card p-5 space-y-4">
          <h3 className="section-title border-b border-dark-600 pb-3">Purchase Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FIELD label="Purchase Cost (₹) *">
              <input type="number" className="input-field" placeholder="65000" min="0"
                value={form.purchase_cost} onChange={set('purchase_cost')} required />
            </FIELD>
            <FIELD label="Selling Cost (₹) *">
              <input type="number" className="input-field" placeholder="75000" min="0"
                value={form.selling_cost} onChange={set('selling_cost')} required />
            </FIELD>
            <FIELD label="Purchase Date *">
              <input type="date" className="input-field" value={form.purchase_date}
                onChange={set('purchase_date')} required />
            </FIELD>
            <FIELD label="Purchase From *">
              <input className="input-field" placeholder="Seller name / source"
                value={form.purchase_from} onChange={set('purchase_from')} required />
            </FIELD>
          </div>
        </div>

        {/* Insurance & Docs */}
        <div className="card p-5 space-y-4">
          <h3 className="section-title border-b border-dark-600 pb-3">Insurance & Documents</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FIELD label="Insurance Status *">
              <select className="input-field" value={form.insurance_status} onChange={set('insurance_status')}>
                {['Active','Expired','None'].map(o => <option key={o}>{o}</option>)}
              </select>
            </FIELD>
            {form.insurance_status === 'Active' && (
              <FIELD label="Insurance Expiry Date">
                <input type="date" className="input-field" value={form.insurance_expiry_date}
                  onChange={set('insurance_expiry_date')} />
              </FIELD>
            )}
            <FIELD label="RTO Status">
              <select className="input-field" value={form.rto_status} onChange={set('rto_status')}>
                {['Transfer Pending','Completed','Not Applicable'].map(o => <option key={o}>{o}</option>)}
              </select>
            </FIELD>
            <FIELD label="Vehicle Status">
              <select className="input-field" value={form.status} onChange={set('status')}>
                {['Available','Pending','Sold'].map(o => <option key={o}>{o}</option>)}
              </select>
            </FIELD>
            <div className="flex items-center gap-3 pt-2">
              <input type="checkbox" id="hypo" checked={form.hypothetication} onChange={set('hypothetication')}
                className="w-4 h-4 accent-brand-500" />
              <label htmlFor="hypo" className="text-dark-200 text-sm font-heading">Hypothetication (Loan)</label>
            </div>
          </div>
          <FIELD label="Fine Details">
            <textarea className="input-field resize-none" rows={2} placeholder="Any pending fines or violations"
              value={form.fine_details} onChange={set('fine_details')} />
          </FIELD>
          <FIELD label="Remarks / Notes">
            <textarea className="input-field resize-none" rows={2} placeholder="Internal notes"
              value={form.remark} onChange={set('remark')} />
          </FIELD>
        </div>

        {/* Images */}
        {!isEdit && (
          <div className="card p-5 space-y-4">
            <h3 className="section-title border-b border-dark-600 pb-3">Vehicle Photos</h3>
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-dark-500 rounded-xl p-8 cursor-pointer hover:border-brand-500/50 transition-colors group">
              <ImagePlus size={28} className="text-dark-400 group-hover:text-brand-400 mb-2 transition-colors" />
              <p className="text-dark-300 text-sm">Click to upload photos</p>
              <p className="text-dark-500 text-xs mt-1">PNG, JPG, WebP up to 10MB each</p>
              <input type="file" className="hidden" multiple accept="image/*" onChange={handleImages} />
            </label>
            {previews.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {previews.map((src, i) => (
                  <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-dark-700">
                    <img src={src} className="w-full h-full object-cover" />
                    <button type="button" onClick={() => removeImage(i)}
                      className="absolute top-1 right-1 w-5 h-5 bg-red-600 rounded-full flex items-center justify-center">
                      <X size={10} className="text-white" />
                    </button>
                    {i === 0 && <span className="absolute bottom-1 left-1 bg-brand-500 text-white text-[9px] font-bold px-1 rounded">PRIMARY</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
            {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Save size={16} />{isEdit ? 'Update Vehicle' : 'Add Vehicle'}</>}
          </button>
        </div>
      </form>
    </div>
  );
}
