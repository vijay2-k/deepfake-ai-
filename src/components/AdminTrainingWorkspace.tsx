import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Send,
  Upload,
  Globe,
  CheckCircle2,
  AlertTriangle,
  X,
  FileCheck2,
  Sparkles,
  Bot,
  User,
  Plus,
  RefreshCw,
  Eye,
  FileText,
  Video,
  Mic,
  Image as ImageIcon,
  Layers,
  ChevronDown,
  ShieldCheck,
  Check,
  Clock,
  Terminal,
} from 'lucide-react';
import {
  TrainingTarget,
  TrainingSession,
  TrainingMessage,
  TrainingReference,
  TrainingPlan,
  UserProfile,
} from '../types/detector';

interface AdminTrainingWorkspaceProps {
  targetAi: TrainingTarget;
  user: UserProfile | null;
  onBackToOverview: () => void;
}

export const AdminTrainingWorkspace: React.FC<AdminTrainingWorkspaceProps> = ({
  targetAi,
  user,
  onBackToOverview,
}) => {
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [currentSession, setCurrentSession] = useState<TrainingSession | null>(null);
  const [inputContent, setInputContent] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [urlModalOpen, setUrlModalOpen] = useState(false);
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [rejectionModalOpen, setRejectionModalOpen] = useState(false);
  const [rejectionNotes, setRejectionNotes] = useState('');

  // Upload Form State
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [sampleType, setSampleType] = useState<'synthetic' | 'authentic' | 'benchmark'>('synthetic');
  const [sampleDesc, setSampleDesc] = useState('');
  const [adminObservations, setAdminObservations] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // URL Form State
  const [researchUrl, setResearchUrl] = useState('');
  const [researchNotes, setResearchNotes] = useState('');
  const [isFetchingUrl, setIsFetchingUrl] = useState(false);
  const [urlFetchResult, setUrlFetchResult] = useState<any>(null);

  // Success Notification
  const [activationSuccess, setActivationSuccess] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const adminToken = user?.adminToken || localStorage.getItem('kryptx_admin_token') || '';

  const targetMeta = {
    image: {
      name: 'Image Forensics AI',
      color: 'cyan',
      themeBorder: 'border-cyan-500/40',
      themeText: 'text-cyan-400',
      themeGlow: 'shadow-[0_0_20px_rgba(0,229,255,0.2)]',
      themeBg: 'bg-cyan-500/10',
      icon: ImageIcon,
      activeVersion: 'v1.0',
    },
    video: {
      name: 'Video Deepfake Forensics AI',
      color: 'blue',
      themeBorder: 'border-blue-500/40',
      themeText: 'text-blue-400',
      themeGlow: 'shadow-[0_0_20px_rgba(41,121,255,0.2)]',
      themeBg: 'bg-blue-500/10',
      icon: Video,
      activeVersion: 'v1.0',
    },
    voice: {
      name: 'Voice Forensics AI',
      color: 'purple',
      themeBorder: 'border-purple-500/40',
      themeText: 'text-purple-400',
      themeGlow: 'shadow-[0_0_20px_rgba(179,136,255,0.2)]',
      themeBg: 'bg-purple-500/10',
      icon: Mic,
      activeVersion: 'v1.0',
    },
  }[targetAi];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentSession?.messages, isSending]);

  // Load Sessions for this Target AI
  const fetchSessions = async (autoSelectFirst = true) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/intelligence/sessions?target=${targetAi}`, {
        headers: {
          Authorization: `Bearer ${adminToken}`,
          'x-admin-token': adminToken,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setSessions(data.sessions || []);
        if (autoSelectFirst && data.sessions && data.sessions.length > 0) {
          setCurrentSession(data.sessions[0]);
        } else if (data.sessions && data.sessions.length === 0) {
          // Auto create initial session
          createSession();
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [targetAi]);

  // Create New Session
  const createSession = async () => {
    try {
      const res = await fetch('/api/admin/intelligence/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
          'x-admin-token': adminToken,
        },
        body: JSON.stringify({
          targetAi,
          title: `${targetAi.toUpperCase()} Calibration Session #${sessions.length + 1}`,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setSessions((prev) => [data.session, ...prev]);
        setCurrentSession(data.session);
      }
    } catch (err: any) {
      alert('Failed to initialize calibration session: ' + err.message);
    }
  };

  // Send Message or Trigger 'END'
  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputContent;
    if (!textToSend.trim() || !currentSession || isSending) return;

    setIsSending(true);
    setInputContent('');
    setError(null);

    try {
      const res = await fetch(`/api/admin/intelligence/sessions/${currentSession.id}/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
          'x-admin-token': adminToken,
        },
        body: JSON.stringify({ content: textToSend }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to process training message');
      }

      setCurrentSession(data.session);
      setSessions((prev) => prev.map((s) => (s.id === data.session.id ? data.session : s)));

      // If 'END' was triggered, automatically open the Plan Review modal
      if (textToSend.trim().toUpperCase() === 'END' && data.plan) {
        setPlanModalOpen(true);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSending(false);
    }
  };

  // Upload Reference Media
  const handleUploadReference = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile || !currentSession) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', uploadFile);
    formData.append('sampleType', sampleType);
    formData.append('description', sampleDesc || uploadFile.name);
    formData.append('adminObservations', adminObservations);

    try {
      const res = await fetch(`/api/admin/intelligence/sessions/${currentSession.id}/reference`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${adminToken}`,
          'x-admin-token': adminToken,
        },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to upload reference media');

      setCurrentSession(data.session);
      setSessions((prev) => prev.map((s) => (s.id === data.session.id ? data.session : s)));
      setUploadModalOpen(false);
      setUploadFile(null);
      setSampleDesc('');
      setAdminObservations('');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  // Ingest External URL
  const handleFetchUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!researchUrl || !currentSession) return;

    setIsFetchingUrl(true);
    setUrlFetchResult(null);

    try {
      const res = await fetch('/api/admin/intelligence/fetch-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
          'x-admin-token': adminToken,
        },
        body: JSON.stringify({
          url: researchUrl,
          sessionId: currentSession.id,
          notes: researchNotes,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch external URL');

      setUrlFetchResult(data);
      // Reload session to reflect ingested reference and chat notification
      const sessionRes = await fetch(`/api/admin/intelligence/sessions/${currentSession.id}`, {
        headers: {
          Authorization: `Bearer ${adminToken}`,
          'x-admin-token': adminToken,
        },
      });
      if (sessionRes.ok) {
        const sData = await sessionRes.json();
        setCurrentSession(sData.session);
        setSessions((prev) => prev.map((s) => (s.id === sData.session.id ? sData.session : s)));
      }

      setTimeout(() => {
        setUrlModalOpen(false);
        setResearchUrl('');
        setResearchNotes('');
        setUrlFetchResult(null);
      }, 1200);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsFetchingUrl(false);
    }
  };

  // Approve & Activate Training Plan
  const handleApprovePlan = async () => {
    if (!currentSession || !currentSession.proposedPlan) return;

    try {
      const res = await fetch(`/api/admin/intelligence/sessions/${currentSession.id}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
          'x-admin-token': adminToken,
        },
        body: JSON.stringify({ plan: currentSession.proposedPlan }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to approve plan');

      setActivationSuccess(
        `RELEASE ACTIVATED: Knowledge Version ${data.release.version} is now LIVE across all ${targetAi.toUpperCase()} analysis pipelines.`
      );
      setPlanModalOpen(false);

      // Refresh session
      const sRes = await fetch(`/api/admin/intelligence/sessions/${currentSession.id}`, {
        headers: {
          Authorization: `Bearer ${adminToken}`,
          'x-admin-token': adminToken,
        },
      });
      if (sRes.ok) {
        const sData = await sRes.json();
        setCurrentSession(sData.session);
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Reject / Request Revisions
  const handleRejectPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSession) return;

    try {
      const res = await fetch(`/api/admin/intelligence/sessions/${currentSession.id}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
          'x-admin-token': adminToken,
        },
        body: JSON.stringify({ feedback: rejectionNotes }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to reject plan');

      setCurrentSession(data.session);
      setSessions((prev) => prev.map((s) => (s.id === data.session.id ? data.session : s)));
      setRejectionModalOpen(false);
      setPlanModalOpen(false);
      setRejectionNotes('');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const IconComp = targetMeta.icon;

  return (
    <div className="flex flex-col h-screen bg-[#F8F7FF] bg-[#FFFFFF] text-slate-200 overflow-hidden selection:bg-[#5515D8]/30 selection:text-[#5515D8]">
      {/* Top Banner / Header */}
      <header className="h-16 px-4 sm:px-6 flex items-center justify-between bg-white border-b border-cyan-500/20 shrink-0 z-20">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToOverview}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Return to Control Center"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-lg ${targetMeta.themeBg} ${targetMeta.themeBorder} border`}>
              <IconComp className={`w-4 h-4 ${targetMeta.themeText}`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-heading font-bold text-white tracking-wide">
                  {targetMeta.name}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold">
                  ACTIVE: {targetMeta.activeVersion}
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                {currentSession?.title || 'Forensic Calibration Session'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {currentSession?.proposedPlan && (
            <button
              onClick={() => setPlanModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-purple-500/20 border border-purple-500/40 text-purple-300 hover:bg-purple-500/30 transition-colors shadow-lg animate-pulse"
            >
              <FileCheck2 className="w-3.5 h-3.5" />
              <span>Review Proposed Plan</span>
            </button>
          )}

          <button
            onClick={() => handleSendMessage('END')}
            disabled={isSending || currentSession?.status === 'plan_generated'}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-heading font-bold bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 hover:from-cyan-400 hover:to-blue-500 transition-all shadow-md disabled:opacity-50"
            title="Synthesize 8-section formal Training Plan"
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Finish & Generate Plan (END)</span>
          </button>
        </div>
      </header>

      {/* Main Container: Sidebar + Chat Feed */}
      <div className="flex flex-1 overflow-hidden">
        {/* LEFT SIDEBAR: Sessions & References */}
        <aside className="w-80 border-r border-[#E4DEFF] bg-[#060B18] flex flex-col shrink-0 hidden md:flex">
          {/* New Session Button */}
          <div className="p-3 border-b border-[#E4DEFF]">
            <button
              onClick={createSession}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold bg-slate-900 border border-slate-700 hover:border-cyan-500/50 hover:text-white text-slate-300 transition-colors"
            >
              <Plus className="w-4 h-4 text-cyan-400" />
              <span>New Calibration Session</span>
            </button>
          </div>

          {/* Session List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-slate-500">
              Calibration Sessions ({sessions.length})
            </div>
            {sessions.map((sess) => {
              const isActive = sess.id === currentSession?.id;
              return (
                <button
                  key={sess.id}
                  onClick={() => setCurrentSession(sess)}
                  className={`w-full text-left p-2.5 rounded-xl transition-all flex flex-col gap-1 ${
                    isActive
                      ? 'bg-cyan-500/10 border border-cyan-500/30 text-white'
                      : 'hover:bg-[#F8F7FF] border border-transparent text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="truncate">{sess.title}</span>
                    {sess.status === 'approved' && (
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300">
                        APPROVED
                      </span>
                    )}
                    {sess.status === 'plan_generated' && (
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300">
                        PENDING
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                    <span>{sess.references.length} ref{sess.references.length !== 1 ? 's' : ''}</span>
                    <span>{new Date(sess.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Ingested References Manifest */}
          <div className="p-3 border-t border-[#E4DEFF] bg-white/60 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
              <span className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                <span>Ingested References</span>
              </span>
              <span className="text-[11px] font-mono text-cyan-400">
                {currentSession?.references.length || 0}
              </span>
            </div>

            <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
              {currentSession?.references && currentSession.references.length > 0 ? (
                currentSession.references.map((ref) => (
                  <div
                    key={ref.id}
                    className="p-2 rounded-lg bg-[#F8F7FF] border border-[#E4DEFF] text-[11px] space-y-1 font-mono"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-white font-semibold truncate max-w-[170px]">
                        {ref.name}
                      </span>
                      <span className="text-[9px] uppercase px-1 py-0.2 rounded bg-slate-800 text-cyan-300">
                        {ref.type}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">
                      {ref.extractedObservations}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-3 text-[11px] text-slate-500">
                  No reference samples attached yet.
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* MAIN CHAT & TRAINING WORKSPACE */}
        <main className="flex-1 flex flex-col bg-[#F8F7FF] bg-[#FFFFFF] relative">
          {/* Activation Success Banner */}
          {activationSuccess && (
            <div className="p-3 bg-emerald-950/80 border-b border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-between px-6 z-10 animate-fade-in">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-semibold">{activationSuccess}</span>
              </div>
              <button onClick={() => setActivationSuccess(null)} className="text-emerald-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {currentSession?.messages && currentSession.messages.length > 0 ? (
              currentSession.messages.map((msg) => {
                const isAdmin = msg.sender === 'admin';
                return (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-3 ${isAdmin ? 'justify-end' : 'justify-start'}`}
                  >
                    {!isAdmin && (
                      <div className={`p-2 rounded-xl shrink-0 ${targetMeta.themeBg} ${targetMeta.themeBorder} border`}>
                        <Bot className={`w-4 h-4 ${targetMeta.themeText}`} />
                      </div>
                    )}

                    <div
                      className={`max-w-2xl rounded-2xl p-4 text-xs leading-relaxed space-y-2 ${
                        isAdmin
                          ? 'bg-cyan-950/40 border border-cyan-500/30 text-cyan-100 rounded-tr-none'
                          : 'bg-white border border-[#E4DEFF] text-slate-300 rounded-tl-none shadow-xl'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-4 text-[10px] font-mono text-slate-500 border-b border-[#E4DEFF]/60 pb-1.5">
                        <span className="font-bold uppercase tracking-wider text-slate-400">
                          {isAdmin ? 'Administrator Instruction' : `${targetMeta.name} Directive`}
                        </span>
                        <span>{new Date(msg.timestamp).toLocaleTimeString()}</span>
                      </div>

                      <div className="whitespace-pre-wrap">{msg.content}</div>

                      {/* References Attached in Message */}
                      {msg.references && msg.references.length > 0 && (
                        <div className="pt-2 border-t border-[#E4DEFF]/80 space-y-2">
                          {msg.references.map((ref) => (
                            <div
                              key={ref.id}
                              className="p-2.5 rounded-xl bg-slate-900 border border-[#E4DEFF] space-y-1 font-mono"
                            >
                              <div className="flex items-center justify-between text-[11px] text-cyan-300 font-bold">
                                <span>{ref.name}</span>
                                <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                                  {ref.source}
                                </span>
                              </div>
                              <div className="text-[10px] text-slate-300">
                                {ref.extractedObservations}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Plan Proposal Card in Message */}
                      {msg.planProposal && (
                        <div className="pt-2">
                          <button
                            onClick={() => setPlanModalOpen(true)}
                            className="w-full py-2 px-3 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-200 hover:bg-purple-500/30 font-semibold text-xs flex items-center justify-between transition-colors"
                          >
                            <span className="flex items-center gap-1.5">
                              <FileCheck2 className="w-4 h-4 text-purple-400" />
                              <span>View Synthesized Training Plan ({msg.planProposal.section8Version})</span>
                            </span>
                            <span className="text-[11px] underline">Open Review →</span>
                          </button>
                        </div>
                      )}
                    </div>

                    {isAdmin && (
                      <div className="p-2 rounded-xl shrink-0 bg-cyan-500/20 border border-cyan-500/40 text-cyan-400">
                        <User className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-3">
                <IconComp className="w-12 h-12 text-slate-600 animate-pulse" />
                <h3 className="text-sm font-heading font-bold text-slate-400">
                  Ready for Forensic Parameter Calibration
                </h3>
                <p className="text-xs text-slate-500 max-w-md">
                  Provide detection instructions, upload reference media samples, or ingest scientific benchmark URLs.
                </p>
              </div>
            )}

            {isSending && (
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-xl shrink-0 ${targetMeta.themeBg} ${targetMeta.themeBorder} border`}>
                  <Bot className={`w-4 h-4 ${targetMeta.themeText} animate-spin`} />
                </div>
                <div className="bg-white border border-[#E4DEFF] rounded-2xl p-3 text-xs text-slate-400 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  <span>Synthesizing forensic guidance and evaluating empirical parameters...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-2.5 mx-4 mb-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center justify-between">
              <span>{error}</span>
              <button onClick={() => setError(null)} className="text-red-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Bottom Control & Input Bar */}
          <div className="p-4 bg-white border-t border-[#E4DEFF] shrink-0 space-y-2">
            {/* Action Bar */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setUploadModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-slate-900 border border-slate-700 hover:border-cyan-500/50 hover:text-white transition-colors"
              >
                <Upload className="w-3.5 h-3.5 text-cyan-400" />
                <span>Upload Media Reference</span>
              </button>

              <button
                type="button"
                onClick={() => setUrlModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-slate-900 border border-slate-700 hover:border-cyan-500/50 hover:text-white transition-colors"
              >
                <Globe className="w-3.5 h-3.5 text-blue-400" />
                <span>Ingest Research URL</span>
              </button>

              <button
                type="button"
                onClick={() => handleSendMessage('END')}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-purple-500/10 border border-purple-500/30 text-purple-300 hover:bg-purple-500/20 text-[11px] font-mono transition-colors ml-auto"
                title="Synthesize 8-section formal Training Plan"
              >
                <span>Type <strong>END</strong> to finish session</span>
              </button>
            </div>

            {/* Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-end gap-2"
            >
              <textarea
                value={inputContent}
                onChange={(e) => setInputContent(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder={`Provide forensic observations, detection rules, or empirical edge cases... (or type "END" to synthesize formal plan)`}
                rows={2}
                className="flex-1 px-4 py-2.5 rounded-xl bg-[#F8F7FF] border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-[#5515D8] transition-colors resize-none"
              />

              <button
                type="submit"
                disabled={!inputContent.trim() || isSending}
                className="p-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition-all shadow-md disabled:opacity-40 disabled:hover:bg-cyan-500 shrink-0"
                title="Send Instruction"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </main>
      </div>

      {/* MODAL 1: UPLOAD REFERENCE MEDIA */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#F8F7FF] bg-[#FFFFFF]/85 backdrop-blur-md">
          <div className="relative w-full max-w-lg bg-white border border-cyan-500/30 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E4DEFF]">
              <h3 className="text-base font-heading font-bold text-white flex items-center gap-2">
                <Upload className="w-5 h-5 text-cyan-400" />
                <span>Upload Reference Sample</span>
              </h3>
              <button onClick={() => setUploadModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadReference} className="space-y-4">
              <div>
                <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1">
                  Reference File (Image, Video, or Audio)
                </label>
                <input
                  type="file"
                  required
                  ref={fileInputRef}
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-slate-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-cyan-500 file:text-slate-950 hover:file:bg-cyan-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1">
                  Sample Category
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['synthetic', 'authentic', 'benchmark'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setSampleType(type)}
                      className={`py-1.5 px-3 rounded-lg text-xs font-mono capitalize border transition-all ${
                        sampleType === type
                          ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                          : 'bg-slate-900 border-slate-700 text-slate-400'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1">
                  Sample Label / Title
                </label>
                <input
                  type="text"
                  value={sampleDesc}
                  onChange={(e) => setSampleDesc(e.target.value)}
                  placeholder="e.g. Midjourney v6 High-Frequency Latent Noise Reference"
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-[#5515D8]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1">
                  Administrator Observations & Forensic Notes
                </label>
                <textarea
                  rows={3}
                  value={adminObservations}
                  onChange={(e) => setAdminObservations(e.target.value)}
                  placeholder="Describe specific anomalies: e.g., specular divergence on iris, Sobel gradient distortion, vocoder phase metallic buzz..."
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-[#5515D8]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setUploadModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading || !uploadFile}
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-heading"
                >
                  {isUploading ? 'Ingesting Sample...' : 'Ingest Reference Media'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: INGEST RESEARCH URL */}
      {urlModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#F8F7FF] bg-[#FFFFFF]/85 backdrop-blur-md">
          <div className="relative w-full max-w-lg bg-white border border-blue-500/30 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E4DEFF]">
              <h3 className="text-base font-heading font-bold text-white flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-400" />
                <span>Ingest Forensic Research URL</span>
              </h3>
              <button onClick={() => setUrlModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFetchUrl} className="space-y-4">
              <div>
                <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1">
                  Public Research or Benchmark URL (SSRF Protected)
                </label>
                <input
                  type="url"
                  required
                  value={researchUrl}
                  onChange={(e) => setResearchUrl(e.target.value)}
                  placeholder="https://arxiv.org/abs/... or https://..."
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-[#5515D8]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1">
                  Context / Notes for Detector
                </label>
                <textarea
                  rows={2}
                  value={researchNotes}
                  onChange={(e) => setResearchNotes(e.target.value)}
                  placeholder="Focus on temporal boundary anomalies and lip sync metrics..."
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-[#5515D8]"
                />
              </div>

              {urlFetchResult && (
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono">
                  ✓ Successfully extracted: {urlFetchResult.title}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setUrlModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isFetchingUrl || !researchUrl}
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-blue-500 hover:bg-blue-400 text-white font-heading"
                >
                  {isFetchingUrl ? 'Fetching & Summarizing...' : 'Fetch & Ingest Research'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: THE 8-SECTION TRAINING PLAN REVIEW */}
      {planModalOpen && currentSession?.proposedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#F8F7FF] bg-[#FFFFFF]/90 backdrop-blur-lg">
          <div className="relative w-full max-w-4xl max-h-[90vh] bg-white border border-cyan-500/40 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-cyan-500/20 bg-[#060B18] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-400">
                  <FileCheck2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold">
                      FORMAL PROPOSED PLAN
                    </span>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 font-bold">
                      TARGET: {currentSession.proposedPlan.section8Version}
                    </span>
                  </div>
                  <h3 className="text-lg font-heading font-bold text-white mt-0.5">
                    Operational Forensic Calibration Plan
                  </h3>
                </div>
              </div>

              <button onClick={() => setPlanModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: 8 Structured Sections */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-slate-300 font-sans">
              {/* Section 1 */}
              <div className="p-4 rounded-xl bg-[#F8F7FF] border border-[#E4DEFF] space-y-1.5">
                <div className="text-[11px] font-mono uppercase tracking-wider text-cyan-400 font-bold">
                  Section 1 — Training Objective & Target System
                </div>
                <div className="text-white text-sm font-semibold">
                  {currentSession.proposedPlan.section1Objective}
                </div>
              </div>

              {/* Section 2 */}
              <div className="p-4 rounded-xl bg-[#F8F7FF] border border-[#E4DEFF] space-y-2">
                <div className="text-[11px] font-mono uppercase tracking-wider text-cyan-400 font-bold">
                  Section 2 — Core Forensic Knowledge & Signatures
                </div>
                <ul className="list-disc list-inside space-y-1 pl-1">
                  {currentSession.proposedPlan.section2Knowledge.map((item, i) => (
                    <li key={i} className="text-slate-200">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Section 3 */}
              <div className="p-4 rounded-xl bg-[#F8F7FF] border border-[#E4DEFF] space-y-2">
                <div className="text-[11px] font-mono uppercase tracking-wider text-cyan-400 font-bold">
                  Section 3 — Reference Material & Sample Manifest
                </div>
                <ul className="list-disc list-inside space-y-1 pl-1">
                  {currentSession.proposedPlan.section3ReferenceMaterial.map((item, i) => (
                    <li key={i} className="text-slate-200 font-mono text-[11px]">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Section 4 */}
              <div className="p-4 rounded-xl bg-[#F8F7FF] border border-[#E4DEFF] space-y-2">
                <div className="text-[11px] font-mono uppercase tracking-wider text-cyan-400 font-bold">
                  Section 4 — Operational Detection Guidance
                </div>
                <ul className="list-disc list-inside space-y-1 pl-1">
                  {currentSession.proposedPlan.section4DetectionGuidance.map((item, i) => (
                    <li key={i} className="text-slate-200">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Section 5 */}
              <div className="p-4 rounded-xl bg-[#F8F7FF] border border-[#E4DEFF] space-y-1.5">
                <div className="text-[11px] font-mono uppercase tracking-wider text-cyan-400 font-bold">
                  Section 5 — Validation & Benchmark Plan
                </div>
                <div className="text-slate-200">
                  {currentSession.proposedPlan.section5ValidationPlan}
                </div>
              </div>

              {/* Section 6 */}
              <div className="p-4 rounded-xl bg-[#F8F7FF] border border-[#E4DEFF] space-y-1.5">
                <div className="text-[11px] font-mono uppercase tracking-wider text-cyan-400 font-bold">
                  Section 6 — Known Limitations & Edge Cases
                </div>
                <div className="text-slate-300">
                  {currentSession.proposedPlan.section6Limitations}
                </div>
              </div>

              {/* Section 7 */}
              <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/30 space-y-2">
                <div className="text-[11px] font-mono uppercase tracking-wider text-cyan-300 font-bold flex items-center justify-between">
                  <span>Section 7 — Proposed Detector Integration Directive</span>
                  <span className="text-[10px] text-cyan-400 font-normal">Active Prompt Injection</span>
                </div>
                <div className="p-3 rounded-lg bg-black/50 border border-cyan-500/20 font-mono text-[11px] text-cyan-100 whitespace-pre-wrap">
                  {currentSession.proposedPlan.section7ProposedIntegration}
                </div>
              </div>

              {/* Section 8 */}
              <div className="p-4 rounded-xl bg-[#F8F7FF] border border-[#E4DEFF] space-y-1.5">
                <div className="text-[11px] font-mono uppercase tracking-wider text-cyan-400 font-bold">
                  Section 8 — Target Version Number & Rollout Strategy
                </div>
                <div className="font-mono text-cyan-300 text-sm font-bold">
                  Release Version: {currentSession.proposedPlan.section8Version} (Immediate Detector Hot-Reload)
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-4 border-t border-[#E4DEFF] bg-[#060B18] flex items-center justify-between shrink-0">
              <button
                type="button"
                onClick={() => setRejectionModalOpen(true)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500/20 transition-colors"
              >
                Reject / Request Revisions
              </button>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setPlanModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  Close Preview
                </button>
                <button
                  type="button"
                  onClick={handleApprovePlan}
                  className="px-6 py-2.5 rounded-xl text-xs font-heading font-extrabold bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] uppercase tracking-wider flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>Approve & Activate Release</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: REJECT FEEDBACK MODAL */}
      {rejectionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#F8F7FF] bg-[#FFFFFF]/85 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-white border border-rose-500/30 rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-heading font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-400" />
              <span>Request Plan Revisions</span>
            </h3>
            <p className="text-xs text-slate-400">
              Provide feedback for the AI forensic specialist to reopen calibration.
            </p>

            <form onSubmit={handleRejectPlan} className="space-y-4">
              <textarea
                required
                rows={4}
                value={rejectionNotes}
                onChange={(e) => setRejectionNotes(e.target.value)}
                placeholder="Explain required adjustments: e.g. adjust lighting sensitivity, re-calibrate false positive tolerance for low-light images..."
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-rose-500"
              />

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectionModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-rose-500 hover:bg-rose-400 text-white font-heading"
                >
                  Reopen Calibration Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

