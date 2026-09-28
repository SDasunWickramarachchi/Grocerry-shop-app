import React, { useState } from 'react';
import { useGroceryStore, groceryStore } from '../store/groceryStore';
import { Code2, Terminal, RefreshCw, Smartphone, Database, ShieldCheck, Sparkles, Trash2, Cpu, UserCheck, Check, X, Clock, AlertCircle } from 'lucide-react';

export default function DeveloperView() {
  const { systemLogs, products, orders, users, approveUser, rejectUser } = useGroceryStore();
  const [logFilter, setLogFilter] = useState('all');

  const filteredLogs = systemLogs.filter(log => logFilter === 'all' || log.type === logFilter);

  // Filter Admin accounts
  const adminUsers = users.filter(u => u.role === 'admin');
  const pendingAdmins = adminUsers.filter(u => u.status === 'pending');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <span className="text-xs font-bold text-rose-400 uppercase tracking-widest flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> Direct Access URL: /Developer (Master Auth)
          </span>
          <h1 className="text-3xl font-extrabold text-white mt-1">Developer Portal & Security Control</h1>
          <p className="text-xs text-slate-400 mt-1">Logged in as Master Developer: <strong className="text-rose-400">Dasun@ZyaraSoft</strong></p>
        </div>

        <button
          onClick={() => {
            if (confirm('Are you sure you want to reset the store database to initial mock state?')) {
              groceryStore.resetStoreData();
            }
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-bold transition active:scale-95 cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Reset Demo Database</span>
        </button>
      </div>

      {/* DEVELOPER APPROVAL PANEL FOR ADMIN ACCOUNTS */}
      <div className="glass-panel p-6 rounded-3xl border border-rose-500/30 space-y-4 glow-rose">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/40">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span>Admin Account Approvals</span>
                {pendingAdmins.length > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-extrabold text-xs border border-amber-500/40 animate-pulse">
                    {pendingAdmins.length} Pending Approval
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-400">Master Developer must approve registered Admin accounts before they can log in to /Admin</p>
            </div>
          </div>
        </div>

        {adminUsers.length === 0 ? (
          <div className="text-slate-500 text-xs text-center py-6">No Admin accounts registered yet.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {adminUsers.map(admin => {
              const adminId = admin.id || admin._id;
              const isPending = admin.status === 'pending';
              const isApproved = admin.status === 'approved';

              return (
                <div key={adminId} className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3 relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-white text-sm">{admin.name || admin.username}</h4>
                      <span className="text-xs text-slate-400 font-mono">@{admin.username}</span>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      isApproved ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' :
                      isPending ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                      'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    }`}>
                      {admin.status}
                    </span>
                  </div>

                  {admin.phone && (
                    <div className="text-xs text-slate-400 flex items-center gap-1.5">
                      <span>Phone:</span>
                      <strong className="text-slate-200">{admin.phone}</strong>
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                    {!isApproved && (
                      <button
                        onClick={() => approveUser(adminId)}
                        className="flex-1 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1 shadow-md"
                      >
                        <Check className="w-4 h-4" />
                        <span>Approve Admin</span>
                      </button>
                    )}

                    {admin.status !== 'rejected' && (
                      <button
                        onClick={() => rejectUser(adminId)}
                        className="py-1.5 px-3 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-bold text-xs border border-rose-500/40 transition cursor-pointer flex items-center justify-center gap-1"
                      >
                        <X className="w-4 h-4" />
                        <span>Reject</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* PWA & System Telemetry Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-rose-400 uppercase">
            <Smartphone className="w-4 h-4" /> Service Worker & PWA State
          </div>
          <div className="text-xl font-bold text-white flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
            PWA Manifest Active
          </div>
          <p className="text-xs text-slate-400">Offline fallback caching enabled (`/sw.js`).</p>
        </div>

        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase">
            <Database className="w-4 h-4" /> MongoDB Storage Engine
          </div>
          <div className="text-xl font-bold text-white">
            Users & Collections
          </div>
          <p className="text-xs text-slate-400">{users.length} Users • {products.length} Products in DB.</p>
        </div>

        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-purple-400 uppercase">
            <Cpu className="w-4 h-4" /> Business Rules Engine
          </div>
          <div className="text-xl font-bold text-white">
            Approval Hierarchy Enforced
          </div>
          <p className="text-xs text-slate-400">Developer approves Admins, Admin approves Staff & Drivers.</p>
        </div>

      </div>

      {/* Real-time System Log Console */}
      <div className="glass-panel rounded-3xl border border-slate-800 p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-rose-400" />
            <h2 className="text-xl font-bold text-white">Live System Log Stream</h2>
          </div>

          {/* Log Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
            {['all', 'order', 'status', 'admin', 'auth', 'system'].map((f) => (
              <button
                key={f}
                onClick={() => setLogFilter(f)}
                className={`px-3 py-1 rounded-xl uppercase font-bold transition cursor-pointer ${
                  logFilter === f
                    ? 'bg-rose-500 text-slate-950 font-extrabold'
                    : 'bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-900 font-mono text-xs max-h-96 overflow-y-auto space-y-2 text-slate-300">
          {filteredLogs.length === 0 ? (
            <div className="text-slate-600 text-center py-8">No logs found for selected filter.</div>
          ) : (
            filteredLogs.map((log) => (
              <div key={log.id} className="flex items-start gap-3 hover:bg-slate-900/50 p-1 rounded">
                <span className="text-slate-500 shrink-0">[{log.timestamp}]</span>
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 ${
                  log.type === 'order' ? 'bg-emerald-500/20 text-emerald-400' :
                  log.type === 'admin' ? 'bg-purple-500/20 text-purple-400' :
                  log.type === 'auth' ? 'bg-amber-500/20 text-amber-400' :
                  log.type === 'status' ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-800 text-slate-400'
                }`}>
                  {log.type}
                </span>
                <span className="flex-1 leading-relaxed">{log.text}</span>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}
