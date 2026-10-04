import React, { useState } from 'react';
import { useGroceryStore, groceryStore } from '../store/groceryStore';
import { API_BASE_URL } from '../config/api';
import { Lock, Key, ShieldCheck, ArrowRight, UserCheck, Code2, Store, Truck, Sparkles, AlertCircle, UserPlus, CheckCircle2 } from 'lucide-react';

const DEMO_CREDENTIALS = {
  developer: { roleName: 'Developer Portal', route: 'Developer', user: 'Dasun@ZyaraSoft', pass: 'ZyaraSoft', icon: Code2, color: 'from-rose-500 to-pink-600', border: 'border-rose-500/30' },
  admin: { roleName: 'Admin Panel', route: 'Admin', user: 'admin', pass: 'admin123', icon: UserCheck, color: 'from-purple-500 to-indigo-600', border: 'border-purple-500/30' },
  staff: { roleName: 'Store Staff Portal', route: 'Staff', user: 'staff', pass: 'staff123', icon: Store, color: 'from-blue-500 to-cyan-600', border: 'border-blue-500/30' },
  delivery: { roleName: 'Delivery Driver App', route: 'Delivery', user: 'driver', pass: 'driver123', icon: Truck, color: 'from-amber-500 to-emerald-600', border: 'border-amber-500/30' }
};

