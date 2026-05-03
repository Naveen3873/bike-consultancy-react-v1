import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { formatRelative } from '../utils/helpers';
import { PageLoader, EmptyState } from '../components/ui/index';
import { Bell, CheckCheck, Info, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

const TYPE_CONFIG = {
  info:    { icon: Info,          color: 'text-blue-400',    bg: 'bg-blue-500/10 border-blue-500/20' },
  warning: { icon: AlertTriangle, color: 'text-amber-400',   bg: 'bg-amber-500/10 border-amber-500/20' },
  success: { icon: CheckCircle,   color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  error:   { icon: XCircle,       color: 'text-red-400',     bg: 'bg-red-500/10 border-red-500/20' },
};

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api.get('/notifications')
      .then(r => { setNotifications(r.data.data.notifications); setUnread(r.data.data.unreadCount); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const markAllRead = async () => {
    await api.put('/notifications/read-all');
    load();
  };

  if (loading) return <PageLoader />;

  return (
    <div className="max-w-2xl mx-auto space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title gradient-text">Notifications</h1>
          <p className="text-dark-300 text-sm mt-1">
            {unread > 0 ? <span className="text-brand-400 font-semibold">{unread} unread</span> : 'All caught up'}
          </p>
        </div>
        {unread > 0 && (
          <button onClick={markAllRead} className="btn-secondary flex items-center gap-2 text-sm">
            <CheckCheck size={15} /> Mark all read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <EmptyState
          icon={<Bell />}
          title="No notifications"
          description="You'll see alerts about insurance, sales, and inventory here"
        />
      ) : (
        <div className="space-y-2">
          {notifications.map(n => {
            const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG.info;
            const Icon = cfg.icon;
            return (
              <div
                key={n._id}
                className={`card p-4 flex items-start gap-4 transition-all duration-200 ${!n.is_read ? 'border-dark-500 bg-dark-700/50' : 'opacity-60'}`}
              >
                <div className={`w-9 h-9 rounded-xl border flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
                  <Icon size={16} className={cfg.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm font-heading font-semibold ${!n.is_read ? 'text-white' : 'text-dark-200'}`}>{n.title}</p>
                    <span className="text-dark-400 text-xs flex-shrink-0">{formatRelative(n.created_at)}</span>
                  </div>
                  <p className="text-dark-300 text-sm mt-0.5">{n.message}</p>
                  {n.vehicle_id && (
                    <Link to={`/vehicles/${n.vehicle_id._id}`}
                      className="text-brand-400 text-xs hover:text-brand-300 mt-1 inline-flex items-center gap-1 font-heading">
                      View {n.vehicle_id.vehicle_name} →
                    </Link>
                  )}
                </div>
                {!n.is_read && (
                  <div className="w-2 h-2 rounded-full bg-brand-500 flex-shrink-0 mt-1.5" />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
