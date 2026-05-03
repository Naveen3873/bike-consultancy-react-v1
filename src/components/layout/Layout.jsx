import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getInitials } from '../../utils/helpers';
import {
  LayoutDashboard, Bike, PlusCircle, DollarSign, BarChart3,
  Bell, Settings, LogOut, Menu, X, ChevronRight, Wrench
} from 'lucide-react';

const NAV = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/vehicles', icon: Bike, label: 'Inventory' },
  { to: '/vehicles/add', icon: PlusCircle, label: 'Add Vehicle' },
  { to: '/expenses', icon: DollarSign, label: 'Expenses' },
  { to: '/reports', icon: BarChart3, label: 'Reports' },
  { to: '/notifications', icon: Bell, label: 'Notifications' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function Layout({ children }) {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-dark-600">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-brand-500 rounded-xl flex items-center justify-center glow-orange">
            <Bike className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-display text-xl text-white tracking-widest leading-none">BIKE</p>
            <p className="text-[10px] font-heading font-semibold text-brand-400 tracking-[0.2em] uppercase">Consultancy</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV.filter(n => n.to !== '/reports' || isAdmin).map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                isActive
                  ? 'bg-brand-500/15 text-brand-400 border border-brand-500/20'
                  : 'text-dark-200 hover:text-white hover:bg-dark-700'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon className={`w-4.5 h-4.5 flex-shrink-0 ${isActive ? 'text-brand-400' : 'text-dark-300 group-hover:text-white'}`} size={18} />
                <span className="font-heading font-medium text-sm tracking-wide">{label}</span>
                {isActive && <ChevronRight size={14} className="ml-auto text-brand-400" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="px-3 py-4 border-t border-dark-600">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-dark-700 mb-2">
          <div className="w-8 h-8 rounded-lg bg-brand-500/20 border border-brand-500/30 flex items-center justify-center flex-shrink-0">
            <span className="text-brand-400 text-xs font-heading font-bold">{getInitials(user?.full_name || user?.username)}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-heading font-semibold truncate">{user?.full_name || user?.username}</p>
            <p className="text-dark-300 text-xs capitalize">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-dark-300 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 group"
        >
          <LogOut size={16} className="group-hover:text-red-400" />
          <span className="font-heading font-medium text-sm tracking-wide">Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-dark-900 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-56 bg-dark-800 border-r border-dark-600 flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-64 bg-dark-800 border-r border-dark-600 animate-slide-up">
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute top-4 right-4 btn-ghost p-1.5 rounded-lg"
            >
              <X size={20} />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden flex items-center gap-3 px-4 py-3 bg-dark-800 border-b border-dark-600">
          <button onClick={() => setSidebarOpen(true)} className="btn-ghost p-2 rounded-lg">
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-brand-500 rounded-lg flex items-center justify-center">
              <Bike className="w-4 h-4 text-white" />
            </div>
            <span className="font-display text-lg text-white tracking-widest">BIKE CONSULTANCY</span>
          </div>
        </header>

        {/* Page */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
