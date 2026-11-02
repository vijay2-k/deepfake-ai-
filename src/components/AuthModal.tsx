import React, { useState } from 'react';
import { X, Crown, Shield, User, Check, Zap, Sparkles } from 'lucide-react';
import { UserProfile } from '../types/detector';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onUpdateTier: (tier: 'free' | 'pro' | 'enterprise') => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  user,
  onUpdateTier,
}) => {
  const [selectedTier, setSelectedTier] = useState<'free' | 'pro' | 'enterprise'>(user.tier);
  const [savedMessage, setSavedMessage] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    onUpdateTier(selectedTier);
    setSavedMessage(true);
    setTimeout(() => {
      setSavedMessage(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-indigo-400" />
            <h3 className="text-lg font-bold text-white">Account & Forensic Quota</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* User Info */}
        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-sm">
            {user.email.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-bold text-white truncate">{user.email}</div>
            <div className="text-[11px] text-slate-400 capitalize">
              Role: Forensic Analyst • Plan: {user.tier}
            </div>
          </div>
        </div>

        {/* Plan Selection */}
        <div className="space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Select Forensic Tier
          </label>

          {/* Free Tier */}
          <div
            onClick={() => setSelectedTier('free')}
            className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
              selectedTier === 'free'
                ? 'bg-indigo-950/30 border-indigo-500 text-white'
                : 'bg-slate-950/50 border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold">Standard Free Tier</div>
                <div className="text-[11px] text-slate-400">10 forensic scans per day</div>
              </div>
              {selectedTier === 'free' && <Check className="w-4 h-4 text-indigo-400" />}
            </div>
          </div>

          {/* Pro Tier */}
          <div
            onClick={() => setSelectedTier('pro')}
            className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
              selectedTier === 'pro'
                ? 'bg-indigo-950/30 border-amber-500 text-white'
                : 'bg-slate-950/50 border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <Crown className="w-3.5 h-3.5 text-amber-400" />
                  Pro Enterprise Plan
                </div>
                <div className="text-[11px] text-slate-400">
                  Unlimited high-resolution scans, batch processing & deep EXIF reports
                </div>
              </div>
              {selectedTier === 'pro' && <Check className="w-4 h-4 text-amber-400" />}
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <button
            onClick={handleSave}
            className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white transition-all shadow-md shadow-indigo-600/30"
          >
            {savedMessage ? 'Preferences Updated!' : 'Save & Activate Plan'}
          </button>
        </div>
      </div>
    </div>
  );
};
