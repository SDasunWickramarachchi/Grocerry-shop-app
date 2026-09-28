import React from 'react';
import { useGroceryStore, groceryStore } from '../store/groceryStore';
import { Bell, CheckCircle2, AlertTriangle, Info, XCircle, X, Smartphone } from 'lucide-react';

export default function NotificationToast() {
  const { notifications } = useGroceryStore();

  if (!notifications || notifications.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 max-w-md w-full px-4 pointer-events-none">
      {notifications.map((notif) => {
        let Icon = Info;
        let borderClass = 'border-blue-500/40 bg-slate-900/90';
        let textClass = 'text-blue-400';

        if (notif.type === 'success') {
          Icon = CheckCircle2;
          borderClass = 'border-emerald-500/40 bg-slate-900/95';
          textClass = 'text-emerald-400';
        } else if (notif.type === 'warning') {
          Icon = AlertTriangle;
          borderClass = 'border-amber-500/40 bg-slate-900/95';
          textClass = 'text-amber-400';
        } else if (notif.type === 'error') {
          Icon = XCircle;
          borderClass = 'border-rose-500/40 bg-slate-900/95';
          textClass = 'text-rose-400';
        }

        return (
          <div
            key={notif.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border ${borderClass} backdrop-blur-xl shadow-2xl transition-all duration-300 animate-slide-up hover:scale-[1.02]`}
          >
            <div className={`p-2 rounded-lg bg-slate-800/80 ${textClass}`}>
              <Icon className="w-6 h-6 animate-pulse-subtle" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <Smartphone className="w-3 h-3 text-emerald-400" /> Live SMS / Customer Alert
                </span>
                <span className="text-[10px] text-slate-500">{notif.timestamp}</span>
              </div>
              <h4 className="text-sm font-semibold text-slate-100">{notif.title}</h4>
              <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{notif.message}</p>
            </div>

            <button
              onClick={() => groceryStore.dismissNotification(notif.id)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
              aria-label="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
