import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HeroUpload } from './components/HeroUpload';
import { DetectionResultView } from './components/DetectionResultView';
import { HistoryDashboard } from './components/HistoryDashboard';
import { SampleShowcase } from './components/SampleShowcase';
import { SupabaseGuideModal } from './components/SupabaseGuideModal';
import { AdminAnalytics } from './components/AdminAnalytics';
import { AuthModal } from './components/AuthModal';
import { SAMPLE_SHOWCASE_IMAGES, SampleImageItem } from './data/sampleImages';
import { DetectionResult, UserProfile, PlatformStats } from './types/detector';
import { ShieldCheck, HelpCircle, Layers, Cpu, Eye, Lock, Zap } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'detector' | 'showcase' | 'history' | 'supabase' | 'analytics'>('detector');
  const [activeResult, setActiveResult] = useState<DetectionResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<DetectionResult[]>([]);
  const [isDark, setIsDark] = useState<boolean>(true);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);

  const [user, setUser] = useState<UserProfile>({
    id: 'user_analyst_saiko',
    email: 'saikonakalla939297@gmail.com',
    name: 'Saiko Nakalla',
    tier: 'free',
    scansToday: 0,
    scanLimit: 10,
  });

  const [stats, setStats] = useState<PlatformStats>({
    totalScans: 0,
    aiDetectedCount: 0,
    realDetectedCount: 0,
    inconclusiveCount: 0,
    averageConfidence: 87,
    averageLatencyMs: 1420,
    recentScans: [],
  });

  // Fetch initial history & stats on mount
  useEffect(() => {
    fetchHistory();
    fetchStats();
    fetchQuota();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await fetch(`/api/history?userId=${encodeURIComponent(user.id)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.records) {
          setHistory(data.records);
        }
      }
    } catch (err) {
      console.warn('Backend history fetch error, using client cache', err);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.warn('Backend stats fetch error', err);
    }
  };

  const fetchQuota = async () => {
    try {
      const res = await fetch(`/api/quota?userId=${encodeURIComponent(user.id)}`);
      if (res.ok) {
        const data = await res.json();
        setUser((prev) => ({
          ...prev,
          tier: data.tier || prev.tier,
          scansToday: data.scansToday || 0,
          scanLimit: data.scanLimit || 10,
        }));
      }
    } catch (err) {
      console.warn('Quota fetch error', err);
    }
  };

  // Analyze Image Handler
  const handleAnalyze = async (fileData: {
    base64: string;
    mimeType: string;
    name: string;
    size: number;
  }) => {
    setIsAnalyzing(true);
    setError(null);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: fileData.base64,
          mimeType: fileData.mimeType,
          fileName: fileData.name,
          fileSize: fileData.size,
          userId: user.id,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with status ${res.status}`);
      }

      const result: DetectionResult = await res.json();
      setActiveResult(result);
      setHistory((prev) => [result, ...prev]);
      setUser((prev) => ({ ...prev, scansToday: prev.scansToday + 1 }));
      fetchStats();
    } catch (err: any) {
      console.error('Analysis error:', err);
      setError(
        err.message ||
          'Analysis failed. Please verify the image file or server connection and try again.'
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Sample Selection
  const handleSelectSample = (sample: SampleImageItem) => {
    setActiveTab('detector');
    handleAnalyze({
      base64: sample.dataUrl,
      mimeType: sample.mimeType,
      name: sample.fileName,
      size: 450 * 1024,
    });
  };

  // Delete Record
  const handleDeleteRecord = async (id: string) => {
    try {
      await fetch(`/api/history/${id}`, { method: 'DELETE' });
      setHistory((prev) => prev.filter((r) => r.id !== id));
      if (activeResult?.id === id) {
        setActiveResult(null);
      }
      fetchStats();
    } catch (err) {
      console.error('Delete error', err);
    }
  };

  // Clear All
  const handleClearAll = async () => {
    if (!window.confirm('Are you sure you want to clear your entire forensic history?')) return;
    try {
      await fetch(`/api/history?userId=${encodeURIComponent(user.id)}`, { method: 'DELETE' });
      setHistory([]);
      fetchStats();
    } catch (err) {
      console.error('Clear error', err);
    }
  };

  // Update Tier
  const handleUpdateTier = async (newTier: 'free' | 'pro' | 'enterprise') => {
    try {
      await fetch('/api/auth/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, tier: newTier }),
      });
      setUser((prev) => ({
        ...prev,
        tier: newTier,
        scanLimit: newTier === 'free' ? 10 : 9999,
      }));
    } catch (err) {
      console.error('Profile update error', err);
    }
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-200 ${
        isDark ? 'bg-[#090d16] text-slate-100' : 'bg-slate-50 text-slate-900'
      }`}
    >
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab !== 'detector') {
            // Keep activeResult state intact so user can return to it
          }
        }}
        isDark={isDark}
        setIsDark={setIsDark}
        user={user}
        onOpenAuth={() => setAuthModalOpen(true)}
        historyCount={history.length}
      />

      {/* Main App Body */}
      <main className="pb-20">
        {activeTab === 'detector' && (
          <div>
            {activeResult ? (
              <DetectionResultView
                result={activeResult}
                onReset={() => setActiveResult(null)}
              />
            ) : (
              <>
                <HeroUpload
                  onAnalyze={handleAnalyze}
                  isAnalyzing={isAnalyzing}
                  onSelectSample={handleSelectSample}
                  samples={SAMPLE_SHOWCASE_IMAGES}
                  error={error}
                  onClearError={() => setError(null)}
                />

                {/* How It Works Section */}
                <div className="max-w-6xl mx-auto px-4 mt-20 pt-16 border-t border-slate-800/80">
                  <div className="text-center max-w-2xl mx-auto mb-12">
                    <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-2">
                      Precision Pipeline
                    </h3>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                      How VeritasAI Analyzes Authenticity
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-400 mt-2">
                      A multi-layered forensic inspection combining physical optics, frequency spectral analysis, and generative latent signature recognition.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3 relative group hover:border-slate-700 transition-all">
                      <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold text-sm">
                        01
                      </div>
                      <h4 className="text-base font-bold text-white">Stream & EXIF Ingestion</h4>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Extracts embedded camera hardware signatures, lens models, shutter speeds, and ISO profiles. Detects known generative software tags while safeguarding against metadata spoofing.
                      </p>
                    </div>

                    <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3 relative group hover:border-slate-700 transition-all">
                      <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold text-sm">
                        02
                      </div>
                      <h4 className="text-base font-bold text-white">Frequency & ELA Differencing</h4>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Computes Error Level Analysis (ELA) and Sobel gradient filters to highlight unnatural compression tolerances, edge sharpening boundaries, and synthetic micro-smoothing.
                      </p>
                    </div>

                    <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3 relative group hover:border-slate-700 transition-all">
                      <div className="w-10 h-10 rounded-xl bg-violet-500/10 text-violet-400 flex items-center justify-center font-bold text-sm">
                        03
                      </div>
                      <h4 className="text-base font-bold text-white">Multimodal Vision Reasoning</h4>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Evaluates physical optical laws—Snell's specular reflection, corneal catchlights, depth of field falloff, anatomical coherence, and generates an explainable forensic docket.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Frequently Asked Questions */}
                <div className="max-w-4xl mx-auto px-4 mt-20 pt-16 border-t border-slate-800/80">
                  <div className="text-center mb-10">
                    <h3 className="text-2xl font-bold text-white tracking-tight">
                      Frequently Asked Forensic Questions
                    </h3>
                  </div>

                  <div className="space-y-4 text-xs">
                    <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 space-y-1.5">
                      <div className="font-bold text-white text-sm">
                        Can AI image detectors be 100% accurate?
                      </div>
                      <p className="text-slate-400 leading-relaxed">
                        No scientific detector can claim 100% infallibility. As generative models improve and social media platforms re-compress images, false positives and false negatives can occur. VeritasAI is designed to provide calibrated probabilities and corroborating evidence.
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 space-y-1.5">
                      <div className="font-bold text-white text-sm">
                        Does missing EXIF metadata mean an image is AI generated?
                      </div>
                      <p className="text-slate-400 leading-relaxed">
                        Never. WhatsApp, Instagram, X (Twitter), and messaging apps strip EXIF data automatically for user privacy. VeritasAI treats missing EXIF as an inconclusive factor rather than proof of AI creation.
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 space-y-1.5">
                      <div className="font-bold text-white text-sm">
                        What does an "Inconclusive" verdict indicate?
                      </div>
                      <p className="text-slate-400 leading-relaxed">
                        An Inconclusive result is issued when an image is heavily compressed, low resolution, or contains mixed signals that prevent a high-confidence forensic classification under rigorous scientific standards.
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'showcase' && (
          <SampleShowcase onSelectSample={handleSelectSample} />
        )}

        {activeTab === 'history' && (
          <HistoryDashboard
            records={history}
            onSelectRecord={(rec) => {
              setActiveResult(rec);
              setActiveTab('detector');
            }}
            onDeleteRecord={handleDeleteRecord}
            onClearAll={handleClearAll}
            onAnalyzeNew={() => {
              setActiveResult(null);
              setActiveTab('detector');
            }}
          />
        )}

        {activeTab === 'supabase' && <SupabaseGuideModal />}

        {activeTab === 'analytics' && <AdminAnalytics stats={stats} records={history} />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/60 py-8 px-4 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
            <span className="font-bold text-slate-400">VeritasAI Forensic Suite</span>
            <span>•</span>
            <span>Version 3.8 Flash</span>
          </div>

          <div className="text-[11px] text-slate-500">
            Encrypted Server-Side Forensics • Supabase PostgreSQL Integrated • Non-Hallucinatory Calibration
          </div>
        </div>
      </footer>

      {/* Auth & Tier Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        user={user}
        onUpdateTier={handleUpdateTier}
      />
    </div>
  );
}
