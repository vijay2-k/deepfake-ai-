import React, { useState, useEffect } from 'react';
import { KryptxNavbar } from './components/KryptxNavbar';
import { KryptxHero } from './components/KryptxHero';
import { HowKryptxWorks } from './components/HowKryptxWorks';
import { KeyCapabilities } from './components/KeyCapabilities';
import { KryptxFooter } from './components/KryptxFooter';
import { ParticleWaveBackground } from './components/ParticleWaveBackground';
import { HeroUpload } from './components/HeroUpload';
import { DetectionResultView } from './components/DetectionResultView';
import { HistoryDashboard } from './components/HistoryDashboard';
import { SampleShowcase } from './components/SampleShowcase';
import { SupabaseGuideModal } from './components/SupabaseGuideModal';
import { AdminAnalytics } from './components/AdminAnalytics';
import { AuthModal } from './components/AuthModal';
import { SAMPLE_SHOWCASE_IMAGES, SampleImageItem } from './data/sampleImages';
import { DetectionResult, UserProfile, PlatformStats } from './types/detector';
import { ArrowLeft, ShieldCheck, RotateCcw, Plus, Download, ShieldAlert } from 'lucide-react';
import { AdminIntelligenceCenter } from './components/AdminIntelligenceCenter';
import { AdminTrainingWorkspace } from './components/AdminTrainingWorkspace';

type PageView =
  | 'home'
  | 'detector'
  | 'history'
  | 'showcase'
  | 'analytics'
  | 'supabase'
  | 'admin-intelligence'
  | 'admin-training-image'
  | 'admin-training-video'
  | 'admin-training-voice';

