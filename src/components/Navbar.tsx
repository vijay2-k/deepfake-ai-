import React from 'react';
import { History, Database, BarChart3, Sun, Moon, Sparkles, Crown, Image as ImageIcon, Video, Mic } from 'lucide-react';
import { UserProfile } from '../types/detector';
import { KryptxLogo } from './KryptxLogo';

interface NavbarProps {
  activeTab: 'detector' | 'showcase' | 'history' | 'supabase' | 'analytics';
  setActiveTab: (tab: 'detector' | 'showcase' | 'history' | 'supabase' | 'analytics') => void;
  activeDetector?: 'image' | 'video' | 'audio';
  setActiveDetector?: (mode: 'image' | 'video' | 'audio') => void;
  isDark: boolean;
  setIsDark: (val: boolean) => void;
  user: UserProfile;
  onOpenAuth: () => void;
  historyCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  activeDetector = 'image',
  setActiveDetector,
  isDark,
  setIsDark,
  user,
  onOpenAuth,
  historyCount,
}) => {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-md border-b transition-colors duration-200 border-slate-800/80 bg-[#F8F7FF]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div
            onClick={() => setActiveTab('detector')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <KryptxLogo size="sm" showWordmark={true} showCategory={true} />
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-white/60 p-1 rounded-xl border border-slate-800/60">
            <button
              onClick={() => setActiveTab('detector')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'detector'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/25'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Detectors
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
              Supabase SQL
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
            {/* Unlimited / Fair Use Quota Badge */}
            <div
              onClick={onOpenAuth}
              className="cursor-pointer hidden sm:flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white border border-slate-800 hover:border-slate-700 transition-all text-xs"
            >
              {user.tier === 'pro' || user.tier === 'enterprise' ? (
                <div className="flex items-center gap-1.5 text-amber-400 font-semibold">
                  <Crown className="w-3.5 h-3.5" />
                  <span>Pro Unrestricted</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Fair Use Active ({user.scansToday || 0} scans today)</span>
                </div>
              )}
            </div>

            {/* Profile Avatar / Trigger */}
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-2 p-1.5 rounded-lg bg-white border border-slate-800 hover:border-indigo-500/50 transition-all text-xs font-medium text-slate-300"
              title="User Account & Policy Settings"
            >
              <div className="w-7 h-7 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs">
                {user.email.charAt(0).toUpperCase()}
              </div>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
