import React, { useState, useRef, useEffect } from 'react';
import { KryptxLogo } from './KryptxLogo';
import {
  ChevronDown,
  ArrowRight,
  Menu,
  X,
  User,
  LogOut,
  History,
  ShieldCheck,
  Crown,
  Sparkles,
  Brain,
  ShieldAlert,
} from 'lucide-react';
import { UserProfile } from '../types/detector';

interface KryptxNavbarProps {
  onOpenAuth: () => void;
  onTryDemo: () => void;
  onNavigateSection?: (sectionId: string) => void;
  onNavigateView?: (view: 'home' | 'detector' | 'history' | 'showcase' | 'analytics') => void;
  onNavigateAdmin?: (view: 'admin-intelligence' | 'admin-training-image' | 'admin-training-video' | 'admin-training-voice') => void;
  user: UserProfile | null;
  isAuthenticated: boolean;
  onLogout: () => void;
  historyCount?: number;
  onOpenHistory?: () => void;
}

export const KryptxNavbar: React.FC<KryptxNavbarProps> = ({
  onOpenAuth,
  onTryDemo,
  onNavigateSection,
  onNavigateView,
  onNavigateAdmin,
  user,
  isAuthenticated,
  onLogout,
  historyCount = 0,
  onOpenHistory,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [productDropdownOpen, setProductDropdownOpen] = useState(false);
  const [adminDropdownOpen, setAdminDropdownOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement>(null);

  // Close account dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(e.target as Node)) {
        setAccountMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNavClick = (sectionId: string) => {
    setMobileMenuOpen(false);
    setProductDropdownOpen(false);
    setAccountMenuOpen(false);

    if (sectionId === 'demo' || sectionId === 'detector') {
      if (onNavigateView) onNavigateView('detector');
      else onTryDemo();
      return;
    }

    if (sectionId === 'history') {
      if (onNavigateView) onNavigateView('history');
      else if (onOpenHistory) onOpenHistory();
      return;
    }

    if (onNavigateSection) {
      onNavigateSection(sectionId);
    } else {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <header className="sticky top-0 z-50 transition-all duration-200 bg-[#080F20] border-b border-[rgba(0,229,255,0.18)] shadow-[0_4px_30px_rgba(0,0,0,0.5)] backdrop-blur-md">
      {/* Subtle Cyan / Violet Ambient Glow Line along top */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#00E5FF]/40 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Left: KRYPTX Logo */}
          <div className="flex items-center gap-4">
            <KryptxLogo
              size="md"
              showWordmark={true}
              showCategory={false}
              onClick={() => handleNavClick('hero')}
            />
          </div>

          {/* Center: Navigation Menu */}
          <nav className="hidden lg:flex items-center gap-7">
            {/* Product with Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setProductDropdownOpen(true)}
              onMouseLeave={() => setProductDropdownOpen(false)}
            >
              <button
                onClick={() => handleNavClick('capabilities')}
                className="flex items-center gap-1.5 text-xs font-medium text-slate-300 hover:text-white transition-colors py-2 tracking-wide"
              >
                <span>Product</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {productDropdownOpen && (
                <div className="absolute top-full left-0 w-64 p-2 rounded-xl bg-[#080F20] border border-cyan-500/25 shadow-2xl backdrop-blur-2xl space-y-1 z-50">
                  <button
                    onClick={() => handleNavClick('capabilities')}
                    className="w-full text-left p-2.5 rounded-lg hover:bg-slate-900/80 transition-colors group"
                  >
                    <div className="text-xs font-semibold text-white group-hover:text-cyan-400">
                      Image Forensics
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Diffusion, ELA & optical physics detection
                    </div>
                  </button>
                  <button
                    onClick={() => handleNavClick('capabilities')}
                    className="w-full text-left p-2.5 rounded-lg hover:bg-slate-900/80 transition-colors group"
                  >
                    <div className="text-xs font-semibold text-white group-hover:text-cyan-400">
                      Video Deepfake Engine
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Temporal frame & lip-sync verification
                    </div>
                  </button>
                  <button
                    onClick={() => handleNavClick('capabilities')}
                    className="w-full text-left p-2.5 rounded-lg hover:bg-slate-900/80 transition-colors group"
                  >
                    <div className="text-xs font-semibold text-white group-hover:text-cyan-400">
                      AI Voice Forensics
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Neural vocoder & acoustic cloning analysis
                    </div>
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={() => handleNavClick('technology')}
              className="text-xs font-medium text-slate-300 hover:text-white transition-colors tracking-wide"
            >
              Technology
            </button>

            <button
              onClick={() => handleNavClick('how-it-works')}
              className="text-xs font-medium text-slate-300 hover:text-white transition-colors tracking-wide"
            >
              Use Cases
            </button>

            <button
              onClick={() => handleNavClick('demo')}
              className="text-xs font-medium text-slate-300 hover:text-cyan-300 transition-colors tracking-wide flex items-center gap-1.5"
            >
              <span>Demo</span>
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            </button>

            <button
              onClick={() => handleNavClick('pricing')}
              className="text-xs font-medium text-slate-300 hover:text-white transition-colors tracking-wide"
            >
              Pricing
            </button>

            <button
              onClick={() => handleNavClick('about')}
              className="text-xs font-medium text-slate-300 hover:text-white transition-colors tracking-wide"
            >
              About
            </button>

            {/* Official Administrator Intelligence Menu (Visible strictly for ADMIN) */}
            {user?.role === 'ADMIN' && (
              <div
                className="relative"
                onMouseEnter={() => setAdminDropdownOpen(true)}
                onMouseLeave={() => setAdminDropdownOpen(false)}
              >
                <button
                  onClick={() => onNavigateAdmin?.('admin-intelligence')}
                  className="flex items-center gap-1.5 text-xs font-semibold text-purple-300 hover:text-white transition-colors py-1 px-2.5 rounded-lg bg-purple-500/15 border border-purple-500/35 shadow-[0_0_12px_rgba(179,136,255,0.2)]"
                >
                  <Brain className="w-3.5 h-3.5 text-purple-400" />
                  <span>Admin Intelligence</span>
                  <ChevronDown className="w-3 h-3 text-purple-400" />
                </button>

                {adminDropdownOpen && (
                  <div className="absolute top-full left-0 w-72 p-2 rounded-xl bg-[#080F20] border border-purple-500/35 shadow-2xl backdrop-blur-2xl space-y-1 z-50">
                    <button
                      onClick={() => {
                        setAdminDropdownOpen(false);
                        onNavigateAdmin?.('admin-intelligence');
                      }}
                      className="w-full text-left p-2.5 rounded-lg hover:bg-slate-900/80 transition-colors group"
                    >
                      <div className="text-xs font-bold text-white group-hover:text-purple-300 flex items-center justify-between">
                        <span>Intelligence Control Center</span>
                        <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          PORTAL
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Overview, engine status & audit logs
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setAdminDropdownOpen(false);
                        onNavigateAdmin?.('admin-training-image');
                      }}
                      className="w-full text-left p-2.5 rounded-lg hover:bg-slate-900/80 transition-colors group"
                    >
                      <div className="text-xs font-bold text-white group-hover:text-cyan-400 flex items-center justify-between">
                        <span>Train Image Forensics AI</span>
                        <span className="text-[9px] font-mono text-cyan-400">DIFFUSION</span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Diffusion, ELA & optical physics calibration
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setAdminDropdownOpen(false);
                        onNavigateAdmin?.('admin-training-video');
                      }}
                      className="w-full text-left p-2.5 rounded-lg hover:bg-slate-900/80 transition-colors group"
                    >
                      <div className="text-xs font-bold text-white group-hover:text-blue-400 flex items-center justify-between">
                        <span>Train Video Deepfake AI</span>
                        <span className="text-[9px] font-mono text-blue-400">TEMPORAL</span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Temporal flow & lip-sync calibration
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setAdminDropdownOpen(false);
                        onNavigateAdmin?.('admin-training-voice');
                      }}
                      className="w-full text-left p-2.5 rounded-lg hover:bg-slate-900/80 transition-colors group"
                    >
                      <div className="text-xs font-bold text-white group-hover:text-purple-400 flex items-center justify-between">
                        <span>Train Voice Forensics AI</span>
                        <span className="text-[9px] font-mono text-purple-400">VOCODER</span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Neural vocoder phase & acoustic cloning
                      </div>
                    </button>
                  </div>
                )}
              </div>
            )}
          </nav>

          {/* Right: Authentication-Aware Actions */}
          <div className="hidden sm:flex items-center gap-3">
            
            {/* If user is NOT logged in: Show "Log In" and "Try KRYPTX Free ->" */}
            {!isAuthenticated ? (
              <>
                <button
                  onClick={onOpenAuth}
                  className="px-4 py-2 rounded-full text-xs font-medium text-slate-200 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 transition-all duration-200"
                >
                  Log In
                </button>

                <button
                  onClick={onTryDemo}
                  className="relative group px-5 py-2.5 rounded-full text-xs font-semibold text-white overflow-hidden shadow-[0_0_24px_rgba(255,157,50,0.3)] hover:shadow-[0_0_30px_rgba(255,157,50,0.5)] transition-all duration-300 flex items-center gap-1.5"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[#FF9D32] via-[#FF6B35] to-[#E63946] group-hover:scale-105 transition-transform duration-300" />
                  <span className="relative z-10 flex items-center gap-1.5">
                    <span>Try KRYPTX Free</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </button>
              </>
            ) : (
              /* When user IS logged in: REMOVE Log In and Try Free! Show Account Menu & Avatar */
              <div className="flex items-center gap-3">
                {/* Scan History Pill Button */}
                {historyCount > 0 && (
                  <button
                    onClick={() => handleNavClick('history')}
                    className="px-3 py-1.5 rounded-full text-xs font-mono text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 hover:bg-cyan-500/20 transition-all flex items-center gap-1.5"
                  >
                    <History className="w-3.5 h-3.5" />
                    <span>Scans ({historyCount})</span>
                  </button>
                )}

                {/* Account / Profile Dropdown */}
                <div className="relative" ref={accountMenuRef}>
                  <button
                    onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                    className="flex items-center gap-2 p-1.5 pr-3 rounded-full bg-slate-900/90 border border-cyan-500/30 hover:border-cyan-400 text-slate-200 hover:text-white transition-all"
                  >
                    {/* User Avatar Circle */}
                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-cyan-500 to-violet-600 flex items-center justify-center text-xs font-bold text-white shadow-sm">
                      {user?.email?.charAt(0).toUpperCase() || 'U'}
                    </div>

                    <div className="flex flex-col text-left">
                      <span className="text-xs font-semibold leading-none truncate max-w-[110px]">
                        {user?.name || user?.email?.split('@')[0] || 'Analyst'}
                      </span>
                      <span className="text-[10px] font-mono text-cyan-400 capitalize leading-tight">
                        {user?.tier || 'Free'} Plan
                      </span>
                    </div>

                    <ChevronDown className="w-3 h-3 text-slate-400 ml-0.5" />
                  </button>

                  {/* Dropdown Menu */}
                  {accountMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-56 p-2 rounded-xl bg-[#080F20] border border-cyan-500/30 shadow-2xl backdrop-blur-2xl space-y-1 z-50">
                      <div className="px-3 py-2 border-b border-slate-800">
                        <div className="text-xs font-bold text-white truncate">{user?.email}</div>
                        <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                          Daily Quota: {user?.scansToday || 0}/{user?.scanLimit || 10} scans
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setAccountMenuOpen(false);
                          if (onNavigateView) onNavigateView('detector');
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg text-xs text-slate-300 hover:text-white hover:bg-slate-900 flex items-center gap-2 transition-colors"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Forensic Detector</span>
                      </button>

                      {user?.role === 'ADMIN' && (
                        <button
                          onClick={() => {
                            setAccountMenuOpen(false);
                            onNavigateAdmin?.('admin-intelligence');
                          }}
                          className="w-full text-left px-3 py-2 rounded-lg text-xs text-purple-300 hover:text-white hover:bg-purple-950/40 flex items-center gap-2 transition-colors border border-purple-500/30"
                        >
                          <Brain className="w-3.5 h-3.5 text-purple-400" />
                          <span>Intelligence Control Center</span>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setAccountMenuOpen(false);
                          if (onNavigateView) onNavigateView('history');
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg text-xs text-slate-300 hover:text-white hover:bg-slate-900 flex items-center gap-2 transition-colors"
                      >
                        <History className="w-3.5 h-3.5 text-blue-400" />
                        <span>My Scan Dossiers</span>
                      </button>

                      <button
                        onClick={() => {
                          setAccountMenuOpen(false);
                          onOpenAuth();
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg text-xs text-slate-300 hover:text-white hover:bg-slate-900 flex items-center gap-2 transition-colors"
                      >
                        <Crown className="w-3.5 h-3.5 text-amber-400" />
                        <span>Upgrade / Manage Plan</span>
                      </button>

                      <div className="pt-1 border-t border-slate-800">
                        <button
                          onClick={() => {
                            setAccountMenuOpen(false);
                            onLogout();
                          }}
                          className="w-full text-left px-3 py-2 rounded-lg text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 flex items-center gap-2 transition-colors"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Log Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Slide-down Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-cyan-500/20 bg-[#080F20] px-6 py-6 space-y-4">
          <nav className="flex flex-col space-y-3">
            <button
              onClick={() => handleNavClick('capabilities')}
              className="text-left text-sm font-medium text-slate-300 hover:text-cyan-400 py-1"
            >
              Product
            </button>
            <button
              onClick={() => handleNavClick('technology')}
              className="text-left text-sm font-medium text-slate-300 hover:text-cyan-400 py-1"
            >
              Technology
            </button>
            <button
              onClick={() => handleNavClick('how-it-works')}
              className="text-left text-sm font-medium text-slate-300 hover:text-cyan-400 py-1"
            >
              Use Cases
            </button>
            <button
              onClick={() => handleNavClick('demo')}
              className="text-left text-sm font-medium text-slate-300 hover:text-cyan-400 py-1"
            >
              Live Demo
            </button>
            <button
              onClick={() => handleNavClick('pricing')}
              className="text-left text-sm font-medium text-slate-300 hover:text-cyan-400 py-1"
            >
              Pricing
            </button>
            <button
              onClick={() => handleNavClick('about')}
              className="text-left text-sm font-medium text-slate-300 hover:text-cyan-400 py-1"
            >
              About
            </button>

            {/* Mobile Admin Navigation */}
            {user?.role === 'ADMIN' && (
              <div className="pt-2 border-t border-slate-800 space-y-1">
                <div className="text-[10px] font-mono text-purple-400 uppercase tracking-wider">
                  Admin Governance:
                </div>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onNavigateAdmin?.('admin-intelligence');
                  }}
                  className="text-left text-sm font-semibold text-purple-300 hover:text-white py-1 flex items-center gap-2"
                >
                  <Brain className="w-4 h-4 text-purple-400" />
                  <span>Intelligence Control Center</span>
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onNavigateAdmin?.('admin-training-image');
                  }}
                  className="text-left text-xs font-mono text-cyan-300 hover:text-white py-1 pl-6 block"
                >
                  • Train Image Forensics AI
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onNavigateAdmin?.('admin-training-video');
                  }}
                  className="text-left text-xs font-mono text-blue-300 hover:text-white py-1 pl-6 block"
                >
                  • Train Video Deepfake AI
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onNavigateAdmin?.('admin-training-voice');
                  }}
                  className="text-left text-xs font-mono text-purple-300 hover:text-white py-1 pl-6 block"
                >
                  • Train Voice Forensics AI
                </button>
              </div>
            )}
          </nav>

          <div className="pt-4 border-t border-slate-800/80 flex flex-col gap-3">
            {!isAuthenticated ? (
              <>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuth();
                  }}
                  className="w-full py-2.5 rounded-xl text-xs font-semibold text-white bg-slate-900 border border-slate-700 text-center"
                >
                  Log In
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onTryDemo();
                  }}
                  className="w-full py-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-[#FF9D32] to-[#E63946] text-center shadow-lg"
                >
                  Try KRYPTX Free →
                </button>
              </>
            ) : (
              <div className="space-y-2">
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <div className="text-xs text-white truncate">{user?.email}</div>
                  <span className="text-[10px] font-mono text-cyan-400 uppercase">{user?.tier}</span>
                </div>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onLogout();
                  }}
                  className="w-full py-2 rounded-xl text-xs font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/20 text-center"
                >
                  Log Out
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