export function App() {
  // Page view routing with URL synchronization
  const [pageView, setPageView] = useState<PageView>(() => {
    if (typeof window === 'undefined') return 'home';
    const p = window.location.pathname.toLowerCase();
    if (p === '/admin/intelligence/image') return 'admin-training-image';
    if (p === '/admin/intelligence/video') return 'admin-training-video';
    if (p === '/admin/intelligence/voice') return 'admin-training-voice';
    if (p.startsWith('/admin/intelligence') || p === '/admin') return 'admin-intelligence';
    if (p === '/demo' || p === '/detector') return 'detector';
    if (p === '/history') return 'history';
    if (p === '/showcase') return 'showcase';
    if (p === '/analytics') return 'analytics';
    if (p === '/supabase') return 'supabase';
    return 'home';
  });

  // Active scan result with safe sessionStorage persistence across manual browser refresh
  const [activeResult, setActiveResult] = useState<DetectionResult | null>(() => {
    try {
      const saved = sessionStorage.getItem('kryptx_active_scan');
      if (saved) return JSON.parse(saved);
    } catch {}
    return null;
  });

  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<DetectionResult[]>([]);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);

  // Authentication State: Check if user is logged in
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return localStorage.getItem('kryptx_auth_logged_in') === 'true';
    } catch {
      return false;
    }
  });

  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('kryptx_auth_user');
      if (saved) return JSON.parse(saved);
    } catch {}
    return null;
  });

  const [stats, setStats] = useState<PlatformStats>({
    totalScans: 0,
    imageScansCount: 0,
    videoScansCount: 0,
    audioScansCount: 0,
    aiDetectedCount: 0,
    realDetectedCount: 0,
    inconclusiveCount: 0,
    averageConfidence: 87,
    averageLatencyMs: 1420,
    recentScans: [],
  });

  // Verify administrator token on mount
  useEffect(() => {
    const token = localStorage.getItem('kryptx_admin_token');
    if (token) {
      fetch('/api/admin/verify', {
        headers: {
          Authorization: `Bearer ${token}`,
          'x-admin-token': token,
        },
      })
        .then((res) => {
          if (res.ok) return res.json();
          throw new Error('Expired');
        })
        .then((data) => {
          if (data.valid && data.user) {
            const adminProfile: UserProfile = {
              id: 'admin_official',
              email: data.user.email,
              name: data.user.name,
              tier: 'enterprise',
              role: 'ADMIN',
              scansToday: 0,
              imageScansToday: 0,
              videoScansToday: 0,
              audioScansToday: 0,
              scanLimit: 99999,
              isUnlimited: true,
              adminToken: token,
            };
            setUser(adminProfile);
            setIsAuthenticated(true);
          }
        })
        .catch(() => {
          localStorage.removeItem('kryptx_admin_token');
        });
    }
  }, []);

  // URL Path & Popstate sync
  useEffect(() => {
    const handlePopState = () => {
      const p = window.location.pathname.toLowerCase();
      if (p === '/admin/intelligence/image') setPageView('admin-training-image');
      else if (p === '/admin/intelligence/video') setPageView('admin-training-video');
      else if (p === '/admin/intelligence/voice') setPageView('admin-training-voice');
      else if (p.startsWith('/admin/intelligence') || p === '/admin') setPageView('admin-intelligence');
      else if (p === '/demo' || p === '/detector') setPageView('detector');
      else if (p === '/history') setPageView('history');
      else if (p === '/showcase') setPageView('showcase');
      else if (p === '/analytics') setPageView('analytics');
      else if (p === '/supabase') setPageView('supabase');
      else setPageView('home');
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateToView = (view: PageView, updateHistory = true) => {
    setPageView(view);
    if (updateHistory && typeof window !== 'undefined') {
      let targetPath = '/';
      if (view === 'detector') targetPath = '/demo';
      else if (view === 'admin-intelligence') targetPath = '/admin/intelligence';
      else if (view === 'admin-training-image') targetPath = '/admin/intelligence/image';
      else if (view === 'admin-training-video') targetPath = '/admin/intelligence/video';
      else if (view === 'admin-training-voice') targetPath = '/admin/intelligence/voice';
      else if (view !== 'home') targetPath = `/${view}`;

      if (window.location.pathname !== targetPath) {
        window.history.pushState({}, '', targetPath);
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // User ID fallback for guest or authenticated analyst
  const currentUserId = user?.id || 'analyst_guest';

  // Fetch initial history & stats on mount
  useEffect(() => {
    fetchHistory(currentUserId);
    fetchStats();
    if (user?.id) {
      fetchQuota(user.id);
    }
  }, [user?.id]);

  const fetchHistory = async (uid: string) => {
    try {
      const res = await fetch(`/api/history?userId=${encodeURIComponent(uid)}`);
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

  const fetchQuota = async (uid: string) => {
    try {
      const res = await fetch(`/api/quota?userId=${encodeURIComponent(uid)}`);
      if (res.ok) {
        const data = await res.json();
        setUser((prev) =>
          prev
            ? {
                ...prev,
                tier: data.tier || prev.tier,
                scansToday: data.scansToday || 0,
                scanLimit: data.scanLimit || 10,
              }
            : null
        );
      }
    } catch (err) {
      console.warn('Quota fetch error', err);
    }
  };

  // Multimodal Analyze Handler
  const handleAnalyze = async (fileData: {
    file?: File;
    base64: string;
    mimeType: string;
    name: string;
    size: number;
    mediaType?: 'image' | 'video' | 'audio';
  }) => {
    setIsAnalyzing(true);
    setUploadProgress(0);
    setError(null);

    const mediaType = fileData.mediaType || 'image';
    const endpoint =
      mediaType === 'video'
        ? '/api/analyze/video'
        : mediaType === 'audio'
        ? '/api/analyze/audio'
        : '/api/analyze';

    try {
      let result: DetectionResult;

      if (fileData.file) {
        // Multipart/form-data upload using XMLHttpRequest for real upload percentage tracking
        const formData = new FormData();
        formData.append('file', fileData.file);
        formData.append('fileName', fileData.name);
        formData.append('mimeType', fileData.mimeType);
        formData.append('fileSize', String(fileData.size));
        formData.append('userId', currentUserId);

        result = await new Promise<DetectionResult>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open('POST', endpoint, true);

          xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
              const percent = Math.round((event.loaded / event.total) * 100);
              setUploadProgress(percent);
            }
          };

          const timeoutId = setTimeout(() => {
            xhr.abort();
            reject(new Error(`Analysis request for ${mediaType} timed out after 60 seconds.`));
          }, 60000);

          xhr.onload = () => {
            clearTimeout(timeoutId);
            setUploadProgress(100);
            if (xhr.status >= 200 && xhr.status < 300) {
              try {
                const parsed = JSON.parse(xhr.responseText);
                resolve(parsed);
              } catch (e) {
                reject(new Error('Invalid JSON response from server'));
              }
            } else {
              try {
                const errJson = JSON.parse(xhr.responseText);
                reject(new Error(errJson.error || `Server responded with status ${xhr.status}`));
              } catch {
                reject(new Error(`Server responded with status ${xhr.status}`));
              }
            }
          };

          xhr.onerror = () => {
            clearTimeout(timeoutId);
            reject(new Error('Network error during media upload'));
          };

          xhr.onabort = () => {
            clearTimeout(timeoutId);
            reject(new Error(`Analysis request for ${mediaType} timed out.`));
          };

          xhr.send(formData);
        });
      } else {
        // Fallback for sample showcase or pre-loaded base64 JSON
        const bodyPayload =
          mediaType === 'video'
            ? { videoBase64: fileData.base64, mimeType: fileData.mimeType, fileName: fileData.name, fileSize: fileData.size, userId: currentUserId }
            : mediaType === 'audio'
            ? { audioBase64: fileData.base64, mimeType: fileData.mimeType, fileName: fileData.name, fileSize: fileData.size, userId: currentUserId }
            : { imageBase64: fileData.base64, mimeType: fileData.mimeType, fileName: fileData.name, fileSize: fileData.size, userId: currentUserId };

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 45000);

        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify(bodyPayload),
        });

        clearTimeout(timeoutId);

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.error || `Server responded with status ${res.status}`);
        }

        result = await res.json();
      }

      // PERSIST SCAN RESULT: Save in component state & safe sessionStorage
      setActiveResult(result);
      try {
        sessionStorage.setItem('kryptx_active_scan', JSON.stringify(result));
      } catch (e) {
        console.warn('SessionStorage quota exceeded, state preserved in memory', e);
      }

      // Add to history state
      setHistory((prev) => [result, ...prev]);

      // If user profile is active, increment count
      if (user) {
        setUser((prev) =>
          prev
            ? {
                ...prev,
                scansToday: prev.scansToday + 1,
                imageScansToday: mediaType === 'image' ? prev.imageScansToday + 1 : prev.imageScansToday,
                videoScansToday: mediaType === 'video' ? prev.videoScansToday + 1 : prev.videoScansToday,
                audioScansToday: mediaType === 'audio' ? prev.audioScansToday + 1 : prev.audioScansToday,
              }
            : null
        );
      }

      fetchStats();
      // Ensure we are viewing the detector page with the result
      navigateToView('detector', true);
    } catch (err: any) {
      console.error('Analysis error:', err);
      setError(
        err.message ||
          `Forensic analysis failed for ${mediaType}. Please verify the file or server connection and try again.`
      );
    } finally {
      setIsAnalyzing(false);
      setUploadProgress(null);
    }
  };

  // Sample Selection
  const handleSelectSample = (sample: SampleImageItem) => {
    navigateToView('detector', true);
    handleAnalyze({
      base64: sample.dataUrl,
      mimeType: sample.mimeType,
      name: sample.fileName,
      size: 450 * 1024,
    });
  };

  // Reset active scan and allow scanning new media
  const handleResetScan = () => {
    setActiveResult(null);
    try {
      sessionStorage.removeItem('kryptx_active_scan');
    } catch {}
  };

  // Delete Record from History
  const handleDeleteRecord = async (id: string) => {
    try {
      await fetch(`/api/history/${id}`, { method: 'DELETE' });
      setHistory((prev) => prev.filter((r) => r.id !== id));
      if (activeResult?.id === id) {
        handleResetScan();
      }
      fetchStats();
    } catch (err) {
      console.error('Delete error', err);
    }
  };

  // Clear All History
  const handleClearAll = async () => {
    if (!window.confirm('Are you sure you want to clear your entire forensic history?')) return;
    try {
      await fetch(`/api/history?userId=${encodeURIComponent(currentUserId)}`, { method: 'DELETE' });
      setHistory([]);
      fetchStats();
    } catch (err) {
      console.error('Clear error', err);
    }
  };

  // Authentication Handlers
  const handleLogin = (email: string, name?: string, tier: 'free' | 'pro' | 'enterprise' = 'free') => {
    const newUser: UserProfile = {
      id: 'user_' + email.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase(),
      email,
      name: name || email.split('@')[0],
      tier,
      role: 'ANALYST', // Ordinary user / analyst role
      scansToday: 0,
      imageScansToday: 0,
      videoScansToday: 0,
      audioScansToday: 0,
      scanLimit: tier === 'free' ? 10 : 9999,
      isUnlimited: tier !== 'free',
    };
    try {
      localStorage.removeItem('kryptx_admin_token');
    } catch {}
    setUser(newUser);
    setIsAuthenticated(true);
    try {
      localStorage.setItem('kryptx_auth_logged_in', 'true');
      localStorage.setItem('kryptx_auth_user', JSON.stringify(newUser));
    } catch {}
    fetchQuota(newUser.id);
    fetchHistory(newUser.id);
  };

  const handleAdminLogin = (token: string, adminUser: { email: string; name: string; role: 'ADMIN' }) => {
    const adminProfile: UserProfile = {
      id: 'admin_official',
      email: adminUser.email,
      name: adminUser.name,
      tier: 'enterprise',
      role: 'ADMIN',
      scansToday: 0,
      imageScansToday: 0,
      videoScansToday: 0,
      audioScansToday: 0,
      scanLimit: 99999,
      isUnlimited: true,
      adminToken: token,
    };
    setUser(adminProfile);
    setIsAuthenticated(true);
    try {
      localStorage.setItem('kryptx_auth_logged_in', 'true');
      localStorage.setItem('kryptx_auth_user', JSON.stringify(adminProfile));
      localStorage.setItem('kryptx_admin_token', token);
    } catch {}
    navigateToView('admin-intelligence', true);
  };

  const handleLogout = async () => {
    const token = localStorage.getItem('kryptx_admin_token');
    if (token) {
      try {
        await fetch('/api/admin/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}`, 'x-admin-token': token },
        });
      } catch {}
    }
    setUser(null);
    setIsAuthenticated(false);
    try {
      localStorage.removeItem('kryptx_auth_logged_in');
      localStorage.removeItem('kryptx_auth_user');
      localStorage.removeItem('kryptx_admin_token');
    } catch {}
    if (pageView.startsWith('admin-')) {
      navigateToView('home', true);
    }
  };

  const handleUpdateTier = async (newTier: 'free' | 'pro' | 'enterprise') => {
    if (!user) return;
    try {
      await fetch('/api/auth/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, tier: newTier }),
      });
      setUser((prev) =>
        prev
          ? {
              ...prev,
              tier: newTier,
              scanLimit: newTier === 'free' ? 10 : 9999,
            }
          : null
      );
    } catch (err) {
      console.error('Profile update error', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 relative selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Animated Digital Particle Wave Background spanning the viewport */}
      <ParticleWaveBackground />

      {/* Shared KRYPTX Header Navigation with dedicated #080F20 background & authentication awareness */}
      <KryptxNavbar
        onOpenAuth={() => setAuthModalOpen(true)}
        onTryDemo={() => navigateToView('detector', true)}
        onNavigateSection={(sectionId) => {
          if (pageView !== 'home') {
            navigateToView('home', true);
            setTimeout(() => {
              const el = document.getElementById(sectionId);
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }, 100);
          } else {
            const el = document.getElementById(sectionId);
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }
        }}
        onNavigateView={(view) => navigateToView(view as PageView, true)}
        onNavigateAdmin={(adminView) => navigateToView(adminView as PageView, true)}
        user={user}
        isAuthenticated={isAuthenticated}
        onLogout={handleLogout}
        historyCount={history.length}
        onOpenHistory={() => navigateToView('history', true)}
      />

      {/* ================= PAGE ROUTING VIEW ================= */}
      <div className="relative z-10 flex flex-col min-h-[calc(100vh-80px)]">
        
        {/* VIEW 1: VISITING HOMEPAGE */}
        {pageView === 'home' && (
          <div>
            {/* Hero Section */}
            <KryptxHero onTryDemo={() => navigateToView('detector', true)} />

            {/* Workflow & Live Analysis Preview */}
            <HowKryptxWorks
              onAnalyze={handleAnalyze}
              isAnalyzing={isAnalyzing}
              uploadProgress={uploadProgress}
            />

            {/* Key Capabilities */}
            <KeyCapabilities
              onSelectCapability={(type) => {
                navigateToView('detector', true);
              }}
            />

            {/* Technology Architecture & Scientific Explanations */}
            <section id="technology" className="relative py-16 border-t border-cyan-500/10">
              <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-2xl mx-auto mb-12">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-mono tracking-widest uppercase mb-3">
                    PRECISION SCIENTIFIC METHODOLOGY
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-heading font-extrabold text-white tracking-tight">
                    How <span className="text-cyan-400">KRYPTX</span> Analyzes Authenticity
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-400 mt-2">
                    A multi-layered forensic inspection combining physical optics, frequency spectral analysis, and generative latent signature recognition.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-6 rounded-2xl bg-[#061224]/80 border border-cyan-500/20 space-y-3 relative group hover:border-cyan-500/50 transition-all shadow-lg shadow-cyan-950/20">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-mono font-bold text-sm border border-cyan-500/20">
                      01
                    </div>
                    <h4 className="text-base font-bold text-white font-heading">Stream & EXIF Ingestion</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Extracts embedded camera hardware signatures, lens models, shutter speeds, and ISO profiles. Detects known generative software tags while safeguarding against metadata spoofing.
                    </p>
                  </div>

                  <div className="p-6 rounded-2xl bg-[#061224]/80 border border-blue-500/20 space-y-3 relative group hover:border-blue-500/50 transition-all shadow-lg shadow-blue-950/20">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-mono font-bold text-sm border border-blue-500/20">
                      02
                    </div>
                    <h4 className="text-base font-bold text-white font-heading">Frequency & ELA Differencing</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Computes Error Level Analysis (ELA) and Sobel gradient filters to highlight unnatural compression tolerances, edge sharpening boundaries, and synthetic micro-smoothing.
                    </p>
                  </div>

                  <div className="p-6 rounded-2xl bg-[#061224]/80 border border-violet-500/20 space-y-3 relative group hover:border-violet-500/50 transition-all shadow-lg shadow-violet-950/20">
                    <div className="w-10 h-10 rounded-xl bg-violet-500/10 text-violet-400 flex items-center justify-center font-mono font-bold text-sm border border-violet-500/20">
                      03
                    </div>
                    <h4 className="text-base font-bold text-white font-heading">Multimodal Vision Reasoning</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Evaluates physical optical laws—Snell's specular reflection, corneal catchlights, depth of field falloff, anatomical coherence, and generates an explainable forensic docket.
                    </p>
                  </div>
                </div>

                {/* Forensic FAQ */}
                <div id="about" className="mt-16 pt-12 border-t border-slate-800/80">
                  <div className="text-center mb-8">
                    <h4 className="text-xl sm:text-2xl font-heading font-bold text-white tracking-tight">
                      Frequently Asked Forensic Questions
                    </h4>
                  </div>

                  <div className="space-y-4 max-w-4xl mx-auto text-xs">
                    <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5">
                      <div className="font-bold text-white text-sm">
                        Can AI media detectors be 100% accurate?
                      </div>
                      <p className="text-slate-400 leading-relaxed">
                        No scientific detector can claim 100% infallibility. As generative models improve and social media platforms re-compress images, false positives and false negatives can occur. KRYPTX is designed to provide calibrated probabilities and corroborating evidence rather than unfounded certainty.
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5">
                      <div className="font-bold text-white text-sm">
                        Does missing EXIF metadata mean an image is AI generated?
                      </div>
                      <p className="text-slate-400 leading-relaxed">
                        Never. WhatsApp, Instagram, X (Twitter), and messaging apps strip EXIF data automatically for user privacy. KRYPTX treats missing EXIF as an inconclusive factor rather than proof of AI creation.
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5">
                      <div className="font-bold text-white text-sm">
                        What does an "Inconclusive" verdict indicate?
                      </div>
                      <p className="text-slate-400 leading-relaxed">
                        An Inconclusive result is issued when media is heavily compressed, low resolution, or contains mixed signals that prevent a high-confidence forensic classification under rigorous scientific standards.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* VIEW 2: DETECTOR PAGE (Try Live Demo destination) */}
        {pageView === 'detector' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
            {activeResult ? (
              /* COMPLETED FORENSIC REPORT SCREEN (STAYS VISIBLE WITHOUT ANY AUTO-REFRESH) */
              <div className="space-y-6">
                {/* Navigation Bar above result */}
                <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-[#080F20] border border-cyan-500/25">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => navigateToView('home', true)}
                      className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white hover:border-cyan-500/40 transition-all cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Back to Home</span>
                    </button>

                    <button
                      onClick={handleResetScan}
                      className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-xs font-semibold text-cyan-300 hover:bg-cyan-500/20 transition-all cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Scan New Media</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>FORENSIC DOSSIER LOCKED & VERIFIED</span>
                  </div>
                </div>

                {/* Forensic Dossier Component */}
                <DetectionResultView
                  result={activeResult}
                  onReset={handleResetScan}
                />
              </div>
            ) : (
              /* EXISTING MULTIMODAL MEDIA UPLOADER (Image / Video / Audio) */
              <div>
                <div className="mb-4">
                  <button
                    onClick={() => navigateToView('home', true)}
                    className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#080F20] border border-cyan-500/20 text-xs font-semibold text-slate-300 hover:text-white hover:border-cyan-400 transition-all cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5 text-cyan-400" />
                    <span>← Return to KRYPTX Overview</span>
                  </button>
                </div>

                <HeroUpload
                  onAnalyze={handleAnalyze}
                  isAnalyzing={isAnalyzing}
                  uploadProgress={uploadProgress}
                  onSelectSample={handleSelectSample}
                  samples={SAMPLE_SHOWCASE_IMAGES}
                  error={error}
                  onClearError={() => setError(null)}
                />
              </div>
            )}
          </div>
        )}

        {/* VIEW 3: SCAN HISTORY DASHBOARD */}
        {pageView === 'history' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
            <div className="mb-4">
              <button
                onClick={() => navigateToView('home', true)}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#080F20] border border-cyan-500/20 text-xs font-semibold text-slate-300 hover:text-white hover:border-cyan-400 transition-all cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-cyan-400" />
                <span>← Back to Overview</span>
              </button>
            </div>

            <HistoryDashboard
              records={history}
              onSelectRecord={(rec) => {
                setActiveResult(rec);
                try {
                  sessionStorage.setItem('kryptx_active_scan', JSON.stringify(rec));
                } catch {}
                navigateToView('detector', true);
              }}
              onDeleteRecord={handleDeleteRecord}
              onClearAll={handleClearAll}
              onAnalyzeNew={() => {
                handleResetScan();
                navigateToView('detector', true);
              }}
            />
          </div>
        )}

        {/* VIEW 4: SAMPLE SHOWCASE */}
        {pageView === 'showcase' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
            <div className="mb-4">
              <button
                onClick={() => navigateToView('home', true)}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#080F20] border border-cyan-500/20 text-xs font-semibold text-slate-300 hover:text-white hover:border-cyan-400 transition-all cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-cyan-400" />
                <span>← Back to Overview</span>
              </button>
            </div>

            <SampleShowcase onSelectSample={handleSelectSample} />
          </div>
        )}

        {/* VIEW 5: ADMIN ANALYTICS */}
        {pageView === 'analytics' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
            <AdminAnalytics stats={stats} records={history} />
          </div>
        )}

        {/* VIEW 6: SUPABASE INTEGRATION GUIDE */}
        {pageView === 'supabase' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
            <SupabaseGuideModal />
          </div>
        )}

        {/* ACCESS DENIED GUARD FOR ADMIN TRAINING ROUTES */}
        {pageView.startsWith('admin-') && user?.role !== 'ADMIN' && (
          <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4 my-auto flex-1 flex flex-col justify-center">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <ShieldAlert className="w-8 h-8 animate-pulse" />
            </div>
            <div className="inline-block px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 font-mono text-xs font-bold mx-auto">
              403 FORBIDDEN — RESTRICTED ACCESS
            </div>
            <h2 className="text-2xl font-heading font-extrabold text-white">
              Administrator Access Only
            </h2>
            <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
              The KRYPTX Intelligence Training Center is restricted exclusively to authorized administrators. Ordinary users and demo analysts do not have permission to calibrate or govern forensic models.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setAuthModalOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-heading font-bold text-xs uppercase tracking-wider transition-all shadow-lg"
              >
                Sign In as Administrator
              </button>
              <button
                onClick={() => navigateToView('home', true)}
                className="px-5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition-colors"
              >
                Return to Homepage
              </button>
            </div>
          </div>
        )}

        {/* VIEW 7: ADMIN INTELLIGENCE CENTER DASHBOARD */}
        {pageView === 'admin-intelligence' && user?.role === 'ADMIN' && (
          <AdminIntelligenceCenter
            user={user}
            onNavigateAi={(target) => navigateToView(('admin-training-' + target) as PageView, true)}
            onBackToApp={() => navigateToView('home', true)}
          />
        )}

        {/* VIEW 8: TRAIN IMAGE FORENSICS AI WORKSPACE */}
        {pageView === 'admin-training-image' && user?.role === 'ADMIN' && (
          <AdminTrainingWorkspace
            targetAi="image"
            user={user}
            onBackToOverview={() => navigateToView('admin-intelligence', true)}
          />
        )}

        {/* VIEW 9: TRAIN VIDEO DEEPFAKE AI WORKSPACE */}
        {pageView === 'admin-training-video' && user?.role === 'ADMIN' && (
          <AdminTrainingWorkspace
            targetAi="video"
            user={user}
            onBackToOverview={() => navigateToView('admin-intelligence', true)}
          />
        )}

        {/* VIEW 10: TRAIN VOICE FORENSICS AI WORKSPACE */}
        {pageView === 'admin-training-voice' && user?.role === 'ADMIN' && (
          <AdminTrainingWorkspace
            targetAi="voice"
            user={user}
            onBackToOverview={() => navigateToView('admin-intelligence', true)}
          />
        )}

        {/* Global KRYPTX Footer */}
        <KryptxFooter />
      </div>

      {/* Auth & Tier Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        user={user}
        isAuthenticated={isAuthenticated}
        onLogin={handleLogin}
        onAdminLogin={handleAdminLogin}
        onLogout={handleLogout}
        onUpdateTier={handleUpdateTier}
      />
    </div>
  );
}

export default App;
