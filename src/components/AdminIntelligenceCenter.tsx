import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Brain,
  Cpu,
  Video,
  Mic,
  Image as ImageIcon,
  CheckCircle2,
  AlertTriangle,
  History,
  Lock,
  ExternalLink,
  RefreshCw,
  Sparkles,
  ArrowRight,
  KeyRound,
  FileCheck2,
  Clock,
  Layers,
  Activity,
  ChevronRight,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';
import {
  TrainingTarget,
  KnowledgeRelease,
  AuditLog,
  AdminOverview,
  UserProfile,
} from '../types/detector';

interface AdminIntelligenceCenterProps {
  user: UserProfile | null;
  onNavigateAi: (target: TrainingTarget) => void;
  onBackToApp: () => void;
}

export const AdminIntelligenceCenter: React.FC<AdminIntelligenceCenterProps> = ({
  user,
  onNavigateAi,
  onBackToApp,
}) => {
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isRotating, setIsRotating] = useState(false);
  const [activeTab, setActiveTab] = useState<'engines' | 'releases' | 'audit'>('engines');
  const [isRollingBack, setIsRollingBack] = useState<string | null>(null);

  const adminToken = user?.adminToken || localStorage.getItem('kryptx_admin_token') || '';

  const fetchOverview = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/intelligence/overview', {
        headers: {
          Authorization: `Bearer ${adminToken}`,
          'x-admin-token': adminToken,
        },
      });
      if (!res.ok) {
        throw new Error('Failed to load intelligence control overview');
      }
      const data = await res.json();
      setOverview(data);
    } catch (err: any) {
      setError(err.message || 'Error communicating with intelligence server');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const res = await fetch('/api/admin/intelligence/audit-logs', {
        headers: {
          Authorization: `Bearer ${adminToken}`,
          'x-admin-token': adminToken,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setAuditLogs(data.auditLogs || []);
      }
    } catch {}
  };

  useEffect(() => {
    fetchOverview();
    fetchAuditLogs();
  }, []);

  const handlePasswordRotate = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters long');
      return;
    }

    setIsRotating(true);
    try {
      const res = await fetch('/api/admin/rotate-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
          'x-admin-token': adminToken,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to rotate password');
      }
      setPasswordSuccess('Administrator credentials rotated successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      fetchAuditLogs();
      setTimeout(() => {
        setPasswordModalOpen(false);
        setPasswordSuccess(null);
      }, 1500);
    } catch (err: any) {
      setPasswordError(err.message);
    } finally {
      setIsRotating(false);
    }
  };

  const handleRollback = async (releaseId: string, version: string) => {
    if (!window.confirm(`Are you sure you want to rollback and reactivate version ${version}?`)) return;
    setIsRollingBack(releaseId);
    try {
      const res = await fetch(`/api/admin/intelligence/versions/${releaseId}/activate`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${adminToken}`,
          'x-admin-token': adminToken,
        },
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Failed to reactivate version');
      }
      await fetchOverview();
      await fetchAuditLogs();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsRollingBack(null);
    }
  };

  const aiCards = [
    {
      target: 'image' as TrainingTarget,
      title: 'Image Forensics AI',
      subtitle: 'Diffusion & Synthetic Optical Model',
      description:
        'Error Level Analysis (ELA), frequency decomposition, micro-surface latent smoothing, corneal catchlights, and sensor PRNU anomalies.',
      accent: 'border-cyan-500/40 text-cyan-400 bg-cyan-500/10',
      activeVersion: overview?.imageVersion || 'v1.0',
      icon: ImageIcon,
      glow: 'shadow-[0_0_30px_rgba(0,229,255,0.12)] hover:border-cyan-400',
      btnColor: 'from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950',
      specs: ['Diffusion Artifacts', 'Sobel Frequency', 'Sensor Noise', 'Catchlights'],
    },
    {
      target: 'video' as TrainingTarget,
      title: 'Video Deepfake Forensics AI',
      subtitle: 'Temporal Optical Flow & Viseme Engine',
      description:
        'Inter-frame temporal warping, face-swap seam boundary inconsistencies, eye blink cadence, audio-visual lip-phoneme synchronization.',
      accent: 'border-blue-500/40 text-blue-400 bg-blue-500/10',
      activeVersion: overview?.videoVersion || 'v1.0',
      icon: Video,
      glow: 'shadow-[0_0_30px_rgba(41,121,255,0.12)] hover:border-blue-400',
      btnColor: 'from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white',
      specs: ['Temporal Coherence', 'Lip-Sync Visemes', 'Blink Interval', 'Seam Blending'],
    },
    {
      target: 'voice' as TrainingTarget,
      title: 'Voice & Audio Forensics AI',
      subtitle: 'Neural Vocoder Phase & Acoustic Engine',
      description:
        'Short-Time Fourier Transform (STFT) phase discontinuities, neural vocoder metallic ringing (ElevenLabs/RVC), prosody monotone, breath acoustics.',
      accent: 'border-purple-500/40 text-purple-400 bg-purple-500/10',
      activeVersion: overview?.voiceVersion || 'v1.0',
      icon: Mic,
      glow: 'shadow-[0_0_30px_rgba(179,136,255,0.12)] hover:border-purple-400',
      btnColor: 'from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 text-white',
      specs: ['Vocoder Phase', 'STFT Spectrogram', 'Formant Drift', 'Prosodic Monotone'],
    },
  ];

  return (
    <div className="min-h-screen bg-[#040814] text-slate-200 py-8 px-4 sm:px-6 lg:px-8 selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Background cyber grid */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(0,229,255,0.06),transparent)] pointer-events-none" />
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#081329_1px,transparent_1px),linear-gradient(to_bottom,#081329_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto space-y-8">
        {/* Top Control Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-[#080F20]/90 border border-cyan-500/30 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/40 text-cyan-400">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono tracking-widest uppercase px-2 py-0.5 rounded-md bg-purple-500/20 border border-purple-500/40 text-purple-300 font-semibold">
                  RESTRICTED ACCESS
                </span>
                <span className="text-[10px] font-mono tracking-widest uppercase px-2 py-0.5 rounded-md bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-semibold">
                  CHIEF ADMINISTRATOR ONLY
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-heading font-extrabold text-white tracking-wide mt-1">
                KRYPTX INTELLIGENCE CONTROL CENTER
              </h1>
              <p className="text-xs text-slate-400">
                Train, calibrate, validate and govern multimodal forensic intelligence.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-semibold text-white">
                {user?.name || 'Chief Intelligence Administrator'}
              </div>
              <div className="text-[11px] text-cyan-400 font-mono">
                {user?.email || 'admin@kryptx-forensics.io'}
              </div>
            </div>

            <button
              onClick={() => setPasswordModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-slate-900 border border-slate-700/80 hover:border-cyan-500/50 hover:text-white transition-colors"
            >
              <KeyRound className="w-3.5 h-3.5 text-cyan-400" />
              <span>Rotate Password</span>
            </button>

            <button
              onClick={() => {
                fetchOverview();
                fetchAuditLogs();
              }}
              className="p-2 rounded-lg text-slate-400 hover:text-white bg-slate-900 border border-slate-700/80 hover:border-cyan-500/50 transition-colors"
              title="Refresh status"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
            </button>

            <button
              onClick={onBackToApp}
              className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-white bg-gradient-to-r from-slate-800 to-slate-900 border border-slate-700 hover:border-slate-500 transition-colors"
            >
              Exit to Platform
            </button>
          </div>
        </div>

        {/* Notice of Scientific Transparency */}
        <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/20 flex items-start gap-3 text-xs text-slate-300">
          <ShieldCheck className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-white">Forensic Knowledge Directives & Prompt Governance: </span>
            This center allows authorized administrators to train forensic systems via empirical guidance, sample pattern ingestion, and benchmark calibration. In compliance with international scientific standards, training applies RAG-style knowledge ingestion and system prompt directive calibration without claiming non-verifiable foundational weight fine-tuning.
          </div>
        </div>

        {/* Pending Plans Alert */}
        {overview && overview.pendingPlansCount > 0 && (
          <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-500/40 flex items-center justify-between gap-4 animate-pulse">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-purple-400" />
              <div>
                <span className="font-bold text-white text-sm">
                  {overview.pendingPlansCount} Training Plan{overview.pendingPlansCount > 1 ? 's' : ''} Awaiting Administrator Approval
                </span>
                <p className="text-xs text-purple-200/80">
                  Synthesized training plans are held in staging until you review and activate them.
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('engines')}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-purple-500 text-white hover:bg-purple-400 transition-colors shrink-0"
            >
              Review Pending Plans →
            </button>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
          <button
            onClick={() => setActiveTab('engines')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'engines'
                ? 'bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 shadow-[0_0_15px_rgba(0,229,255,0.2)]'
                : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
            }`}
          >
            <Brain className="w-4 h-4" />
            <span>Forensic Intelligence Engines (3)</span>
          </button>

          <button
            onClick={() => setActiveTab('releases')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'releases'
                ? 'bg-blue-500/20 border border-blue-500/40 text-blue-300 shadow-[0_0_15px_rgba(41,121,255,0.2)]'
                : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Version Releases & Rollback</span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'audit'
                ? 'bg-purple-500/20 border border-purple-500/40 text-purple-300 shadow-[0_0_15px_rgba(179,136,255,0.2)]'
                : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Audit Trail & Security Logs ({auditLogs.length})</span>
          </button>
        </div>

        {/* TAB 1: 3 FORENSIC ENGINES */}
        {activeTab === 'engines' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {aiCards.map((card) => {
                const IconComponent = card.icon;
                return (
                  <div
                    key={card.target}
                    className={`relative flex flex-col justify-between p-6 rounded-2xl bg-[#080F20]/95 border transition-all duration-300 ${card.glow} ${card.accent}`}
                  >
                    <div>
                      {/* Card Top */}
                      <div className="flex items-start justify-between gap-2 mb-4">
                        <div className={`p-3 rounded-xl ${card.accent} border`}>
                          <IconComponent className="w-6 h-6" />
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            {card.activeVersion} ACTIVE
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono mt-1">
                            Live in Production
                          </span>
                        </div>
                      </div>

                      {/* Titles */}
                      <h2 className="text-lg font-heading font-bold text-white tracking-wide">
                        {card.title}
                      </h2>
                      <div className="text-xs font-mono text-cyan-300/80 mb-2">
                        {card.subtitle}
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed mb-4">
                        {card.description}
                      </p>

                      {/* Specs */}
                      <div className="flex flex-wrap gap-1.5 mb-6">
                        {card.specs.map((spec) => (
                          <span
                            key={spec}
                            className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300"
                          >
                            {spec}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Launch Action */}
                    <button
                      onClick={() => onNavigateAi(card.target)}
                      className={`w-full py-2.5 px-4 rounded-xl font-heading font-bold text-xs tracking-wider uppercase transition-all shadow-lg flex items-center justify-center gap-2 bg-gradient-to-r ${card.btnColor}`}
                    >
                      <span>Launch Training Workspace</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Quick Stats Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 rounded-2xl bg-[#080F20]/70 border border-slate-800">
              <div className="space-y-1">
                <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                  Active Directives
                </div>
                <div className="text-xl font-bold font-mono text-white">3 / 3 Online</div>
              </div>
              <div className="space-y-1">
                <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                  Pending Plans
                </div>
                <div className="text-xl font-bold font-mono text-purple-400">
                  {overview?.pendingPlansCount || 0}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                  Total Calibration Sessions
                </div>
                <div className="text-xl font-bold font-mono text-cyan-400">
                  {(overview as any)?.totalSessionsCount || 0}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                  Last Release Date
                </div>
                <div className="text-xs font-mono text-slate-300 truncate">
                  {overview?.lastTrainingUpdate ? new Date(overview.lastTrainingUpdate).toLocaleDateString() : 'Baseline'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: VERSION RELEASES & ROLLBACK */}
        {activeTab === 'releases' && (
          <div className="p-6 rounded-2xl bg-[#080F20]/95 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-base font-heading font-bold text-white">
                  Knowledge Releases & Operational Versions
                </h3>
                <p className="text-xs text-slate-400">
                  History of approved forensic knowledge bases. You can roll back to any prior release at any time.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-mono uppercase tracking-wider">
                    <th className="py-3 px-3">Target AI</th>
                    <th className="py-3 px-3">Version</th>
                    <th className="py-3 px-3">Release Title / Objective</th>
                    <th className="py-3 px-3">Approved By</th>
                    <th className="py-3 px-3">Date</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {overview?.allReleases && overview.allReleases.length > 0 ? (
                    overview.allReleases.map((release) => (
                      <tr key={release.id} className="hover:bg-slate-900/40 transition-colors">
                        <td className="py-3 px-3 capitalize font-bold text-white flex items-center gap-1.5">
                          {release.targetAi === 'image' && <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />}
                          {release.targetAi === 'video' && <Video className="w-3.5 h-3.5 text-blue-400" />}
                          {release.targetAi === 'voice' && <Mic className="w-3.5 h-3.5 text-purple-400" />}
                          <span>{release.targetAi}</span>
                        </td>
                        <td className="py-3 px-3 font-bold text-cyan-300">{release.version}</td>
                        <td className="py-3 px-3 text-slate-300 max-w-xs truncate" title={release.objective}>
                          {release.title || release.objective}
                        </td>
                        <td className="py-3 px-3 text-slate-400 truncate">{release.approvedBy}</td>
                        <td className="py-3 px-3 text-slate-400">
                          {new Date(release.approvedAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-3">
                          {release.isActive ? (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-[10px]">
                              ACTIVE
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[10px]">
                              DEPRECATED
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-right">
                          {!release.isActive && (
                            <button
                              onClick={() => handleRollback(release.id, release.version)}
                              disabled={isRollingBack === release.id}
                              className="px-2.5 py-1 rounded bg-slate-800 border border-cyan-500/30 hover:border-cyan-500 hover:text-cyan-300 text-slate-300 transition-colors text-[11px] inline-flex items-center gap-1"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>Rollback</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="text-center py-6 text-slate-500">
                        No releases found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: AUDIT TRAIL */}
        {activeTab === 'audit' && (
          <div className="p-6 rounded-2xl bg-[#080F20]/95 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-base font-heading font-bold text-white">
                  Security & Administrative Audit Trail
                </h3>
                <p className="text-xs text-slate-400">
                  Immutable server-side logging for every training session, file ingestion, plan synthesis, and version activation.
                </p>
              </div>
            </div>

            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
              {auditLogs.length > 0 ? (
                auditLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-start justify-between gap-4 text-xs font-mono"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-bold">
                          {log.action}
                        </span>
                        <span className="text-slate-400">{log.adminEmail}</span>
                        {log.ip && <span className="text-slate-500">[{log.ip}]</span>}
                      </div>
                      <div className="text-slate-300">
                        {typeof log.details === 'object' ? JSON.stringify(log.details) : log.details}
                      </div>
                    </div>
                    <div className="text-[11px] text-slate-500 shrink-0">
                      {new Date(log.timestamp).toLocaleString()}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-500 text-xs">
                  No audit logs recorded yet.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ROTATE PASSWORD MODAL */}
      {passwordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-[#080F20] border border-cyan-500/30 rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-heading font-bold text-white flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-cyan-400" />
              <span>Rotate Administrator Password</span>
            </h3>
            <p className="text-xs text-slate-400">
              Update credentials for <strong className="text-white">admin@kryptx-forensics.io</strong>.
            </p>

            {passwordError && (
              <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
                {passwordError}
              </div>
            )}
            {passwordSuccess && (
              <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs">
                {passwordSuccess}
              </div>
            )}

            <form onSubmit={handlePasswordRotate} className="space-y-3">
              <div>
                <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1">
                  New Password (min 8 chars)
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPasswordModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isRotating}
                  className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-heading"
                >
                  {isRotating ? 'Updating...' : 'Save New Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

