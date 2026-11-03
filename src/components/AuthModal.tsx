import React, { useState } from 'react';
import {
  X,
  Crown,
  Shield,
  User,
  Check,
  Zap,
  Sparkles,
  LogIn,
  LogOut,
  ArrowRight,
  Mail,
  Lock,
  ShieldAlert,
  KeyRound,
} from 'lucide-react';
import { UserProfile } from '../types/detector';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
  isAuthenticated: boolean;
  onLogin: (email: string, name?: string, tier?: 'free' | 'pro' | 'enterprise') => void;
  onAdminLogin?: (token: string, adminUser: { email: string; name: string; role: 'ADMIN' }) => void;
  onLogout: () => void;
  onUpdateTier: (tier: 'free' | 'pro' | 'enterprise') => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  user,
  isAuthenticated,
  onLogin,
  onAdminLogin,
  onLogout,
  onUpdateTier,
}) => {
  const [authTab, setAuthTab] = useState<'analyst' | 'admin'>('analyst');
  const [emailInput, setEmailInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [selectedTier, setSelectedTier] = useState<'free' | 'pro' | 'enterprise'>(user?.tier || 'free');
  const [savedMessage, setSavedMessage] = useState(false);

  // Admin Login Form
  const [adminEmail, setAdminEmail] = useState('admin@kryptx-forensics.io');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminError, setAdminError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSignInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const email = emailInput.trim() || 'analyst@kryptx.ai';
    const name = nameInput.trim() || email.split('@')[0];
    onLogin(email, name, selectedTier);
    onClose();
  };

  const handleQuickSignIn = (demoEmail: string, demoName: string) => {
    onLogin(demoEmail, demoName, selectedTier);
    onClose();
  };

  const handleAdminSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError(null);
    setAdminLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: adminEmail, password: adminPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Invalid administrator credentials');
      }

      localStorage.setItem('kryptx_admin_token', data.token);
      if (onAdminLogin) {
        onAdminLogin(data.token, data.user);
      }
      onClose();
    } catch (err: any) {
      setAdminError(err.message || 'Administrator authentication failed');
    } finally {
      setAdminLoading(false);
    }
  };

  const handleSaveTier = () => {
    onUpdateTier(selectedTier);
    setSavedMessage(true);
    setTimeout(() => {
      setSavedMessage(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-[#080F20] border border-cyan-500/30 rounded-2xl shadow-2xl overflow-hidden p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-cyan-500/20">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
              {user?.role === 'ADMIN' ? <ShieldAlert className="w-5 h-5 text-purple-400" /> : <User className="w-5 h-5" />}
            </div>
            <h3 className="text-base font-heading font-bold text-white">
              {isAuthenticated
                ? user?.role === 'ADMIN'
                  ? 'Administrator Identity & Governance'
                  : 'Analyst Profile & Forensic Quota'
                : 'Access KRYPTX Intelligence'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* NOT LOGGED IN: SHOW TABS (ANALYST vs OFFICIAL ADMIN) */}
        {!isAuthenticated ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setAuthTab('analyst')}
                className={`py-2 rounded-lg transition-all ${
                  authTab === 'analyst'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Analyst Access
              </button>
              <button
                type="button"
                onClick={() => setAuthTab('admin')}
                className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  authTab === 'admin'
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Administrator</span>
              </button>
            </div>

            {/* TAB A: STANDARD ANALYST SIGN-IN */}
            {authTab === 'analyst' ? (
              <div className="space-y-4">
                <p className="text-xs text-slate-300">
                  Sign in to unlock forensic report exports, scan history retention, and high-throughput pipelines.
                </p>

                <form onSubmit={handleSignInSubmit} className="space-y-3">
                  <div>
                    <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
                      Analyst Work Email
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        placeholder="e.g. saiko@kryptx-forensics.io"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 focus:border-cyan-400 text-xs text-white placeholder-slate-500 outline-none transition-colors"
                        required
                      />
                      <Mail className="w-4 h-4 text-slate-500 absolute right-3.5 top-3 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
                      Full Name / Call-Sign
                    </label>
                    <input
                      type="text"
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      placeholder="e.g. Saiko Nakalla"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 focus:border-cyan-400 text-xs text-white placeholder-slate-500 outline-none transition-colors"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-xs font-bold text-white shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center gap-2"
                  >
                    <span>Authenticate & Access Platform</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>

                {/* Quick Demo Sign In */}
                <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
                  <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                    Quick Demo Authentication:
                  </div>
                  <button
                    type="button"
                    onClick={() => handleQuickSignIn('saiko.analyst@kryptx.ai', 'Saiko Nakalla')}
                    className="w-full py-2 px-3 rounded-lg bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-xs text-slate-300 hover:text-white flex items-center justify-between transition-colors"
                  >
                    <span>One-Click Sign In as Certified Analyst</span>
                    <span className="text-[10px] font-mono text-cyan-400">Saiko Nakalla →</span>
                  </button>
                </div>
              </div>
            ) : (
              /* TAB B: OFFICIAL ADMINISTRATOR SIGN-IN */
              <div className="space-y-4">
                <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-500/30 text-xs text-purple-200 flex items-start gap-2">
                  <Lock className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-white">Chief Intelligence Administrator Portal: </span>
                    Provides cryptographic access to AI training, reference sample ingestion, and knowledge directive releases.
                  </div>
                </div>

                {adminError && (
                  <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
                    {adminError}
                  </div>
                )}

                <form onSubmit={handleAdminSignIn} className="space-y-3">
                  <div>
                    <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
                      Official Administrator Email
                    </label>
                    <input
                      type="email"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 focus:border-purple-400 text-xs text-white outline-none transition-colors"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
                      Administrator Password
                    </label>
                    <input
                      type="password"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      placeholder="••••••••••••••••"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 focus:border-purple-400 text-xs text-white outline-none transition-colors"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={adminLoading}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-xs font-bold text-white shadow-lg shadow-purple-500/25 transition-all flex items-center justify-center gap-2 font-heading"
                  >
                    <span>{adminLoading ? 'Verifying Identity...' : 'Unlock Intelligence Training Center'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              </div>
            )}
          </div>
        ) : (
          /* ================= IF USER IS LOGGED IN ================= */
          <div className="space-y-4">
            {/* User Info Card */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-cyan-500/20 flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-md ${
                  user?.role === 'ADMIN'
                    ? 'bg-gradient-to-tr from-purple-500 to-pink-600 text-white'
                    : 'bg-gradient-to-tr from-cyan-500 to-violet-600 text-white'
                }`}
              >
                {user?.email.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                  <span>{user?.name || user?.email}</span>
                  {user?.role === 'ADMIN' && (
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40">
                      CHIEF ADMIN
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-400 truncate">{user?.email}</div>
                <div className="text-[10px] font-mono text-cyan-400 capitalize mt-0.5">
                  Role: {user?.role || 'ANALYST'} • Plan: {user?.tier}
                </div>
              </div>
            </div>

            {/* Plan Tier Selection */}
            {user?.role !== 'ADMIN' && (
              <div className="space-y-2">
                <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block">
                  Select Forensic Tier
                </label>

                <div
                  onClick={() => setSelectedTier('free')}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    selectedTier === 'free'
                      ? 'bg-cyan-950/30 border-cyan-500 text-white'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold">Standard Free Tier</div>
                      <div className="text-[11px] text-slate-400">10 forensic scans per day</div>
                    </div>
                    {selectedTier === 'free' && <Check className="w-4 h-4 text-cyan-400" />}
                  </div>
                </div>

                <div
                  onClick={() => setSelectedTier('pro')}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    selectedTier === 'pro'
                      ? 'bg-amber-950/30 border-amber-500 text-white'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                        <Crown className="w-3.5 h-3.5 text-amber-400" />
                        Pro Enterprise Plan
                      </div>
                      <div className="text-[11px] text-slate-400">Unlimited scans & video deepfake suite</div>
                    </div>
                    {selectedTier === 'pro' && <Check className="w-4 h-4 text-amber-400" />}
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              {user?.role !== 'ADMIN' && (
                <button
                  type="button"
                  onClick={handleSaveTier}
                  className="flex-1 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-xs font-bold text-slate-950 transition-colors shadow-md"
                >
                  {savedMessage ? 'Saved ✓' : 'Update Plan'}
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  onLogout();
                  onClose();
                }}
                className="flex-1 py-2.5 px-4 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-xs font-semibold text-rose-400 transition-colors flex items-center justify-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