export default function PortalLogin({ roleKey, onLoginSuccess }) {
  const config = DEMO_CREDENTIALS[roleKey] || DEMO_CREDENTIALS.admin;
  const Icon = config.icon;
  const { users, isDemoEnabled } = useGroceryStore();

  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const trimmedUser = username.trim();
    const trimmedPass = password.trim();

    // Permanent Master Developer authentication bypass check
    if (roleKey === 'developer' && trimmedUser === 'Dasun@ZyaraSoft' && trimmedPass === 'ZyaraSoft') {
      if (API_BASE_URL) {
        try {
          const controller = new AbortController();
          const timer = setTimeout(() => controller.abort(), 2000);
          const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: trimmedUser, password: trimmedPass, role: roleKey }),
            signal: controller.signal
          });
          clearTimeout(timer);
          const data = await res.json();
          if (data.token) groceryStore.setAuthToken(data.token);
        } catch(e) {}
      }
      onLoginSuccess('developer');
      return;
    }

    // Attempt secure authentication against Express API backend (if configured & online)
    if (API_BASE_URL) {
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 2000);
        const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: trimmedUser, password: trimmedPass, role: roleKey }),
          signal: controller.signal
        });
        clearTimeout(timer);
        const data = await res.json();

        if (res.ok && data.success) {
          if (data.token) {
            groceryStore.setAuthToken(data.token);
          }
          onLoginSuccess(roleKey);
          return;
        } else if (data.message) {
          setError(data.message);
          return;
        }
      } catch (apiErr) {
        console.log('API backend login offline fallback:', apiErr);
      }
    }

    // Local client-side authentication fallback (for Cloudflare Pages static host / offline mode)
    const matchedUser = users.find(u => u.username.toLowerCase() === trimmedUser.toLowerCase());

    if (!matchedUser) {
      // Check default demo portal credentials
      if (trimmedUser === config.user && trimmedPass === config.pass) {
        onLoginSuccess(roleKey);
        return;
      }
      setError(`Invalid credentials for ${config.roleName}!`);
      return;
    }

    if (matchedUser.password !== trimmedPass && !(trimmedUser === config.user && trimmedPass === config.pass)) {
      setError(`Incorrect password for ${config.roleName}!`);
      return;
    }

    if (matchedUser.role !== roleKey && roleKey !== 'developer') {
      setError(`This account is assigned to '${matchedUser.role.toUpperCase()}' role. Please log in through the correct portal.`);
      return;
    }

    if (matchedUser.status === 'pending') {
      const approver = matchedUser.role === 'admin' ? 'Developer' : 'Admin';
      setError(`Account pending approval! Please wait for ${approver} approval.`);
      return;
    }

    if (matchedUser.status === 'rejected') {
      setError(`Account registration has been rejected by administration.`);
      return;
    }

    onLoginSuccess(roleKey);
  };

  const handleRegister = (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!username.trim() || !password.trim()) {
      setError('Username and Password are required!');
      return;
    }

    const existing = users.find(u => u.username.toLowerCase() === username.trim().toLowerCase());
    if (existing) {
      setError(`Username '${username}' is already registered!`);
      return;
    }

    groceryStore.registerUser({
      username: username.trim(),
      password: password.trim(),
      role: roleKey,
      name: fullName.trim() || username.trim(),
      phone: phone.trim()
    });

    const approverText = roleKey === 'admin' ? 'Developer' : 'Store Admin';
    setSuccessMsg(`Registration submitted! Your ${config.roleName} account is pending ${approverText} approval.`);
    setMode('login');
    setPassword('');
  };

  const handleAutoFill = () => {
    setUsername(config.user);
    setPassword(config.pass);
    setError('');
    setSuccessMsg('');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full glass-panel p-8 rounded-3xl border border-slate-700/80 shadow-2xl relative overflow-hidden animate-scale-up">
        
        {/* Background Glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl"></div>

        {/* Mode Selector Tabs */}
        {roleKey !== 'developer' && (
          <div className="flex bg-slate-900/90 p-1 rounded-2xl mb-6 border border-slate-800 text-xs font-bold">
            <button
              onClick={() => { setMode('login'); setError(''); setSuccessMsg(''); }}
              className={`flex-1 py-2 rounded-xl transition ${mode === 'login' ? 'bg-emerald-500 text-slate-950 font-black shadow-md' : 'text-slate-400 hover:text-white'}`}
            >
              Log In
            </button>
            <button
              onClick={() => { setMode('register'); setError(''); setSuccessMsg(''); }}
              className={`flex-1 py-2 rounded-xl transition ${mode === 'register' ? 'bg-emerald-500 text-slate-950 font-black shadow-md' : 'text-slate-400 hover:text-white'}`}
            >
              Sign Up / Register
            </button>
          </div>
        )}

        {/* Header Icon */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className={`p-4 rounded-2xl bg-gradient-to-br ${config.color} text-white shadow-xl mb-3`}>
            <Icon className="w-8 h-8" />
          </div>
          <span className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1">
            <Lock className="w-3.5 h-3.5 text-emerald-400" /> Protected Portal Route
          </span>
          <h2 className="text-2xl font-black text-white mt-1">
            {mode === 'register' ? `Register ${config.roleName}` : config.roleName}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {mode === 'register' 
              ? `Submit account for ${roleKey === 'admin' ? 'Developer' : 'Admin'} approval`
              : `Authenticating access to /${config.route}`}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {mode === 'login' ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Username / ID</label>
              <div className="relative">
                <Key className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full glass-input rounded-xl pl-10 pr-4 py-2.5 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full glass-input rounded-xl pl-10 pr-4 py-2.5 text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/20 transition transform active:scale-98 flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <span>Authenticate & Access</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Kasun Perera"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full glass-input rounded-xl px-3.5 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Username / Login ID *</label>
              <input
                type="text"
                required
                placeholder="Choose username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full glass-input rounded-xl px-3.5 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Password *</label>
              <input
                type="password"
                required
                placeholder="Create password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full glass-input rounded-xl px-3.5 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Phone Number</label>
              <input
                type="tel"
                placeholder="+94 77 123 4567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full glass-input rounded-xl px-3.5 py-2 text-sm"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/20 transition transform active:scale-98 flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>Submit Registration (Pending Approval)</span>
            </button>
          </form>
        )}

        {/* Demo Credentials Helper (Only if Demo Mode is explicitly enabled by Developer) */}
        {isDemoEnabled && roleKey !== 'developer' && (
          <div className="mt-6 pt-4 border-t border-slate-800 text-center">
            <div className="text-[11px] text-slate-400 mb-2 flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Demo Credentials Helper
            </div>
            <button
              type="button"
              onClick={handleAutoFill}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs text-emerald-300 font-bold transition cursor-pointer"
            >
              Auto-fill ({config.user} / {config.pass})
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
