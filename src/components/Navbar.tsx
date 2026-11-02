import React from 'react';
import { ShieldCheck, History, Database, BarChart3, Sun, Moon, Sparkles, User, Crown } from 'lucide-react';
import { UserProfile } from '../types/detector';

interface NavbarProps {
  activeTab: 'detector' | 'showcase' | 'history' | 'supabase' | 'analytics';
  setActiveTab: (tab: 'detector' | 'showcase' | 'history' | 'supabase' | 'analytics') => void;
  isDark: boolean;
  setIsDark: (val: boolean) => void;
  user: UserProfile;
  onOpenAuth: () => void;
  historyCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  isDark,
  setIsDark,
  user,
  onOpenAuth,
  historyCount,
}) => {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-md border-b transition-colors duration-200 border-slate-800/80 bg-slate-950/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div
            onClick={() => setActiveTab('detector')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-400 p-0.5 shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-all">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition-transform" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-white">
                  Veritas<span className="text-indigo-400">AI</span>
                </span>
                <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  Forensics v3.8
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Image Authenticity & Synthetic Media Detector
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-slate-800/60">
            <button
              onClick={() => setActiveTab('detector')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'detector'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/25'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Detector
            </button>

            <button
              onClick={() => setActiveTab('showcase')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'showcase'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/25'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              Examples
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'history'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/25'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              History
              {historyCount > 0 && (
                <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] bg-indigo-500/20 text-indigo-300 font-bold">
                  {historyCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('supabase')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'supabase'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/25'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              Supabase & RLS
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'analytics'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/25'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              Analytics
            </button>
          </nav>

          {/* User Controls */}
          <div className="flex items-center gap-2.5">
            {/* Quota Badge */}
            <div
              onClick={onOpenAuth}
              className="cursor-pointer hidden sm:flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all text-xs"
            >
              {user.tier === 'pro' || user.tier === 'enterprise' ? (
                <div className="flex items-center gap-1.5 text-amber-400 font-semibold">
                  <Crown className="w-3.5 h-3.5" />
                  <span>Pro Plan</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-slate-300">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>
                    {Math.max(0, user.scanLimit - user.scansToday)} / {user.scanLimit} scans left
                  </span>
                </div>
              )}
            </div>

            {/* Profile Avatar / Trigger */}
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-indigo-500/50 transition-all text-xs font-medium text-slate-300"
              title="User Account & Tier Settings"
            >
              <div className="w-7 h-7 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs">
                {user.email.charAt(0).toUpperCase()}
              </div>
              <span className="hidden lg:inline text-xs max-w-[120px] truncate text-slate-300">
                {user.email.split('@')[0]}
              </span>
            </button>

            {/* Dark / Light Mode Toggle */}
            <button
              onClick={() => setIsDark(!isDark)}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
            </button>
          </div>
        </div>

        {/* Mobile Submenu Bar */}
        <div className="flex md:hidden overflow-x-auto py-2 gap-1 border-t border-slate-900">
          <button
            onClick={() => setActiveTab('detector')}
            className={`px-3 py-1 rounded text-xs whitespace-nowrap font-medium ${
              activeTab === 'detector' ? 'bg-indigo-600 text-white' : 'text-slate-400'
            }`}
          >
            Detector
          </button>
          <button
            onClick={() => setActiveTab('showcase')}
            className={`px-3 py-1 rounded text-xs whitespace-nowrap font-medium ${
              activeTab === 'showcase' ? 'bg-indigo-600 text-white' : 'text-slate-400'
            }`}
          >
            Examples
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1 rounded text-xs whitespace-nowrap font-medium ${
              activeTab === 'history' ? 'bg-indigo-600 text-white' : 'text-slate-400'
            }`}
          >
            History ({historyCount})
          </button>
          <button
            onClick={() => setActiveTab('supabase')}
            className={`px-3 py-1 rounded text-xs whitespace-nowrap font-medium ${
              activeTab === 'supabase' ? 'bg-indigo-600 text-white' : 'text-slate-400'
            }`}
          >
            Supabase
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-3 py-1 rounded text-xs whitespace-nowrap font-medium ${
              activeTab === 'analytics' ? 'bg-indigo-600 text-white' : 'text-slate-400'
            }`}
          >
            Analytics
          </button>
        </div>
      </div>
    </header>
  );
};
