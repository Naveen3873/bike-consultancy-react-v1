import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Bike, Eye, EyeOff, ArrowRight } from 'lucide-react';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '', full_name: '', email: '', role: 'staff' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username || !form.password) return toast.error('Username and password are required');
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      await register(form);
      toast.success('Account created!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-brand-500/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-brand-600/5 rounded-full blur-3xl" />
        <div className="absolute inset-0 opacity-[0.02]"
          style={{ backgroundImage: 'linear-gradient(#f97316 1px, transparent 1px), linear-gradient(90deg, #f97316 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
      </div>

      <div className="w-full max-w-sm animate-fade-in relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-brand-500/15 border border-brand-500/30 rounded-2xl mb-4">
            <Bike className="w-7 h-7 text-brand-400" />
          </div>
          <h1 className="font-display text-4xl text-white tracking-widest">BIKE CONSULTANCY</h1>
        </div>

        <div className="card p-6">
          <h2 className="section-title mb-1">Create Account</h2>
          <p className="text-dark-300 text-sm mb-6">Set up your admin account</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="label">Full Name</label>
                <input type="text" className="input-field" placeholder="Your full name" value={form.full_name} onChange={set('full_name')} />
              </div>
              <div className="col-span-2">
                <label className="label">Username *</label>
                <input type="text" className="input-field" placeholder="Choose a username" value={form.username} onChange={set('username')} required />
              </div>
              <div className="col-span-2">
                <label className="label">Email</label>
                <input type="email" className="input-field" placeholder="your@email.com" value={form.email} onChange={set('email')} />
              </div>
              <div className="col-span-2">
                <label className="label">Password *</label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    className="input-field pr-11"
                    placeholder="Min. 6 characters"
                    value={form.password}
                    onChange={set('password')}
                    required
                  />
                  <button type="button" onClick={() => setShowPass(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-300 hover:text-white">
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              {/* <div className="col-span-2">
                <label className="label">Role</label>
                <select className="input-field" value={form.role} onChange={set('role')}>
                  <option value="admin">Admin</option>
                  <option value="staff">Staff</option>
                </select>
              </div> */}
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 mt-2">
              {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><ArrowRight size={16} />Create Account</>}
            </button>
          </form>

          <p className="text-center text-dark-300 text-sm mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-400 hover:text-brand-300 font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
