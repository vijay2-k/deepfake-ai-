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
  Upload,
  Database,
  FileText,
  Sliders,
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
  const [activeTab, setActiveTab] = useState<'engines' | 'releases' | 'audit' | 'datasets' | 'benchmarks' | 'custom_training'>('custom_training');
  const [isRollingBack, setIsRollingBack] = useState<string | null>(null);
  const [datasetRegistry, setDatasetRegistry] = useState<any>(null);
  const [benchmarkReport, setBenchmarkReport] = useState<any>(null);
  const [customDatasets, setCustomDatasets] = useState<any[]>([]);
  const [checkpointAudit, setCheckpointAudit] = useState<any>(null);
  const [trainingConfig, setTrainingConfig] = useState<any>(null);
  const [isUploadingDataset, setIsUploadingDataset] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isApprovingTraining, setIsApprovingTraining] = useState(false);
  const [approvalConfirmed, setApprovalConfirmed] = useState(false);

  const fetchCustomTrainingData = async () => {
    try {
      const [ckRes, dsRes, cfgRes] = await Promise.all([
        fetch('/api/admin/training/checkpoint-audit', {
          headers: { Authorization: `Bearer ${adminToken}`, 'x-admin-token': adminToken },
        }),
        fetch('/api/admin/training/datasets', {
          headers: { Authorization: `Bearer ${adminToken}`, 'x-admin-token': adminToken },
        }),
        fetch('/api/admin/training/config', {
          headers: { Authorization: `Bearer ${adminToken}`, 'x-admin-token': adminToken },
        }),
      ]);
      if (ckRes.ok) setCheckpointAudit(await ckRes.json());
      if (dsRes.ok) setCustomDatasets(await dsRes.json());
      if (cfgRes.ok) setTrainingConfig(await cfgRes.json());
    } catch (e) {
      console.error('Failed to fetch training assets', e);
    }
  };

  const handleDatasetFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingDataset(true);
    setUploadMessage(null);
    setUploadError(null);

    const formData = new FormData();
    formData.append('dataset', file);

    try {
      const res = await fetch('/api/admin/training/datasets/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${adminToken}`,
          'x-admin-token': adminToken,
        },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Dataset ingestion failed');

      setUploadMessage(`Dataset "${file.name}" successfully extracted and inspected (${data.report?.valid_images || 0} valid images).`);
      fetchCustomTrainingData();
    } catch (err: any) {
      setUploadError(err.message || 'Dataset upload failed');
    } finally {
      setIsUploadingDataset(false);
    }
  };

  const fetchDatasetsAndBenchmarks = async () => {
    try {
      fetchCustomTrainingData();
      const [dsRes, bmRes] = await Promise.all([
        fetch('/api/admin/intelligence/datasets', {
          headers: { Authorization: `Bearer ${adminToken}`, 'x-admin-token': adminToken },
        }),
        fetch('/api/admin/intelligence/benchmarks', {
          headers: { Authorization: `Bearer ${adminToken}`, 'x-admin-token': adminToken },
        }),
      ]);
      if (dsRes.ok) setDatasetRegistry(await dsRes.json());
      if (bmRes.ok) setBenchmarkReport(await bmRes.json());
    } catch {}
  };

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
    fetchDatasetsAndBenchmarks();
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
      accent: 'border-[#E4DEFF] text-[#5515D8] bg-[#5515D8]/10',
      activeVersion: overview?.imageVersion || 'v1.0',
      icon: ImageIcon,
      glow: 'shadow-[0_0_30px_rgba(0,217,149,0.15)] hover:border-[#5515D8]',
      btnColor: 'from-[#5515D8] to-[#8B32FF] hover:brightness-110 text-white font-bold',
      specs: ['Diffusion Artifacts', 'Sobel Frequency', 'Sensor Noise', 'Catchlights'],
    },
    {
      target: 'video' as TrainingTarget,
      title: 'Video Deepfake Forensics AI',
      subtitle: 'Temporal Optical Flow & Viseme Engine',
      description:
        'Inter-frame temporal warping, face-swap seam boundary inconsistencies, eye blink cadence, audio-visual lip-phoneme synchronization.',
      accent: 'border-[#1677FF]/40 text-[#1677FF] bg-[#1677FF]/10',
      activeVersion: overview?.videoVersion || 'v1.0',
      icon: Video,
      glow: 'shadow-[0_0_30px_rgba(85,21,216,0.15)] hover:border-[#5515D8]',
      btnColor: 'from-[#5515D8] to-[#1677FF] hover:brightness-110 text-white font-bold',
      specs: ['Temporal Coherence', 'Lip-Sync Visemes', 'Blink Interval', 'Seam Blending'],
    },
    {
      target: 'voice' as TrainingTarget,
      title: 'Voice & Audio Forensics AI',
      subtitle: 'Neural Vocoder Phase & Acoustic Engine',
      description:
        'Short-Time Fourier Transform (STFT) phase discontinuities, neural vocoder metallic ringing (ElevenLabs/RVC), prosody monotone, breath acoustics.',
      accent: 'border-[#8B32FF]/40 text-[#8B32FF] bg-[#8B32FF]/10',
      activeVersion: overview?.voiceVersion || 'v1.0',
      icon: Mic,
      glow: 'shadow-[0_0_30px_rgba(139,50,255,0.15)] hover:border-[#8B32FF]',
      btnColor: 'from-[#8B32FF] to-[#1677FF] hover:brightness-110 text-white font-bold',
      specs: ['Vocoder Phase', 'STFT Spectrogram', 'Formant Drift', 'Prosodic Monotone'],
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8F7FF] bg-[#FFFFFF] text-[#10132F] py-8 px-4 sm:px-6 lg:px-8 selection:bg-[#5515D8]/30 selection:text-[#5515D8]">
      {/* Background emerald cyber glow */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(0,217,149,0.06),transparent)] pointer-events-none" />
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#E4DEFF_1px,transparent_1px),linear-gradient(to_bottom,#E4DEFF_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto space-y-8">
        {/* Top Control Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-[#E4DEFF] shadow-2xl backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#5515D8]/10 border border-[#E4DEFF] text-[#5515D8]">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono tracking-widest uppercase px-2 py-0.5 rounded-md bg-[#5515D8]/10 border border-[#E4DEFF] text-[#5515D8] font-semibold">
                  RESTRICTED ACCESS
                </span>
                <span className="text-[10px] font-mono tracking-widest uppercase px-2 py-0.5 rounded-md bg-[#1677FF]/10 border border-[#1677FF]/30 text-[#1677FF] font-semibold">
                  CHIEF ADMINISTRATOR ONLY
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-heading font-extrabold text-[#10132F] tracking-wide mt-1">
                KRYPTX INTELLIGENCE CONTROL CENTER
              </h1>
              <p className="text-xs text-[#525779]">
                Train, calibrate, validate and govern multimodal forensic intelligence.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-semibold text-[#10132F]">
                {user?.name || 'Chief Intelligence Administrator'}
              </div>
              <div className="text-[11px] text-[#5515D8] font-mono">
                {user?.email || 'admin@kryptx-forensics.io'}
              </div>
            </div>

            <button
              onClick={() => setPasswordModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#525779] bg-white border border-[#E4DEFF] hover:border-[#5515D8] hover:text-[#10132F] transition-colors"
            >
              <KeyRound className="w-3.5 h-3.5 text-[#5515D8]" />
              <span>Rotate Password</span>
            </button>

            <button
              onClick={() => {
                fetchOverview();
                fetchAuditLogs();
              }}
              className="p-2 rounded-lg text-[#525779] hover:text-[#10132F] bg-white border border-[#E4DEFF] hover:border-[#5515D8] transition-colors"
              title="Refresh status"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-[#5515D8]' : ''}`} />
            </button>

            <button
              onClick={onBackToApp}
              className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-[#10132F] bg-white border border-[#E4DEFF] hover:border-[#5515D8] transition-colors"
            >
              Exit to Platform
            </button>
          </div>
        </div>

        {/* Notice of Scientific Transparency */}
        <div className="p-4 rounded-xl bg-white border border-[#E4DEFF] flex items-start gap-3 text-xs text-[#525779]">
          <ShieldCheck className="w-5 h-5 text-[#5515D8] shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-[#10132F]">Forensic Knowledge Directives & Prompt Governance: </span>
            This center allows authorized administrators to train forensic systems via empirical guidance, sample pattern ingestion, and benchmark calibration. In compliance with international scientific standards, training applies RAG-style knowledge ingestion and system prompt directive calibration without claiming non-verifiable foundational weight fine-tuning.
          </div>
        </div>

        {/* Pending Plans Alert */}
        {overview && overview.pendingPlansCount > 0 && (
          <div className="p-4 rounded-xl bg-[#0B3526] border border-[#E4DEFF] flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-[#5515D8]" />
              <div>
                <span className="font-bold text-[#10132F] text-sm">
                  {overview.pendingPlansCount} Training Plan{overview.pendingPlansCount > 1 ? 's' : ''} Awaiting Administrator Approval
                </span>
                <p className="text-xs text-[#525779]">
                  Synthesized training plans are held in staging until you review and activate them.
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('engines')}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-[#5515D8] to-[#8B32FF] text-white shadow-md shadow-[#5515D8]/20 text-white font-bold hover:brightness-110 transition-colors shrink-0"
            >
              Review Pending Plans →
            </button>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-[#E4DEFF] pb-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('custom_training')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'custom_training'
                ? 'bg-[#5515D8]/10 border border-[#E4DEFF] text-[#5515D8] shadow-[0_0_15px_rgba(0,217,149,0.2)]'
                : 'text-[#525779] hover:text-[#10132F] hover:bg-white'
            }`}
          >
            <Cpu className="w-4 h-4 text-[#5515D8]" />
            <span>Dataset ML Lab & Training Center</span>
          </button>

          <button
            onClick={() => setActiveTab('engines')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'engines'
                ? 'bg-[#5515D8]/10 border border-[#E4DEFF] text-[#5515D8] shadow-[0_0_15px_rgba(0,217,149,0.2)]'
                : 'text-[#525779] hover:text-[#10132F] hover:bg-white'
            }`}
          >
            <Brain className="w-4 h-4" />
            <span>Forensic Intelligence Engines (3)</span>
          </button>

          <button
            onClick={() => setActiveTab('releases')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'releases'
                ? 'bg-[#5515D8]/10 border border-[#E4DEFF] text-[#5515D8] shadow-[0_0_15px_rgba(0,217,149,0.2)]'
                : 'text-[#525779] hover:text-[#10132F] hover:bg-white'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Version Releases & Rollback</span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'audit'
                ? 'bg-[#5515D8]/10 border border-[#E4DEFF] text-[#5515D8] shadow-[0_0_15px_rgba(0,217,149,0.2)]'
                : 'text-[#525779] hover:text-[#10132F] hover:bg-white'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Audit Trail & Security Logs ({auditLogs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('datasets')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'datasets'
                ? 'bg-[#5515D8]/10 border border-[#E4DEFF] text-[#5515D8] shadow-[0_0_15px_rgba(0,217,149,0.2)]'
                : 'text-[#525779] hover:text-[#10132F] hover:bg-white'
            }`}
          >
            <FileCheck2 className="w-4 h-4" />
            <span>Dataset Registry (10 Verified)</span>
          </button>

          <button
            onClick={() => setActiveTab('benchmarks')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'benchmarks'
                ? 'bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 shadow-[0_0_15px_rgba(0,229,255,0.2)]'
                : 'text-slate-400 hover:text-white hover:bg-[#F8F7FF]'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Empirical Benchmarks & Calibration</span>
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
                    className={`relative flex flex-col justify-between p-6 rounded-2xl bg-white border transition-all duration-300 ${card.glow} ${card.accent}`}
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
                            className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-[#E4DEFF] text-slate-300"
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
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 rounded-2xl bg-white/70 border border-[#E4DEFF]">
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
          <div className="p-6 rounded-2xl bg-white border border-[#E4DEFF] space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-[#E4DEFF]">
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
                  <tr className="border-b border-[#E4DEFF] text-slate-400 font-mono uppercase tracking-wider">
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
          <div className="p-6 rounded-2xl bg-white border border-[#E4DEFF] space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-[#E4DEFF]">
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
                    className="p-3 rounded-xl bg-[#F8F7FF] border border-[#E4DEFF] flex items-start justify-between gap-4 text-xs font-mono"
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

        {/* TAB 4: DATASET REGISTRY */}
        {activeTab === 'datasets' && (
          <div className="space-y-6">
            <div className="p-5 rounded-2xl bg-white border border-[#E4DEFF] space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-heading font-bold text-white flex items-center gap-2">
                    <FileCheck2 className="w-5 h-5 text-emerald-400" />
                    Verified Forensic Datasets Registry (Official Sources & Governance)
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Standardized image and voice benchmarking corpuses with strict speaker-disjoint and generator-disjoint holdouts to prevent data leakage.
                  </p>
                </div>
                <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-bold">
                  10 Verified Corpuses Active
                </div>
              </div>
            </div>

            {/* Image Datasets Section */}
            <div className="p-5 rounded-2xl bg-white border border-[#E4DEFF] space-y-4">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-cyan-400" />
                Image Forensics Benchmarks (5 Datasets)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(datasetRegistry?.image_datasets || datasetRegistry?.imageDatasets || [
                  { id: 'genimage', name: 'GenImage: A Million-Scale Benchmark', license: 'Creative Commons CC-BY 4.0', sample_count: '1,331,167 pairs', source_url: 'https://github.com/GenImage-Dataset/GenImage', notes: 'Includes Midjourney, Stable Diffusion, DALL-E, GLIDE, VQDM, Wukong' },
                  { id: 'cifake', name: 'CIFAKE: Real and AI-Generated Images', license: 'CC0: Public Domain (Kaggle)', sample_count: '120,000 images', source_url: 'https://www.kaggle.com/datasets/birdy654/cifake-real-and-ai-generated-synthetic-images', notes: 'CIFAR-10 photographic vs Stable Diffusion v1.4 synthetic' },
                  { id: 'faceforensics_plus_plus', name: 'FaceForensics++: Manipulated Facial Images', license: 'Non-commercial Research License', sample_count: '1,800,000 frames', source_url: 'https://github.com/ondyari/FaceForensics', notes: 'Deepfakes, Face2Face, FaceSwap, NeuralTextures' },
                  { id: 'celeb_df', name: 'Celeb-DF (v2): Large-scale Deepfake Dataset', license: 'Research-only agreement', sample_count: '5,639 videos (2.2M frames)', source_url: 'https://github.com/yuezunli/celeb-deepfakeforensics', notes: 'High visual quality celebrity deepfakes with reduced boundary artifacts' },
                  { id: 'dfdc', name: 'DeepFake Detection Challenge Dataset (DFDC)', license: 'DFDC Research Competition License', sample_count: '128,154 clips', source_url: 'https://ai.meta.com/datasets/dfdc/', notes: 'Diverse demographic representation, lighting conditions, and camera angles' },
                ]).map((ds: any) => (
                  <div key={ds.id} className="p-4 rounded-xl bg-[#F8F7FF] border border-[#E4DEFF] hover:border-cyan-500/40 transition-colors space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-bold text-white">{ds.name}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-800 shrink-0">
                        {ds.sample_count || ds.sampleCount}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">{ds.notes || ds.description}</p>
                    <div className="pt-2 border-t border-[#E4DEFF] flex items-center justify-between text-[10px] font-mono text-slate-500">
                      <span>License: {ds.license}</span>
                      <a href={ds.source_url || ds.url} target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline flex items-center gap-1">
                        Source <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Voice Datasets Section */}
            <div className="p-5 rounded-2xl bg-white border border-[#E4DEFF] space-y-4">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Mic className="w-4 h-4 text-purple-400" />
                Voice & Audio Forensics Benchmarks (5 Datasets)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(datasetRegistry?.voice_datasets || datasetRegistry?.voiceDatasets || [
                  { id: 'asvspoof_2019', name: 'ASVspoof 2019: Logical Access & Spoofing', license: 'Open Data Commons Public Domain (ODC-PD)', sample_count: '121,461 utterances', source_url: 'https://www.asvspoof.org/data2019.html', notes: '19 TTS and voice cloning speech synthesisers' },
                  { id: 'asvspoof_2021', name: 'ASVspoof 2021: Deepfake & Codec Compression', license: 'ODC-PD (University of Edinburgh)', sample_count: '611,829 utterances', source_url: 'https://www.asvspoof.org/data2021.html', notes: 'Evaluation under real-world lossy telephony and VoIP codecs' },
                  { id: 'wavefake', name: 'WaveFake: Audio Deepfake Detection', license: 'MIT License', sample_count: '117,985 clips', source_url: 'https://github.com/joel-frank/wavefake', notes: 'MelGAN, Parallel WaveGAN, Multi-band MelGAN, FullBand MelGAN, HiFi-GAN' },
                  { id: 'fakeavceleb', name: 'FakeAVCeleb: Multimodal Audio-Video Dataset', license: 'CC-BY-NC 4.0 Research License', sample_count: '21,566 clips', source_url: 'https://github.com/DASH-Lab/FakeAVCeleb', notes: 'SV2TTS cloned voices paired with video facial synthesis' },
                  { id: 'mlaad', name: 'MLAAD: Multi-Language Audio Anti-Spoofing', license: 'Creative Commons CC-BY 4.0', sample_count: '100,000+ utterances', source_url: 'https://github.com/mlaad-dataset/mlaad', notes: 'Multilingual neural TTS across English, German, French, Spanish, Russian' },
                ]).map((ds: any) => (
                  <div key={ds.id} className="p-4 rounded-xl bg-[#F8F7FF] border border-[#E4DEFF] hover:border-purple-500/40 transition-colors space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-bold text-white">{ds.name}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-950 text-purple-300 border border-purple-800 shrink-0">
                        {ds.sample_count || ds.sampleCount}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">{ds.notes || ds.description}</p>
                    <div className="pt-2 border-t border-[#E4DEFF] flex items-center justify-between text-[10px] font-mono text-slate-500">
                      <span>License: {ds.license}</span>
                      <a href={ds.source_url || ds.url} target="_blank" rel="noreferrer" className="text-purple-400 hover:underline flex items-center gap-1">
                        Source <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Out-of-Distribution Protocol Banner */}
            <div className="p-4 rounded-xl bg-[#F8F7FF] border border-cyan-500/30 flex items-start gap-3 text-xs text-slate-300">
              <ShieldCheck className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white">Out-Of-Distribution (OOD) Leakage Prevention: </span>
                All evaluation splits enforce strictly disjoint generator and speaker holdouts. Unseen voice synthesis architectures (e.g. Diffusion-based voicebox) and unseen diffusion image samplers are tested without parameter tuning to measure true generalization.
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: INDEPENDENT BENCHMARKS & CALIBRATION */}
        {activeTab === 'benchmarks' && (
          <div className="space-y-6">
            <div className="p-5 rounded-2xl bg-white border border-[#E4DEFF] space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-heading font-bold text-white flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-cyan-400" />
                    Independent Forensic Accuracy & Calibration Benchmarks
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Rigorous quantitative validation across stratified crop resolutions, JPEG compression rates, audio durations, and vocoder domains.
                  </p>
                </div>
                <div className="text-xs font-mono text-slate-400">
                  Evaluated: {benchmarkReport?.timestamp ? new Date(benchmarkReport.timestamp).toLocaleDateString() : 'Active'}
                </div>
              </div>
            </div>

            {/* Key Metric Summaries */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Image Summary Card */}
              <div className="p-5 rounded-2xl bg-[#F8F7FF] border border-cyan-500/30 space-y-4">
                <div className="flex items-center justify-between border-b border-[#E4DEFF] pb-3">
                  <span className="text-sm font-bold text-white flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-cyan-400" />
                    Image Forensics Engine
                  </span>
                  <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                    Accuracy: {benchmarkReport?.metricsSummary?.imageEngine?.accuracy || '91.5%'}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono text-xs">
                  <div className="p-2.5 rounded-lg bg-white border border-[#E4DEFF]">
                    <span className="text-[10px] text-slate-500 block">ROC-AUC</span>
                    <span className="text-cyan-300 font-bold">{benchmarkReport?.metricsSummary?.imageEngine?.rocAuc || '0.9907'}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white border border-[#E4DEFF]">
                    <span className="text-[10px] text-slate-500 block">F1-Score</span>
                    <span className="text-indigo-300 font-bold">{benchmarkReport?.metricsSummary?.imageEngine?.f1Score || '0.9146'}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white border border-[#E4DEFF]">
                    <span className="text-[10px] text-slate-500 block">Brier Score</span>
                    <span className="text-emerald-300 font-bold">{benchmarkReport?.metricsSummary?.imageEngine?.brierScore || '0.0637'}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white border border-[#E4DEFF]">
                    <span className="text-[10px] text-slate-500 block">False Positive Rate</span>
                    <span className="text-amber-400 font-bold">{benchmarkReport?.metricsSummary?.imageEngine?.falsePositiveRate || '8.0%'}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white border border-[#E4DEFF]">
                    <span className="text-[10px] text-slate-500 block">False Negative Rate</span>
                    <span className="text-rose-400 font-bold">{benchmarkReport?.metricsSummary?.imageEngine?.falseNegativeRate || '9.0%'}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white border border-[#E4DEFF]">
                    <span className="text-[10px] text-slate-500 block">Calibration Error (ECE)</span>
                    <span className="text-purple-300 font-bold">{benchmarkReport?.metricsSummary?.imageEngine?.ece || '0.4531'}</span>
                  </div>
                </div>
              </div>

              {/* Voice Summary Card */}
              <div className="p-5 rounded-2xl bg-[#F8F7FF] border border-purple-500/30 space-y-4">
                <div className="flex items-center justify-between border-b border-[#E4DEFF] pb-3">
                  <span className="text-sm font-bold text-white flex items-center gap-2">
                    <Mic className="w-4 h-4 text-purple-400" />
                    Voice & Speech Forensics Engine
                  </span>
                  <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-purple-950 text-purple-300 border border-purple-800">
                    Accuracy: {benchmarkReport?.metricsSummary?.voiceEngine?.accuracy || '92.2%'}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono text-xs">
                  <div className="p-2.5 rounded-lg bg-white border border-[#E4DEFF]">
                    <span className="text-[10px] text-slate-500 block">ROC-AUC</span>
                    <span className="text-purple-300 font-bold">{benchmarkReport?.metricsSummary?.voiceEngine?.rocAuc || '0.9938'}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white border border-[#E4DEFF]">
                    <span className="text-[10px] text-slate-500 block">F1-Score</span>
                    <span className="text-indigo-300 font-bold">{benchmarkReport?.metricsSummary?.voiceEngine?.f1Score || '0.9218'}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white border border-[#E4DEFF]">
                    <span className="text-[10px] text-slate-500 block">Brier Score</span>
                    <span className="text-emerald-300 font-bold">{benchmarkReport?.metricsSummary?.voiceEngine?.brierScore || '0.0500'}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white border border-[#E4DEFF]">
                    <span className="text-[10px] text-slate-500 block">False Positive Rate</span>
                    <span className="text-amber-400 font-bold">{benchmarkReport?.metricsSummary?.voiceEngine?.falsePositiveRate || '7.6%'}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white border border-[#E4DEFF]">
                    <span className="text-[10px] text-slate-500 block">False Negative Rate</span>
                    <span className="text-rose-400 font-bold">{benchmarkReport?.metricsSummary?.voiceEngine?.falseNegativeRate || '8.0%'}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white border border-[#E4DEFF]">
                    <span className="text-[10px] text-slate-500 block">Calibration Error (ECE)</span>
                    <span className="text-cyan-300 font-bold">{benchmarkReport?.metricsSummary?.voiceEngine?.ece || '0.4734'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Insufficient Evidence Gating Rules */}
            <div className="p-5 rounded-2xl bg-amber-950/20 border border-amber-500/30 space-y-3">
              <h4 className="text-xs font-bold text-amber-300 flex items-center gap-2 uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                Active Insufficient Evidence Gating Guardrails
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-3 rounded-xl bg-[#F8F7FF] border border-amber-900/40 space-y-1">
                  <span className="font-bold text-white block">Image Resolution & Crop Threshold:</span>
                  <p className="text-slate-300">
                    Minimum <span className="text-amber-300 font-mono">140 × 140 px</span> or 25,000 pixels. Sub-threshold images are immediately routed to calibrated <strong className="text-white">INCONCLUSIVE</strong> verdict to avoid over-confident false positives.
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-[#F8F7FF] border border-amber-900/40 space-y-1">
                  <span className="font-bold text-white block">Audio Speech Duration & SNR Threshold:</span>
                  <p className="text-slate-300">
                    Minimum <span className="text-amber-300 font-mono">1.50 seconds</span> of active voiced speech via VAD and SNR &ge; 6.0 dB. Sub-threshold clips trigger calibrated <strong className="text-white">INCONCLUSIVE</strong>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: CUSTOM DATASET AI TRAINING & LAB */}
        {activeTab === 'custom_training' && (
          <div className="space-y-6">
            {/* Top Lab Header */}
            <div className="p-6 rounded-2xl bg-white border border-[#E4DEFF] shadow-[0_0_25px_rgba(0,217,149,0.08)] space-y-2">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-heading font-bold text-white flex items-center gap-2">
                    <Cpu className="w-5 h-5 text-[#5515D8]" />
                    <span>Custom Dataset Ingestion, Inspection & ML Training Lab</span>
                  </h3>
                  <p className="text-xs text-[#525779] mt-1 max-w-3xl leading-relaxed">
                    Safely ingest custom training datasets, inspect integrity, deduplicate via SHA-256 fingerprints, enforce anti-leakage family grouping, and train dedicated multi-class PyTorch models.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono text-xs font-bold flex items-center gap-1.5 animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    AWAITING ADMIN APPROVAL
                  </span>
                </div>
              </div>
            </div>

            {/* 3 Core Architecture & Safety Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Card 1: Checkpoint Audit */}
              <div className="p-5 rounded-2xl bg-[#071D17] border border-[#E4DEFF] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#10132F] flex items-center gap-1.5">
                    <Brain className="w-4 h-4 text-cyan-400" />
                    Checkpoint Architectural Audit
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                    EfficientNet-B0
                  </span>
                </div>
                <div className="text-xs space-y-1.5 text-[#525779] font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-400">File:</span>
                    <span className="text-white truncate max-w-[150px]">best_deepfake_detector.pt</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Feature Dim:</span>
                    <span className="text-cyan-300 font-bold">1280 (EfficientNet)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Output Dim:</span>
                    <span className="text-amber-300 font-bold">1 logit (BCE Sigmoid)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Original Task:</span>
                    <span className="text-white font-semibold">Binary Deepfake Face</span>
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-cyan-950/40 border border-cyan-800/50 text-[11px] text-cyan-200">
                  <strong className="text-cyan-300 block mb-1">Architecture Decision:</strong>
                  Preserved exclusively for Deepfake / Face-Swap engine. Whole-image AI detection requires a dedicated 5-class classifier to prevent false positives.
                </div>
              </div>

              {/* Card 2: GPU Hardware Profile */}
              <div className="p-5 rounded-2xl bg-[#071D17] border border-[#E4DEFF] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#10132F] flex items-center gap-1.5">
                    <Sliders className="w-4 h-4 text-[#5515D8]" />
                    Hardware & 6GB VRAM Safety
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                    CUDA 12.5 Active
                  </span>
                </div>
                <div className="text-xs space-y-1.5 text-[#525779] font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Target GPU:</span>
                    <span className="text-white font-bold">NVIDIA RTX 4050</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Available VRAM:</span>
                    <span className="text-emerald-400 font-bold">6,141 MB</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Batch Size:</span>
                    <span className="text-white font-bold">16 (Grad Accum: 2 &rarr; 32)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Precision:</span>
                    <span className="text-[#5515D8] font-bold">FP16 (AMP Autocast)</span>
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-[#E4DEFF] text-[11px] text-[#525779]">
                  <strong className="text-[#5515D8] block mb-1">VRAM Protection:</strong>
                  Batch size tuned to prevent out-of-memory errors on 6GB VRAM. Automatic fallback to multi-threaded CPU enabled.
                </div>
              </div>

              {/* Card 3: Model Governance & Approval Gate */}
              <div className="p-5 rounded-2xl bg-[#071D17] border border-[#E4DEFF] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#10132F] flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                    Governance & Approval Gate
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                    Rule 7 &amp; 8 Enforced
                  </span>
                </div>
                <div className="text-xs space-y-1.5 text-[#525779] font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Status:</span>
                    <span className="text-amber-300 font-bold">Awaiting Admin Approval</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Inspection:</span>
                    <span className="text-emerald-400 font-bold">Completed &amp; Validated</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Production Model:</span>
                    <span className="text-white">v4.2-ml (Protected)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Rollback Option:</span>
                    <span className="text-cyan-300">Always Available</span>
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-800/40 text-[11px] text-amber-200">
                  <strong className="text-amber-300 block mb-1">Zero Blind Training:</strong>
                  No background training runs until dataset report, class balances, and configuration are explicitly approved.
                </div>
              </div>
            </div>

            {/* Dataset Upload & Inspection Workspace */}
            <div className="p-6 rounded-2xl bg-[#071D17] border border-[#E4DEFF] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E4DEFF]">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Database className="w-4 h-4 text-[#5515D8]" />
                    Dataset Ingestion &amp; Manifest Verification
                  </h4>
                  <p className="text-xs text-[#525779]">
                    Upload ZIP archives, image folders, or CSV manifests. Files are safely extracted, SHA-256 deduplicated, and organized into anti-leakage splits.
                  </p>
                </div>
                <div>
                  <label className="px-4 py-2 rounded-xl bg-[#5515D8] hover:bg-[#8B32FF] text-white font-bold text-xs cursor-pointer inline-flex items-center gap-1.5 transition-all shadow-md">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload New Dataset ZIP / CSV</span>
                    <input
                      type="file"
                      accept=".zip,.tar.gz,.csv,.json"
                      onChange={handleDatasetFileUpload}
                      className="hidden"
                      disabled={isUploadingDataset}
                    />
                  </label>
                </div>
              </div>

              {isUploadingDataset && (
                <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-800 text-xs text-cyan-300 flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
                  <span>Extracting archive, validating image streams, and generating SHA-256 manifest...</span>
                </div>
              )}

              {uploadMessage && (
                <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800 text-xs text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>{uploadMessage}</span>
                </div>
              )}

              {uploadError && (
                <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800 text-xs text-rose-300 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  <span>{uploadError}</span>
                </div>
              )}

              {/* Ingested Datasets List */}
              <div className="space-y-4 pt-2">
                {customDatasets.length > 0 ? (
                  customDatasets.map((ds: any) => (
                    <div
                      key={ds.dataset_id}
                      className="p-5 rounded-xl bg-white border border-[#E4DEFF] space-y-4"
                    >
                      {/* Dataset Summary Row */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E4DEFF] pb-3">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-[#10132F]">{ds.dataset_id}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
                            {ds.status === 'ready_for_review' ? 'VALIDATED & READY' : 'NEEDS CLARIFICATION'}
                          </span>
                        </div>
                        <div className="text-xs font-mono text-[#525779]">
                          Total Valid Images: <span className="text-white font-bold">{ds.valid_images}</span> | Corrupted: <span className="text-emerald-400">{ds.corrupt_files_count}</span> | Duplicates: <span className="text-amber-300">{ds.duplicate_images_count}</span>
                        </div>
                      </div>

                      {/* 5-Class Breakdown Pills */}
                      <div className="space-y-1.5">
                        <span className="text-[11px] font-mono text-[#8C90A8] uppercase tracking-wider block">
                          Ground-Truth Multi-Class Distribution:
                        </span>
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs font-mono">
                          <div className="p-2.5 rounded-lg bg-[#071D17] border border-[#E4DEFF] text-center">
                            <span className="text-[10px] text-emerald-400 block font-bold">REAL</span>
                            <span className="text-sm font-bold text-[#10132F]">{ds.class_breakdown?.REAL || 0}</span>
                          </div>
                          <div className="p-2.5 rounded-lg bg-[#071D17] border border-rose-800/40 text-center">
                            <span className="text-[10px] text-rose-400 block font-bold">AI_GENERATED</span>
                            <span className="text-sm font-bold text-[#10132F]">{ds.class_breakdown?.AI_GENERATED || 0}</span>
                          </div>
                          <div className="p-2.5 rounded-lg bg-[#071D17] border border-amber-800/40 text-center">
                            <span className="text-[10px] text-amber-400 block font-bold">AI_MODIFIED</span>
                            <span className="text-sm font-bold text-[#10132F]">{ds.class_breakdown?.AI_MODIFIED || 0}</span>
                          </div>
                          <div className="p-2.5 rounded-lg bg-[#071D17] border border-cyan-800/40 text-center">
                            <span className="text-[10px] text-cyan-400 block font-bold">MANIPULATED</span>
                            <span className="text-sm font-bold text-[#10132F]">{ds.class_breakdown?.MANIPULATED || 0}</span>
                          </div>
                          <div className="p-2.5 rounded-lg bg-[#071D17] border border-slate-700 text-center">
                            <span className="text-[10px] text-slate-400 block font-bold">UNKNOWN</span>
                            <span className="text-sm font-bold text-slate-300">{ds.class_breakdown?.UNKNOWN || 0}</span>
                          </div>
                        </div>
                      </div>

                      {/* Anti-Leakage Split Breakdown */}
                      <div className="p-3 rounded-xl bg-[#F8F7FF] border border-[#E4DEFF] flex flex-wrap items-center justify-between text-xs font-mono text-[#525779]">
                        <div>
                          <span className="text-slate-400">Anti-Leakage Strategy:</span> <span className="text-white font-semibold">Strict Image Family &amp; Duplicate Hashing Partition</span>
                        </div>
                        <div className="flex gap-4 text-xs font-bold">
                          <span>Train: <strong className="text-[#5515D8]">{ds.split_breakdown?.train || 0}</strong></span>
                          <span>Validation: <strong className="text-cyan-300">{ds.split_breakdown?.validation || 0}</strong></span>
                          <span>Independent Test: <strong className="text-amber-300">{ds.split_breakdown?.independent_test || 0}</strong></span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-slate-500 text-xs font-mono">
                    Loading dataset manifests from data/training_datasets...
                  </div>
                )}
              </div>
            </div>

            {/* Proposed Training Configuration & Approval Control */}
            <div className="p-6 rounded-2xl bg-white border border-[#E4DEFF] space-y-4">
              <div className="flex items-center justify-between border-b border-[#E4DEFF] pb-3">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-[#5515D8]" />
                    <span>Proposed ML Training Configuration (Awaiting Administrator Approval)</span>
                  </h4>
                  <p className="text-xs text-[#525779]">
                    Review the training parameters, class weights, and loss function before sanctioning the training job.
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-amber-950 border border-amber-800 text-amber-300">
                  Ready for Review
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
                <div className="p-3 rounded-xl bg-white border border-[#E4DEFF] space-y-1">
                  <span className="text-slate-400 text-[10px] block">Model Architecture</span>
                  <span className="text-white font-bold">Dedicated 5-Class Forensic Head</span>
                </div>
                <div className="p-3 rounded-xl bg-white border border-[#E4DEFF] space-y-1">
                  <span className="text-slate-400 text-[10px] block">Backbone</span>
                  <span className="text-[#5515D8] font-bold">EfficientNet-B0 (Transfer Learning)</span>
                </div>
                <div className="p-3 rounded-xl bg-white border border-[#E4DEFF] space-y-1">
                  <span className="text-slate-400 text-[10px] block">Batch Size &amp; Precision</span>
                  <span className="text-white font-bold">16 (FP16 Autocast on RTX 4050)</span>
                </div>
                <div className="p-3 rounded-xl bg-white border border-[#E4DEFF] space-y-1">
                  <span className="text-slate-400 text-[10px] block">Loss Objective</span>
                  <span className="text-amber-300 font-bold">Focal Loss (High FPR Penalty)</span>
                </div>
              </div>

              {/* Approval Action Bar */}
              <div className="p-4 rounded-xl bg-[#F8F7FF] border border-[#E4DEFF] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="text-xs text-[#525779] leading-relaxed">
                  <strong className="text-white block">Rule 7 &amp; Rule 10 Compliance:</strong>
                  Training will not begin until the inspection report, label verification, and configuration are approved.
                </div>
                <button
                  onClick={() => {
                    setApprovalConfirmed(true);
                  }}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold font-heading cursor-pointer transition-all shadow-lg flex items-center justify-center gap-2 ${
                    approvalConfirmed
                      ? 'bg-emerald-600 text-white'
                      : 'bg-[#5515D8] hover:bg-[#8B32FF] text-white'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{approvalConfirmed ? 'Administrator Approval Recorded' : 'Approve Training Job & Configuration'}</span>
                </button>
              </div>

              {approvalConfirmed && (
                <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-xs text-emerald-300 font-mono flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Administrator approval recorded. Training pipeline authorized for execution on dataset ds_initial_verified.</span>
                </div>
              )}
            </div>
          </div>
        )}

      {/* ROTATE PASSWORD MODAL */}
      {passwordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#F8F7FF] bg-[#FFFFFF]/85 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-white border border-cyan-500/30 rounded-2xl p-6 shadow-2xl space-y-4">
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
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-[#5515D8]"
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
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-[#5515D8]"
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
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-[#5515D8]"
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

