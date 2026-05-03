// Reusable small UI components

export const Spinner = ({ size = 'md', className = '' }) => {
  const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-10 h-10' };
  return (
    <div className={`${sizes[size]} border-2 border-dark-500 border-t-brand-500 rounded-full animate-spin ${className}`} />
  );
};

export const PageLoader = () => (
  <div className="flex items-center justify-center h-64">
    <div className="flex flex-col items-center gap-3">
      <Spinner size="lg" />
      <p className="text-dark-300 text-sm font-body">Loading...</p>
    </div>
  </div>
);

export const EmptyState = ({ icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="text-dark-500 mb-4 text-5xl">{icon}</div>
    <h3 className="section-title mb-2">{title}</h3>
    <p className="text-dark-300 text-sm max-w-xs mb-6">{description}</p>
    {action}
  </div>
);

export const Modal = ({ open, onClose, title, children, size = 'md' }) => {
  if (!open) return null;
  const sizes = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className={`relative w-full ${sizes[size]} card animate-scale-in max-h-[90vh] overflow-y-auto`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-dark-600">
          <h2 className="section-title">{title}</h2>
          <button onClick={onClose} className="btn-ghost p-1.5 rounded-lg">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
};

export const StatusBadge = ({ status }) => {
  const map = {
    Available: 'badge-available',
    Pending: 'badge-pending',
    Sold: 'badge-sold',
  };
  const dots = {
    Available: 'bg-emerald-400',
    Pending: 'bg-amber-400',
    Sold: 'bg-blue-400',
  };
  return (
    <span className={map[status] || 'badge-available'}>
      <span className={`w-1.5 h-1.5 rounded-full ${dots[status]}`} />
      {status}
    </span>
  );
};

export const SkeletonCard = () => (
  <div className="card p-4 space-y-3">
    <div className="shimmer-line h-40 rounded-xl" />
    <div className="shimmer-line h-4 rounded w-3/4" />
    <div className="shimmer-line h-3 rounded w-1/2" />
    <div className="flex gap-2">
      <div className="shimmer-line h-6 rounded-full w-20" />
      <div className="shimmer-line h-6 rounded-full w-16" />
    </div>
    <div className="shimmer-line h-8 rounded-xl" />
  </div>
);

export const ConfirmDialog = ({ open, onClose, onConfirm, title, message, danger = false }) => (
  <Modal open={open} onClose={onClose} title={title} size="sm">
    <p className="text-dark-200 text-sm mb-6">{message}</p>
    <div className="flex gap-3">
      <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
      <button
        onClick={() => { onConfirm(); onClose(); }}
        className={`flex-1 font-heading font-semibold tracking-wide px-5 py-2.5 rounded-xl transition-all duration-200 ${danger ? 'bg-red-600 hover:bg-red-700 text-white' : 'btn-primary'}`}
      >
        Confirm
      </button>
    </div>
  </Modal>
);
