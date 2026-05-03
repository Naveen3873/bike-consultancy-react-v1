import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { User, Lock, Save, Shield } from 'lucide-react';
import { getInitials } from '../utils/helpers';

export default function Settings() {
  const { user, refreshUser } = useAuth();
  const [profileForm, setProfileForm] = useState({
    full_name: user?.full_name || '',
    email: user?.email || '',
  });
  const [passForm, setPassForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPass, setSavingPass] = useState(false);

  const setP = (k) => (e) => setProfileForm(f => ({ ...f, [k]: e.target.value }));
  const setPw = (k) => (e) => setPassForm(f => ({ ...f, [k]: e.target.value }));

  const handleProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await api.put('/auth/profile', profileForm);
      await refreshUser();
      toast.success('Profile updated!');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSavingProfile(false); }
  };

  const handlePassword = async (e) => {
    e.preventDefault();
    if (passForm.newPassword !== passForm.confirmPassword) return toast.error('Passwords do not match');
    if (passForm.newPassword.length < 6) return toast.error('Password must be at least 6 characters');
    setSavingPass(true);
    try {
      await api.put('/auth/change-password', { currentPassword: passForm.currentPassword, newPassword: passForm.newPassword });
      toast.success('Password changed!');
      setPassForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSavingPass(false); }
  };

  return (
    <div className="max-w-xl mx-auto space-y-5 animate-fade-in">
      <div>
        <h1 className="page-title gradient-text">Settings</h1>
        <p className="text-dark-300 text-sm mt-1">Manage your account preferences</p>
      </div>

      {/* Avatar */}
      <div className="card p-5 flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-brand-500/20 border-2 border-brand-500/30 flex items-center justify-center">
          <span className="font-display text-2xl text-brand-400">{getInitials(user?.full_name || user?.username)}</span>
        </div>
        <div>
          <p className="text-white font-heading font-semibold text-lg">{user?.full_name || user?.username}</p>
          <div className="flex items-center gap-2 mt-1">
            <Shield size={12} className="text-brand-400" />
            <span className="text-brand-400 text-xs font-heading font-semibold capitalize">{user?.role}</span>
            <span className="text-dark-500">·</span>
            <span className="text-dark-400 text-xs">@{user?.username}</span>
          </div>
        </div>
      </div>

      {/* Profile */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-5">
          <User size={16} className="text-brand-400" />
          <h3 className="section-title">Profile Information</h3>
        </div>
        <form onSubmit={handleProfile} className="space-y-4">
          <div>
            <label className="label">Full Name</label>
            <input className="input-field" placeholder="Your full name" value={profileForm.full_name} onChange={setP('full_name')} />
          </div>
          <div>
            <label className="label">Email Address</label>
            <input type="email" className="input-field" placeholder="your@email.com" value={profileForm.email} onChange={setP('email')} />
          </div>
          <div>
            <label className="label">Username</label>
            <input className="input-field opacity-60 cursor-not-allowed" value={user?.username} disabled />
            <p className="text-dark-400 text-xs mt-1">Username cannot be changed</p>
          </div>
          <button type="submit" disabled={savingProfile} className="btn-primary flex items-center gap-2">
            {savingProfile ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Save size={15} /> Save Profile</>}
          </button>
        </form>
      </div>

      {/* Password */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-5">
          <Lock size={16} className="text-brand-400" />
          <h3 className="section-title">Change Password</h3>
        </div>
        <form onSubmit={handlePassword} className="space-y-4">
          {[
            { k: 'currentPassword', l: 'Current Password', ph: 'Enter current password' },
            { k: 'newPassword', l: 'New Password', ph: 'Min. 6 characters' },
            { k: 'confirmPassword', l: 'Confirm New Password', ph: 'Repeat new password' },
          ].map(f => (
            <div key={f.k}>
              <label className="label">{f.l}</label>
              <input type="password" className="input-field" placeholder={f.ph} required value={passForm[f.k]} onChange={setPw(f.k)} />
            </div>
          ))}
          <button type="submit" disabled={savingPass} className="btn-primary flex items-center gap-2">
            {savingPass ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Lock size={15} /> Update Password</>}
          </button>
        </form>
      </div>

      {/* Info */}
      <div className="card p-4 border-dark-600/50 bg-dark-800/30">
        <p className="text-dark-400 text-xs text-center">Bike Consultancy v1.0 · Vehicle Management System</p>
      </div>
    </div>
  );
}
