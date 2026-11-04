import React, { useState, useRef, useEffect } from 'react';
import { KryptxLogo } from './KryptxLogo';
import {
  ChevronDown,
  Menu,
  X,
  User,
  LogOut,
  RotateCw,
  ShieldCheck,
  Crown,
  Sparkles,
  Layers,
  ShieldAlert,
  Brain,
  Sliders,
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
    setAdminDropdownOpen(false);
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

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : user?.email ? user.email.charAt(0).toUpperCase() : 'A';

  return (
    <header className="sticky top-0 z-50 transition-all duration-200 bg-white/85 backdrop-blur-xl border-b border-[#E4DEFF] shadow-[0_2px_20px_rgba(85,21,216,0.04)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Left: KRYPTX Logo with Divider */}
          <div className="flex items-center gap-4">
            <KryptxLogo
              size="md"
              showWordmark={true}
              showCategory={false}
              onClick={() => handleNavClick('hero')}
            />
            <div className="hidden sm:block h-6 w-px bg-[#E4DEFF] ml-1" />
          </div>

          {/* Center: Navigation Menu */}
          <nav className="hidden lg:flex items-center gap-8">
            {/* Product with Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setProductDropdownOpen(true)}
              onMouseLeave={() => setProductDropdownOpen(false)}
            >
              <button
                onClick={() => handleNavClick('capabilities')}
                className="flex items-center gap-1.5 text-xs font-semibold text-[#525779] hover:text-[#5515D8] transition-colors py-2 tracking-wide cursor-pointer"
              >
                <span>Product</span>
                <ChevronDown className="w-3.5 h-3.5 text-[#525779] transition-transform duration-200" />
              </button>

              {productDropdownOpen && (
                <div className="absolute top-full left-0 w-64 p-2 rounded-2xl bg-white border border-[#E4DEFF] shadow-2xl backdrop-blur-2xl space-y-1 z-50">
                  <button
                    onClick={() => handleNavClick('capabilities')}
                    className="w-full text-left p-3 rounded-xl hover:bg-[#F8F7FF] transition-colors group cursor-pointer"
                  >
                    <div className="text-xs font-bold text-[#10132F] group-hover:text-[#5515D8]">
                      Image Forensics
                    </div>
                    <div className="text-[11px] text-[#525779]">
                      Diffusion, ELA & optical physics detection
                    </div>
                  </button>
                  <button
                    onClick={() => handleNavClick('capabilities')}
                    className="w-full text-left p-3 rounded-xl hover:bg-[#F8F7FF] transition-colors group cursor-pointer"
                  >
                    <div className="text-xs font-bold text-[#10132F] group-hover:text-[#5515D8]">
                      Video Deepfake Engine
                    </div>
                    <div className="text-[11px] text-[#525779]">
                      Temporal frame & lip-sync verification
                    </div>
                  </button>
                  <button
                    onClick={() => handleNavClick('capabilities')}
                    className="w-full text-left p-3 rounded-xl hover:bg-[#F8F7FF] transition-colors group cursor-pointer"
                  >
                    <div className="text-xs font-bold text-[#10132F] group-hover:text-[#5515D8]">
                      AI Voice Forensics
                    </div>
                    <div className="text-[11px] text-[#525779]">
                      Neural vocoder & acoustic cloning analysis
                    </div>
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={() => handleNavClick('technology')}
              className="text-xs font-semibold text-[#525779] hover:text-[#5515D8] transition-colors tracking-wide cursor-pointer"
            >
              Technology
            </button>

            <button
              onClick={() => handleNavClick('how-it-works')}
              className="text-xs font-semibold text-[#525779] hover:text-[#5515D8] transition-colors tracking-wide cursor-pointer"
            >
              Use Cases
            </button>

            <button
              onClick={() => handleNavClick('demo')}
              className="text-xs font-semibold text-[#525779] hover:text-[#5515D8] transition-colors tracking-wide flex items-center gap-1.5 cursor-pointer"
            >
              <span>Demo</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#5515D8] animate-pulse" />
            </button>

            <button
              onClick={() => handleNavClick('pricing')}
              className="text-xs font-semibold text-[#525779] hover:text-[#5515D8] transition-colors tracking-wide cursor-pointer"
            >
              Pricing
            </button>

            <button
              onClick={() => handleNavClick('about')}
              className="text-xs font-semibold text-[#525779] hover:text-[#5515D8] transition-colors tracking-wide cursor-pointer"
            >
              About
            </button>
          </nav>

          {/* Right: Actions Matching Reference */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Admin Intelligence Button */}
            <div
              className="relative"
              onMouseEnter={() => user?.role === 'ADMIN' && setAdminDropdownOpen(true)}
              onMouseLeave={() => setAdminDropdownOpen(false)}
            >
              <button
                onClick={() => {
                  if (user?.role === 'ADMIN') {
                    onNavigateAdmin?.('admin-intelligence');
                  } else {
                    onOpenAuth();
                  }
                }}
                className="px-4 py-2 rounded-full text-xs font-bold text-white bg-gradient-to-r from-[#3210A8] to-[#5515D8] hover:from-[#290c8c] hover:to-[#4510b0] shadow-md shadow-[#5515D8]/20 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Layers className="w-3.5 h-3.5 text-white" />
                <span>Admin Intelligence</span>
                {user?.role === 'ADMIN' && <ChevronDown className="w-3 h-3 text-white/80" />}
              </button>

              {/* Admin Menu for Admins */}
              {user?.role === 'ADMIN' && adminDropdownOpen && (
                <div className="absolute top-full right-0 w-72 p-2 mt-1 rounded-2xl bg-white border border-[#E4DEFF] shadow-2xl backdrop-blur-2xl space-y-1 z-50">
                  <button
                    onClick={() => {
                      setAdminDropdownOpen(false);
                      onNavigateAdmin?.('admin-intelligence');
                    }}
                    className="w-full text-left p-3 rounded-xl hover:bg-[#F8F7FF] transition-colors group cursor-pointer"
                  >
                    <div className="text-xs font-bold text-[#10132F] group-hover:text-[#5515D8] flex items-center justify-between">
                      <span>Intelligence Center</span>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-full bg-[#F1EEFF] text-[#5515D8] border border-[#E4DEFF]">
                        OVERVIEW
                      </span>
                    </div>
                    <div className="text-[11px] text-[#525779]">
                      System status, live models & audit logs
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setAdminDropdownOpen(false);
                      onNavigateAdmin?.('admin-training-image');
                    }}
                    className="w-full text-left p-3 rounded-xl hover:bg-[#F8F7FF] transition-colors group cursor-pointer"
                  >
                    <div className="text-xs font-bold text-[#10132F] group-hover:text-[#5515D8] flex items-center justify-between">
                      <span>Train Image Forensics AI</span>
                      <span className="text-[9px] font-mono text-[#5515D8]">DIFFUSION</span>
                    </div>
                    <div className="text-[11px] text-[#525779]">
                      Dataset calibration & model fine-tuning
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setAdminDropdownOpen(false);
                      onNavigateAdmin?.('admin-training-video');
                    }}
                    className="w-full text-left p-3 rounded-xl hover:bg-[#F8F7FF] transition-colors group cursor-pointer"
                  >
                    <div className="text-xs font-bold text-[#10132F] group-hover:text-[#5515D8] flex items-center justify-between">
                      <span>Train Video Deepfake AI</span>
                      <span className="text-[9px] font-mono text-[#1677FF]">TEMPORAL</span>
                    </div>
                    <div className="text-[11px] text-[#525779]">
                      Temporal flow & lip-sync calibration
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setAdminDropdownOpen(false);
                      onNavigateAdmin?.('admin-training-voice');
                    }}
                    className="w-full text-left p-3 rounded-xl hover:bg-[#F8F7FF] transition-colors group cursor-pointer"
                  >
                    <div className="text-xs font-bold text-[#10132F] group-hover:text-[#5515D8] flex items-center justify-between">
                      <span>Train Voice Forensics AI</span>
                      <span className="text-[9px] font-mono text-[#8B32FF]">VOCODER</span>
                    </div>
                    <div className="text-[11px] text-[#525779]">
                      Neural vocoder phase & acoustic cloning
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* Scans Button (Matches Reference) */}
            <button
              onClick={() => handleNavClick('history')}
              className="px-3.5 py-2 rounded-full text-xs font-bold text-[#5515D8] bg-[#F1EEFF] hover:bg-[#E8E2FF] border border-[#E4DEFF] transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <RotateCw className="w-3.5 h-3.5 text-[#5515D8]" />
              <span>Scans ({historyCount || 0})</span>
            </button>

            {/* User Profile / Avatar Pill */}
            {isAuthenticated && user ? (
              <div className="relative" ref={accountMenuRef}>
                <button
                  onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                  className="w-9 h-9 rounded-full bg-gradient-to-br from-[#5515D8] to-[#3210A8] text-white font-extrabold text-sm flex items-center justify-center shadow-md shadow-[#5515D8]/25 hover:scale-105 transition-transform cursor-pointer"
                  title={user.name || user.email}
                >
                  {userInitial}
                </button>

                {accountMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-72 rounded-2xl bg-white border border-[#E4DEFF] shadow-2xl backdrop-blur-2xl p-4 space-y-3 z-50">
                    <div className="flex items-center gap-3 pb-3 border-b border-[#E4DEFF]">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#5515D8] to-[#3210A8] text-white font-bold flex items-center justify-center text-base">
                        {userInitial}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-[#10132F] truncate">
                          {user.name || 'Forensics Analyst'}
                        </div>
                        <div className="text-[11px] text-[#525779] truncate font-mono">
                          {user.email}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs py-1">
                      <span className="text-[#525779]">Account Tier</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#F1EEFF] text-[#5515D8] border border-[#E4DEFF]">
                        {user.role === 'ADMIN' ? 'Administrator' : user.tier}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs py-1">
                      <span className="text-[#525779]">Daily Quota</span>
                      <span className="font-mono font-bold text-[#10132F]">
                        {user.scansToday} / {user.scanLimit || 10}
                      </span>
                    </div>

                    <button
                      onClick={onLogout}
                      className="w-full mt-2 py-2 px-3 rounded-xl bg-[#FFF1F2] hover:bg-[#FFE4E6] text-rose-600 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="w-9 h-9 rounded-full bg-[#5515D8] text-white font-bold text-sm flex items-center justify-center shadow-md shadow-[#5515D8]/20 hover:scale-105 transition-transform cursor-pointer"
              >
                A
              </button>
            )}
          </div>

          {/* Mobile Menu Hamburger */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={() => handleNavClick('history')}
              className="px-2.5 py-1.5 rounded-full text-xs font-bold text-[#5515D8] bg-[#F1EEFF] border border-[#E4DEFF]"
            >
              Scans ({historyCount || 0})
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-[#10132F] hover:bg-[#F1EEFF] transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#E4DEFF] bg-white px-4 pt-3 pb-6 space-y-3">
          <button
            onClick={() => handleNavClick('capabilities')}
            className="w-full text-left py-2 text-sm font-semibold text-[#10132F]"
          >
            Product
          </button>
          <button
            onClick={() => handleNavClick('technology')}
            className="w-full text-left py-2 text-sm font-semibold text-[#10132F]"
          >
            Technology
          </button>
          <button
            onClick={() => handleNavClick('how-it-works')}
            className="w-full text-left py-2 text-sm font-semibold text-[#10132F]"
          >
            Use Cases
          </button>
          <button
            onClick={() => handleNavClick('demo')}
            className="w-full text-left py-2 text-sm font-semibold text-[#5515D8]"
          >
            Demo
          </button>
          <button
            onClick={() => handleNavClick('pricing')}
            className="w-full text-left py-2 text-sm font-semibold text-[#10132F]"
          >
            Pricing
          </button>
          <button
            onClick={() => handleNavClick('about')}
            className="w-full text-left py-2 text-sm font-semibold text-[#10132F]"
          >
            About
          </button>

          <div className="pt-3 border-t border-[#E4DEFF] flex flex-col gap-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                if (user?.role === 'ADMIN') {
                  onNavigateAdmin?.('admin-intelligence');
                } else {
                  onOpenAuth();
                }
              }}
              className="w-full py-2.5 rounded-full text-xs font-bold text-white bg-gradient-to-r from-[#3210A8] to-[#5515D8] flex items-center justify-center gap-2"
            >
              <Layers className="w-4 h-4" />
              <span>Admin Intelligence</span>
            </button>

            {!isAuthenticated ? (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAuth();
                }}
                className="w-full py-2.5 rounded-full text-xs font-bold text-[#5515D8] bg-[#F1EEFF] border border-[#E4DEFF]"
              >
                Sign In
              </button>
            ) : (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onLogout();
                }}
                className="w-full py-2.5 rounded-full text-xs font-bold text-rose-600 bg-rose-50"
              >
                Sign Out
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
