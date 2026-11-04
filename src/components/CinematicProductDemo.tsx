import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Play,
  Pause,
  SkipForward,
  Volume2,
  VolumeX,
  ArrowRight,
  ShieldCheck,
  Cpu,
  Layers,
  Activity,
  Scan,
  Terminal,
  Zap,
  CheckCircle2,
  Sliders,
  Sparkles,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { KryptxSymbol } from './KryptxLogo';
import { FaceAiReconstruction } from './FaceAiReconstruction';

export interface DemoScene {
  id: number;
  title: string;
  subtitle: string;
  duration: number; // in seconds
  startSec: number;
  endSec: number;
}

export const DEMO_SCENES: DemoScene[] = [
  { id: 1, title: 'User Input', subtitle: 'Media Input Received', duration: 6, startSec: 0, endSec: 6 },
  { id: 2, title: 'AI Orchestration', subtitle: 'Agentic Model Routing', duration: 6, startSec: 6, endSec: 12 },
  { id: 3, title: 'AI Model Investigation', subtitle: 'Multimodel Forensic Execution', duration: 10, startSec: 12, endSec: 22 },
  { id: 4, title: 'Holographic Image Reconstruction', subtitle: 'Visual Evidence Reconstruction', duration: 10, startSec: 22, endSec: 32 },
  { id: 5, title: 'Evidence Fusion', subtitle: 'Cross-Modal Evidence Synthesis', duration: 8, startSec: 32, endSec: 40 },
  { id: 6, title: 'Final Detection Result', subtitle: 'Calibrated Forensic Result', duration: 7, startSec: 40, endSec: 47 },
  { id: 7, title: 'Automatic Closing', subtitle: 'Returning to Homepage', duration: 3, startSec: 47, endSec: 50 },
];

export const TOTAL_DEMO_SECONDS = 50;

interface CinematicProductDemoProps {
  isOpen: boolean;
  onClose: () => void;
  onLaunchLiveDemo?: () => void;
}

export const CinematicProductDemo: React.FC<CinematicProductDemoProps> = ({
  isOpen,
  onClose,
  onLaunchLiveDemo,
}) => {
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Audio synthesizer for subtle sci-fi clicks and sweeps (muted by default)
  const playSound = (freq = 440, type: OscillatorType = 'sine', duration = 0.08) => {
    if (isMuted || typeof window === 'undefined') return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.03, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {}
  };

  // Reset timer on open
  useEffect(() => {
    if (isOpen) {
      setCurrentTime(0);
      setIsPlaying(true);
    }
  }, [isOpen]);

  // Main 50-second continuous animation clock
  useEffect(() => {
    if (!isOpen || !isPlaying) return;

    const interval = 50; // 20 updates per second for smooth telemetry
    const timer = setInterval(() => {
      setCurrentTime((prev) => {
        const next = prev + interval / 1000;
        if (next >= TOTAL_DEMO_SECONDS) {
          clearInterval(timer);
          setTimeout(() => {
            onClose();
          }, 200);
          return TOTAL_DEMO_SECONDS;
        }
        return next;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [isOpen, isPlaying, onClose]);

  // Handle keyboard shortcuts (Escape to close, Space to pause)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === ' ') {
        e.preventDefault();
        setIsPlaying((p) => !p);
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Active scene calculation
  const activeScene =
    DEMO_SCENES.find((s) => currentTime >= s.startSec && currentTime < s.endSec) ||
    DEMO_SCENES[DEMO_SCENES.length - 1];

  // Skip functionality: advances to beginning of next stage
  const handleSkipNext = () => {
    playSound(700);
    const nextIdx = DEMO_SCENES.findIndex((s) => s.id === activeScene.id) + 1;
    if (nextIdx < DEMO_SCENES.length) {
      setCurrentTime(DEMO_SCENES[nextIdx].startSec);
    } else {
      onClose();
    }
  };

  const formatTimer = (sec: number) => {
    const s = Math.floor(sec);
    const ms = Math.floor((sec % 1) * 10);
    return `00:${s.toString().padStart(2, '0')}.${ms}`;
  };

  // Progressive typing calculation for Stage 1
  const fullPromptText = "Analyze this image and determine whether it is authentic or AI-generated.";
  const promptProgress = Math.min(fullPromptText.length, Math.floor((currentTime / 4.5) * fullPromptText.length));
  const displayedPrompt = fullPromptText.slice(0, promptProgress);

  return (
    <div className="fixed inset-0 w-screen h-[100dvh] z-[99999] overflow-hidden bg-[#050614] text-white select-none flex flex-col justify-between font-sans">
      {/* Background Cybernetic Grid & Ambient Holographic Blooms */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(139, 50, 255, 0.15) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(139, 50, 255, 0.15) 1px, transparent 1px)
            `,
            backgroundSize: '48px 48px',
          }}
        />
        <div className="absolute top-1/4 left-1/3 w-[600px] h-[600px] bg-[#8B32FF]/12 blur-[150px] rounded-full" />
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-[#1677FF]/12 blur-[150px] rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#00D9FF]/6 blur-[180px] rounded-full" />
      </div>

      {/* =========================================================================
          TOP MINIMAL CONTROL BAR (NO WEBPAGE HEADER, NO SCROLLING, PURE HUD)
          ========================================================================= */}
      <header className="relative z-50 flex items-center justify-between px-4 sm:px-8 py-3 bg-[#080A21]/90 border-b border-[#8B32FF]/20 backdrop-blur-xl shrink-0">
        {/* Left: Monogram + Scene Badge */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-2">
            <KryptxSymbol className="w-7 h-7" />
            <span className="font-heading font-black tracking-wider text-sm sm:text-base bg-gradient-to-r from-white via-[#E0E7FF] to-[#8B32FF] bg-clip-text text-transparent">
              KRYPTX
            </span>
          </div>

          <div className="h-4 w-px bg-[#8B32FF]/30 hidden sm:block" />

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-[#8B32FF]/20 text-[#00D9FF] border border-[#8B32FF]/40">
              STAGE {activeScene.id} / 7
            </span>
            <span className="text-xs font-semibold text-slate-300 hidden md:inline truncate max-w-xs">
              {activeScene.title}
            </span>
          </div>
        </div>

        {/* Center: Live 50s Timeline & Duration Bar */}
        <div className="flex-1 max-w-md mx-4 sm:mx-8 hidden sm:flex flex-col gap-1">
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span className="text-[#00D9FF] font-bold">{formatTimer(currentTime)}</span>
            <span className="text-slate-500">50.0s EXPERIENTIAL DEMO</span>
            <span>00:50.0</span>
          </div>
          <div className="w-full h-1.5 bg-slate-800/80 rounded-full overflow-hidden border border-slate-700/50">
            <div
              className="h-full bg-gradient-to-r from-[#5515D8] via-[#00D9FF] to-[#8B32FF] rounded-full transition-all duration-75"
              style={{ width: `${(currentTime / TOTAL_DEMO_SECONDS) * 100}%` }}
            />
          </div>
        </div>

        {/* Right: Minimal HUD Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Audio Synthesizer Toggle */}
          <button
            onClick={() => {
              setIsMuted((m) => !m);
              playSound(660);
            }}
            className="p-1.5 sm:p-2 rounded-xl bg-slate-900/80 hover:bg-[#8B32FF]/20 border border-slate-700 hover:border-[#8B32FF]/50 text-slate-300 hover:text-white transition-all cursor-pointer"
            title={isMuted ? 'Unmute Audio Cues' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-slate-500" /> : <Volume2 className="w-4 h-4 text-[#00D9FF]" />}
          </button>

          {/* Play / Pause Toggle */}
          <button
            onClick={() => {
              setIsPlaying((p) => !p);
              playSound(440);
            }}
            className="p-1.5 sm:p-2 rounded-xl bg-slate-900/80 hover:bg-[#8B32FF]/20 border border-slate-700 hover:border-[#8B32FF]/50 text-slate-300 hover:text-white transition-all cursor-pointer"
            title={isPlaying ? 'Pause Demo (Space)' : 'Resume Demo (Space)'}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current text-[#00D9FF]" />}
          </button>

          {/* Skip Stage (Advances to Next Stage) */}
          <button
            onClick={handleSkipNext}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-[#8B32FF]/20 border border-slate-700 hover:border-[#8B32FF]/50 text-xs font-semibold text-slate-300 hover:text-white transition-all cursor-pointer"
            title="Advance to Next Stage"
          >
            <span className="hidden sm:inline">Next</span>
            <SkipForward className="w-3.5 h-3.5 text-[#00D9FF]" />
          </button>

          {/* Close & Restore Homepage */}
          <button
            onClick={() => {
              playSound(330);
              onClose();
            }}
            className="p-1.5 sm:p-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/70 border border-rose-800/40 hover:border-rose-500 text-rose-300 hover:text-white transition-all cursor-pointer"
            title="Exit Demo"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* =========================================================================
          MAIN CINEMATIC VIEWPORT (100% RESPONSIVE, ZERO SCROLL, 7 STAGES)
          ========================================================================= */}
      <main className="relative flex-1 flex items-center justify-center p-4 sm:p-8 z-10 overflow-hidden w-full max-w-7xl mx-auto">
        
        {/* =====================================================================
            STAGE 1: USER INPUT (0s - 6s)
            ===================================================================== */}
        {activeScene.id === 1 && (
          <div className="w-full max-w-4xl flex flex-col items-center justify-center space-y-6 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0E1030]/90 border border-[#8B32FF]/50 shadow-lg shadow-[#8B32FF]/10">
              <Terminal className="w-4 h-4 text-[#00D9FF]" />
              <span className="text-xs font-mono font-bold tracking-widest uppercase text-[#00D9FF]">
                STAGE 01 — USER INGESTION CONSOLE
              </span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-heading font-extrabold text-center tracking-tight">
              Media Input <span className="bg-gradient-to-r from-[#00D9FF] via-white to-[#8B32FF] bg-clip-text text-transparent">Received & Verified</span>
            </h2>

            {/* Operator Terminal Card */}
            <div className="w-full bg-[#0A0D28]/95 border border-[#8B32FF]/30 rounded-2xl p-5 sm:p-7 shadow-2xl backdrop-blur-2xl grid grid-cols-1 md:grid-cols-12 gap-6 items-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[#00D9FF]" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[#8B32FF]" />

              {/* Left Column: Typing Prompt & File Metadata */}
              <div className="md:col-span-7 space-y-4">
                <div className="space-y-1.5">
                  <div className="text-[11px] font-mono text-slate-400 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#00D9FF] animate-ping" />
                    <span>OPERATOR PROMPT:</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#06081B] border border-slate-800 text-xs sm:text-sm font-mono text-[#00D9FF] leading-relaxed shadow-inner min-h-[56px]">
                    "{displayedPrompt}"
                    {promptProgress < fullPromptText.length && (
                      <span className="inline-block w-2 h-4 bg-[#8B32FF] ml-1 animate-pulse" />
                    )}
                  </div>
                </div>

                {/* File Telemetry Badges */}
                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                  <div className="p-2.5 rounded-lg bg-[#0E1035]/80 border border-slate-800 text-slate-300">
                    <div className="text-slate-500 text-[10px]">PAYLOAD TARGET</div>
                    <div className="font-bold text-white truncate">investigation_target.jpg</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#0E1035]/80 border border-slate-800 text-slate-300">
                    <div className="text-slate-500 text-[10px]">RESOLUTION</div>
                    <div className="font-bold text-[#00D9FF]">1024 × 1024 px</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#0E1035]/80 border border-slate-800 text-slate-300 col-span-2">
                    <div className="text-slate-500 text-[10px]">CRYPTOGRAPHIC VERIFICATION</div>
                    <div className="font-bold text-emerald-400 truncate">SHA-256: 8f4e2c91b7d5a063... ✓ Verified</div>
                  </div>
                </div>
              </div>

              {/* Right Column: Normal Realistic Image Preview with Subtle Scanning Border */}
              <div className="md:col-span-5 flex flex-col items-center">
                <div className="relative w-44 sm:w-52 aspect-square rounded-2xl overflow-hidden border-2 border-cyan-400/70 shadow-[0_0_35px_rgba(0,217,255,0.3)] bg-black">
                  {/* Clean, completely normal natural human photograph */}
                  <img
                    src="/hero-face-natural.jpg"
                    alt="Target Payload"
                    className="w-full h-full object-cover object-center"
                  />
                  {/* Subtle scanning laser */}
                  <div
                    className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-[#00D9FF] to-transparent shadow-[0_0_15px_#00D9FF]"
                    style={{
                      top: `${((currentTime % 2) / 2) * 100}%`,
                    }}
                  />
                  {/* Corner scanning brackets */}
                  <div className="absolute inset-2 border border-cyan-400/40 rounded-xl pointer-events-none">
                    <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[#00D9FF]" />
                    <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-[#00D9FF]" />
                    <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-[#00D9FF]" />
                    <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-[#00D9FF]" />
                  </div>
                  <div className="absolute bottom-2 inset-x-2 py-1 bg-[#06081B]/90 rounded-md text-[9px] font-mono text-center text-[#00D9FF] border border-[#00D9FF]/40">
                    RAW IMAGE INGESTION VERIFIED
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-[#00D9FF] animate-pulse">
              <Zap className="w-4 h-4" />
              <span>ROUTING PAYLOAD INTO KRYPTX FORENSIC ORCHESTRATOR...</span>
            </div>
          </div>
        )}

        {/* =====================================================================
            STAGE 2: AI ORCHESTRATION (6s - 12s)
            ===================================================================== */}
        {activeScene.id === 2 && (
          <div className="w-full max-w-5xl flex flex-col items-center justify-center space-y-5 animate-fade-in">
            <div className="text-center space-y-1">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#8B32FF]/20 border border-[#8B32FF]/50 text-xs font-mono font-bold text-[#00D9FF]">
                <Cpu className="w-3.5 h-3.5 animate-spin" />
                <span>STAGE 02 — AGENTIC MODEL ROUTING</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-heading font-extrabold tracking-tight">
                Central Forensic <span className="bg-gradient-to-r from-[#00D9FF] to-[#8B32FF] bg-clip-text text-transparent">Orchestrator</span>
              </h2>
              <p className="text-xs text-slate-400">
                Data pipeline delegates concurrent forensic tasks to specialized analysis branches.
              </p>
            </div>

            {/* Architecture Node Sequence */}
            <div className="w-full bg-[#070921]/95 border border-[#8B32FF]/40 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4 relative overflow-hidden">
              {/* Connecting glowing conduits */}
              <div className="hidden md:block absolute top-1/2 left-12 right-12 h-1 bg-gradient-to-r from-[#00D9FF] via-[#8B32FF] to-[#1677FF] -translate-y-1/2 opacity-30 z-0" />

              {/* Node 1: Image Input */}
              <div className="relative z-10 flex flex-col items-center p-4 rounded-2xl bg-[#0E1035] border border-[#00D9FF]/60 shadow-lg text-center w-full md:w-44">
                <div className="w-10 h-10 rounded-xl bg-[#00D9FF]/10 text-[#00D9FF] flex items-center justify-center font-bold mb-2">
                  01
                </div>
                <div className="text-xs font-bold text-white">Image Input</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Payload Stream Verified</div>
              </div>

              {/* Node 2: Preprocessing */}
              <div className="relative z-10 flex flex-col items-center p-4 rounded-2xl bg-[#0E1035] border border-[#8B32FF]/60 shadow-lg text-center w-full md:w-44">
                <div className="w-10 h-10 rounded-xl bg-[#8B32FF]/10 text-[#8B32FF] flex items-center justify-center font-bold mb-2">
                  02
                </div>
                <div className="text-xs font-bold text-white">Preprocessing</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Normalisation & Slicing</div>
              </div>

              {/* Node 3: AI Forensic Orchestrator (Centerpiece) */}
              <div className="relative z-10 flex flex-col items-center p-5 rounded-2xl bg-gradient-to-b from-[#141242] to-[#0A0D28] border-2 border-[#00D9FF] shadow-[0_0_35px_rgba(0,217,255,0.35)] text-center w-full md:w-52 scale-105">
                <div className="w-12 h-12 rounded-2xl bg-[#00D9FF]/20 text-[#00D9FF] flex items-center justify-center font-bold mb-2 animate-pulse">
                  <Cpu className="w-6 h-6 animate-spin" style={{ animationDuration: '6s' }} />
                </div>
                <div className="text-xs font-bold text-white">KRYPTX Orchestrator</div>
                <div className="text-[10px] font-mono text-[#00D9FF] mt-0.5">Core Routing Engine</div>
              </div>

              {/* Node 4: Model Routing */}
              <div className="relative z-10 flex flex-col items-center p-4 rounded-2xl bg-[#0E1035] border border-[#1677FF]/60 shadow-lg text-center w-full md:w-44">
                <div className="w-10 h-10 rounded-xl bg-[#1677FF]/10 text-[#1677FF] flex items-center justify-center font-bold mb-2">
                  04
                </div>
                <div className="text-xs font-bold text-white">Model Routing</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Multi-Branch Dispatch</div>
              </div>
            </div>

            <div className="text-[11px] font-mono text-slate-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>ROUTING TO 5 SPECIALIZED FORENSIC ML INVESTIGATION BRANCHES</span>
            </div>
          </div>
        )}

        {/* =====================================================================
            STAGE 3: AI MODEL INVESTIGATION (12s - 22s)
            THE MOST IMPORTANT VISUAL STAGE: 5 MODEL BRANCHES AROUND CENTRAL IMAGE
            ===================================================================== */}
        {activeScene.id === 3 && (
          <div className="w-full max-w-5xl flex flex-col items-center justify-center space-y-4 animate-fade-in">
            <div className="text-center space-y-1">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#00D9FF]/10 border border-[#00D9FF]/40 text-xs font-mono font-bold text-[#00D9FF]">
                <Activity className="w-3.5 h-3.5" />
                <span>STAGE 03 — CONCURRENT MODEL INVESTIGATION</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-heading font-extrabold tracking-tight">
                Multimodel Forensic <span className="bg-gradient-to-r from-[#00D9FF] to-[#8B32FF] bg-clip-text text-transparent">Analysis</span>
              </h2>
              <div className="text-[10px] font-mono text-amber-300">
                ⚡ CONCEPTUAL DEMONSTRATION WORKFLOW — ILLUSTRATIVE MODEL PIPELINE
              </div>
            </div>

            {/* Central Image with 5 Surrounding Connected Branches */}
            <div className="w-full bg-[#070921]/95 border border-[#8B32FF]/40 rounded-3xl p-4 sm:p-6 shadow-2xl grid grid-cols-1 md:grid-cols-12 gap-4 items-center relative overflow-hidden">
              {/* Left Column: 2 Branches */}
              <div className="md:col-span-3 space-y-3">
                {/* Branch 1 */}
                <div className={`p-3 rounded-xl border transition-all ${currentTime >= 13 ? 'bg-[#0E1035] border-[#00D9FF]/60 shadow-md' : 'bg-[#06081A] border-slate-800 opacity-60'}`}>
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="text-[#00D9FF]">BRANCH 01</span>
                    <span className="text-emerald-400">{currentTime >= 15 ? 'Completed' : 'Analyzing...'}</span>
                  </div>
                  <div className="text-xs font-bold text-white mt-1">AI Image Classifier</div>
                  <div className="text-[9px] text-slate-400 mt-0.5">Diffusion latent invariance</div>
                </div>

                {/* Branch 2 */}
                <div className={`p-3 rounded-xl border transition-all ${currentTime >= 15 ? 'bg-[#0E1035] border-[#8B32FF]/60 shadow-md' : 'bg-[#06081A] border-slate-800 opacity-60'}`}>
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="text-[#8B32FF]">BRANCH 02</span>
                    <span className="text-emerald-400">{currentTime >= 17 ? 'Completed' : 'Analyzing...'}</span>
                  </div>
                  <div className="text-xs font-bold text-white mt-1">Manipulation Detector</div>
                  <div className="text-[9px] text-slate-400 mt-0.5">ELA differencing & inpainting</div>
                </div>
              </div>

              {/* Center Column: Uploaded Image Ingested & Being Processed */}
              <div className="md:col-span-6 flex flex-col items-center justify-center p-2">
                <div className="relative w-44 sm:w-52 aspect-[3/4] rounded-2xl overflow-hidden border-2 border-[#00D9FF] shadow-[0_0_40px_rgba(0,217,255,0.4)] bg-black">
                  <img
                    src="/hero-face-natural.jpg"
                    alt="Target Under Investigation"
                    className="w-full h-full object-cover object-center"
                  />
                  {/* Real-time laser sweep */}
                  <div
                    className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#00D9FF] to-transparent shadow-[0_0_20px_#00D9FF]"
                    style={{ top: `${((currentTime - 12) / 10) * 100}%` }}
                  />
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded text-[8px] font-mono text-cyan-300 bg-black/80 border border-cyan-400/40">
                    5 MODELS CONCURRENT
                  </div>
                </div>
              </div>

              {/* Right Column: 3 Branches */}
              <div className="md:col-span-3 space-y-2.5">
                {/* Branch 3 */}
                <div className={`p-2.5 rounded-xl border transition-all ${currentTime >= 17 ? 'bg-[#0E1035] border-[#00D9FF]/60 shadow-md' : 'bg-[#06081A] border-slate-800 opacity-60'}`}>
                  <div className="flex items-center justify-between text-[9px] font-mono">
                    <span className="text-[#00D9FF]">BRANCH 03</span>
                    <span className="text-emerald-400">{currentTime >= 19 ? 'Completed' : 'Analyzing...'}</span>
                  </div>
                  <div className="text-xs font-bold text-white mt-0.5">Face / Deepfake</div>
                  <div className="text-[9px] text-slate-400">Biometric mesh topology</div>
                </div>

                {/* Branch 4 */}
                <div className={`p-2.5 rounded-xl border transition-all ${currentTime >= 18 ? 'bg-[#0E1035] border-[#8B32FF]/60 shadow-md' : 'bg-[#06081A] border-slate-800 opacity-60'}`}>
                  <div className="flex items-center justify-between text-[9px] font-mono">
                    <span className="text-[#8B32FF]">BRANCH 04</span>
                    <span className="text-emerald-400">{currentTime >= 20 ? 'Completed' : 'Analyzing...'}</span>
                  </div>
                  <div className="text-xs font-bold text-white mt-0.5">Metadata & C2PA</div>
                  <div className="text-[9px] text-slate-400">EXIF hardware signatures</div>
                </div>

                {/* Branch 5 */}
                <div className={`p-2.5 rounded-xl border transition-all ${currentTime >= 19 ? 'bg-[#0E1035] border-[#1677FF]/60 shadow-md' : 'bg-[#06081A] border-slate-800 opacity-60'}`}>
                  <div className="flex items-center justify-between text-[9px] font-mono">
                    <span className="text-[#1677FF]">BRANCH 05</span>
                    <span className="text-emerald-400">{currentTime >= 21 ? 'Completed' : 'Analyzing...'}</span>
                  </div>
                  <div className="text-xs font-bold text-white mt-0.5">Signal Forensics</div>
                  <div className="text-[9px] text-slate-400">Fourier spectrum & noise floor</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =====================================================================
            STAGE 4: HOLOGRAPHIC IMAGE RECONSTRUCTION (22s - 32s)
            ===================================================================== */}
        {activeScene.id === 4 && (
          <div className="w-full max-w-5xl flex flex-col items-center justify-center space-y-4 animate-fade-in">
            <div className="text-center space-y-1">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#8B32FF]/20 border border-[#8B32FF]/50 text-xs font-mono font-bold text-[#00D9FF]">
                <Scan className="w-3.5 h-3.5 text-[#00D9FF] animate-pulse" />
                <span>STAGE 04 — VISUAL EVIDENCE RECONSTRUCTION</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-heading font-extrabold tracking-tight">
                3D Holographic <span className="bg-gradient-to-r from-[#00D9FF] via-white to-[#8B32FF] bg-clip-text text-transparent">Wireframe Overlay</span>
              </h2>
              <div className="text-[10px] font-mono text-purple-300">
                SAMPLE FORENSIC LOCALISATION — ILLUSTRATIVE EVIDENCE
              </div>
            </div>

            {/* 3D Holographic Stage with progressive wireframe construction */}
            <div className="relative w-full min-h-[380px] sm:min-h-[420px] bg-[#070921]/95 border border-[#8B32FF]/40 rounded-3xl p-4 sm:p-6 shadow-2xl flex items-center justify-center overflow-hidden">
              <div className="relative w-64 sm:w-72 aspect-[3/4] flex items-center justify-center">
                <FaceAiReconstruction mode="demo" />

                {/* Callout 1: Generative Latent Artifacts */}
                <div className="absolute -top-3 -right-16 sm:-right-24 z-30 p-2.5 rounded-xl bg-[#090C28]/95 border border-rose-500/70 shadow-xl max-w-[190px] text-left animate-pulse">
                  <div className="flex items-center gap-1.5 text-[9px] font-mono text-rose-400 font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                    <span>DIFFUSION LATENT ANOMALY</span>
                  </div>
                  <div className="text-[10px] font-bold text-white mt-0.5">Synthetic Structure</div>
                  <div className="text-[8px] text-slate-300 mt-0.5">
                    Latent frequency distributions match generative diffusion models.
                  </div>
                </div>

                {/* Callout 2: Biometric Topology */}
                <div className="absolute -bottom-3 -left-16 sm:-left-24 z-30 p-2.5 rounded-xl bg-[#090C28]/95 border border-cyan-400/70 shadow-xl max-w-[190px] text-left">
                  <div className="flex items-center gap-1.5 text-[9px] font-mono text-cyan-400 font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00D9FF]" />
                    <span>BIOMETRIC TOPOLOGY</span>
                  </div>
                  <div className="text-[10px] font-bold text-white mt-0.5">Facial Geometry Mesh</div>
                  <div className="text-[8px] text-slate-300 mt-0.5">
                    3D landmark facet alignment confirms whole-image synthetic synthesis.
                  </div>
                </div>
              </div>

              {/* Bottom Holographic HUD Bar */}
              <div className="absolute bottom-3 inset-x-4 flex items-center justify-between px-4 py-2 rounded-xl bg-[#04061A]/90 border border-slate-800 text-[10px] font-mono text-slate-400">
                <span>FACIAL TOPOLOGY: 3,420 VERTICES</span>
                <span className="text-[#00D9FF]">WIRE-CONSTRUCT: {Math.min(100, Math.round(((currentTime - 22) / 8) * 100))}%</span>
                <span className="text-purple-300">CALIBRATION: SNELL OPTICS</span>
              </div>
            </div>
          </div>
        )}

        {/* =====================================================================
            STAGE 5: EVIDENCE FUSION (32s - 40s)
            ===================================================================== */}
        {activeScene.id === 5 && (
          <div className="w-full max-w-4xl flex flex-col items-center justify-center space-y-4 animate-fade-in">
            <div className="text-center space-y-1">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#1677FF]/20 border border-[#1677FF]/50 text-xs font-mono font-bold text-[#00D9FF]">
                <Sliders className="w-3.5 h-3.5 text-[#00D9FF]" />
                <span>STAGE 05 — EVIDENCE FUSION & SYNTHESIS</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-heading font-extrabold tracking-tight">
                Cross-Modal <span className="bg-gradient-to-r from-[#00D9FF] to-[#8B32FF] bg-clip-text text-transparent">Evidence Convergence</span>
              </h2>
              <p className="text-xs text-slate-400">
                Funneling completed model findings into a calibrated Bayesian decision engine.
              </p>
            </div>

            {/* Prominent Converged Verdict Pill */}
            <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-gradient-to-r from-[#141242]/95 via-[#0B0D2E]/95 to-[#100C38]/95 border border-cyan-400/50 shadow-[0_0_35px_rgba(0,217,255,0.2)]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-400/50 flex items-center justify-center text-cyan-300">
                  <Activity className="w-5 h-5 animate-pulse" />
                </div>
                <div className="text-left">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-cyan-300 font-bold">
                    CONVERGED VERDICT: LIKELY AI-GENERATED
                  </div>
                  <div className="text-xs text-slate-300">
                    High-order multimodal diffusion pattern convergence
                  </div>
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Classification:</span>
                <span className="text-2xl sm:text-3xl font-heading font-black bg-gradient-to-r from-[#00D9FF] via-white to-[#8B32FF] bg-clip-text text-transparent">
                  99.4% AI-GENERATED
                </span>
              </div>
            </div>

            {/* Calibrated Forensic Evidence Channels */}
            <div className="w-full bg-[#0A0D28]/95 border border-[#8B32FF]/40 rounded-3xl p-5 sm:p-7 shadow-2xl backdrop-blur-2xl space-y-3.5">
              {[
                {
                  label: 'AI Generation Evidence',
                  displayVal: '99.4%',
                  barPct: 99.4,
                  activeColor: 'from-[#5515D8] via-[#8B32FF] to-[#00D9FF]',
                  status: 'CRITICAL DETECTION',
                  note: 'Synthetic diffusion generation artifacts detected across latent frequency domain',
                },
                {
                  label: 'Manipulation & Inpainting',
                  displayVal: 'Not Detected',
                  barPct: 0,
                  activeColor: 'from-slate-700 to-slate-600',
                  status: 'WHOLE-IMAGE GENERATION',
                  note: 'Whole-image generative synthesis; no secondary local inpainting or splice seam',
                },
                {
                  label: 'Deepfake Identity Swap',
                  displayVal: 'Not Detected',
                  barPct: 0,
                  activeColor: 'from-slate-700 to-slate-600',
                  status: 'CLEAN BIOMETRICS',
                  note: 'Synthetic face generation without donor identity replacement or facial reenactment',
                },
                {
                  label: 'Metadata & Provenance',
                  displayVal: 'Absent EXIF (Synthetic Export)',
                  barPct: 40,
                  activeColor: 'from-purple-900 to-purple-600',
                  status: 'NON-DISQUALIFYING',
                  note: 'Camera sensor serial and lens profile missing; matches synthetic rendering pipeline',
                },
                {
                  label: 'Forensic Signal Analysis',
                  displayVal: 'Positive (Corroborating)',
                  barPct: 94,
                  activeColor: 'from-[#5515D8] to-[#00D9FF]',
                  status: 'CORROBORATING',
                  note: 'Optical noise floor absence and high-frequency spectral roll-off corroborate AI generation',
                },
              ].map((ev, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs sm:text-sm font-semibold">
                    <span className="text-white">{ev.label}</span>
                    <span className={`font-mono font-bold ${ev.barPct > 0 ? 'text-[#00D9FF]' : 'text-slate-400'}`}>
                      {ev.displayVal}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-[#050616] rounded-full overflow-hidden border border-slate-800">
                    <div
                      className={`h-full bg-gradient-to-r ${ev.activeColor} rounded-full transition-all duration-700`}
                      style={{
                        width: `${ev.barPct > 0 ? Math.min(ev.barPct, ev.barPct * ((currentTime - 32) / 6)) : 0}%`,
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span>{ev.note}</span>
                    <span className="text-slate-500 uppercase">{ev.status}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-[11px] font-mono text-[#00D9FF] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#00D9FF] animate-pulse" />
              <span>CONVERGING EVIDENCE STREAMS INTO FINAL VERDICT CARD...</span>
            </div>
          </div>
        )}

        {/* =====================================================================
            STAGE 6: FINAL DETECTION RESULT (40s - 47s)
            ===================================================================== */}
        {activeScene.id === 6 && (
          <div className="w-full max-w-2xl flex flex-col items-center justify-center space-y-4 animate-fade-in">
            {/* Premium Compact Forensic Result Card */}
            <div className="w-full bg-[#0E1030]/95 border-2 border-cyan-400/60 rounded-3xl p-6 sm:p-8 shadow-[0_0_80px_rgba(0,217,255,0.25),0_0_40px_rgba(139,50,255,0.35)] backdrop-blur-2xl space-y-5 text-center relative overflow-hidden">
              
              {/* Corner tech accents */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[#00D9FF]" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-[#8B32FF]" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-[#8B32FF]" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[#00D9FF]" />

              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#00D9FF]" />
                  <span className="text-xs font-mono font-bold tracking-widest uppercase text-[#00D9FF]">
                    KRYPTX FORENSIC REPORT
                  </span>
                </div>
                <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/40 font-bold uppercase tracking-wider">
                  VERIFIED DETECTION VERDICT
                </span>
              </div>

              {/* Classification & Confidence Counter */}
              <div className="space-y-2">
                <div className="text-xs font-mono uppercase tracking-widest text-slate-400">Classification Verdict</div>
                <div className="text-2xl sm:text-3xl font-heading font-black tracking-tight text-white flex items-center justify-center gap-2">
                  <AlertTriangle className="w-6 h-6 text-rose-400" />
                  <span>AI-GENERATED IMAGE DETECTED</span>
                </div>
                <div className="text-5xl sm:text-6xl font-heading font-black bg-gradient-to-r from-rose-500 via-[#FF4B55] to-[#00D9FF] bg-clip-text text-transparent pt-1">
                  {Math.min(99.4, Number((((currentTime - 40) / 2.5) * 99.4).toFixed(1)))}%
                </div>
                <div className="text-xs font-mono text-cyan-300 font-bold tracking-wider">
                  Confidence: <span className="text-white">99.4%</span>
                </div>
              </div>

              {/* Horizontal confidence indicator bar */}
              <div className="w-full h-2.5 bg-[#050616] rounded-full overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-[#5515D8] via-rose-500 to-[#00D9FF] rounded-full transition-all duration-500 shadow-[0_0_15px_#00D9FF]"
                  style={{ width: `${Math.min(99.4, ((currentTime - 40) / 2.5) * 99.4)}%` }}
                />
              </div>

              {/* Supporting Findings List */}
              <div className="p-4 rounded-2xl bg-[#06081C]/90 border border-slate-800 text-left space-y-2 text-xs">
                <div className="text-[10px] font-mono uppercase text-slate-400 font-bold tracking-wider mb-2">
                  Key Supporting Forensic Evidence:
                </div>
                <div className="flex items-start gap-2 text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span><strong>AI-generation indicators detected:</strong> Synthetic latent diffusion artifacts identified across whole-image matrix.</span>
                </div>
                <div className="flex items-start gap-2 text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span><strong>Forensic signal analysis supports classification:</strong> Absence of camera sensor PRNU noise and high-frequency spectral attenuation.</span>
                </div>
                <div className="flex items-start gap-2 text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>No identity swap detected:</strong> Facial structure originates entirely from generative synthesis (no face swap or donor splicing).</span>
                </div>
                <div className="flex items-start gap-2 text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                  <span><strong>Metadata findings shown separately:</strong> Camera EXIF absent; metadata header consistent with generative rendering export.</span>
                </div>
              </div>

              {/* Disclaimer */}
              <div className="text-[10px] font-mono text-slate-400 italic">
                Illustrative demo result. Actual analysis depends on the uploaded media and validated detection models.
              </div>

              {/* CTA to try Live Engine */}
              {onLaunchLiveDemo && (
                <button
                  onClick={onLaunchLiveDemo}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#5515D8] via-[#8B32FF] to-[#00D9FF] hover:brightness-110 text-xs font-bold text-white shadow-lg shadow-[#8B32FF]/25 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.01]"
                >
                  <span>Launch Live Interactive Detector</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* =====================================================================
            STAGE 7: AUTOMATIC CLOSING (47s - 50s)
            Card shrinks smoothly into small floating badge, then fades out!
            ===================================================================== */}
        {activeScene.id === 7 && (
          <div className="flex flex-col items-center justify-center space-y-4 text-center transition-all duration-700">
            {/* Small Floating Compact Badge */}
            <div className="px-5 py-2.5 rounded-2xl bg-[#0E1030]/95 border-2 border-[#00D9FF] shadow-[0_0_40px_rgba(0,217,255,0.5)] flex items-center gap-3 animate-pulse">
              <KryptxSymbol className="w-5 h-5 text-[#00D9FF]" />
              <div className="text-xs font-mono font-bold tracking-wider text-white">
                KRYPTX <span className="text-[#8B32FF]">|</span> AI-Generated Detected <span className="text-[#8B32FF]">|</span> <span className="text-[#00D9FF]">99.4%</span>
              </div>
            </div>

            <div className="text-[11px] font-mono text-slate-400">
              Returning to homepage position...
            </div>
          </div>
        )}
      </main>

      {/* =========================================================================
          BOTTOM HUD STATUS FOOTER
          ========================================================================= */}
      <footer className="relative z-50 flex items-center justify-between px-4 sm:px-8 py-2.5 bg-[#080A21]/90 border-t border-[#8B32FF]/20 text-[11px] font-mono text-slate-400 shrink-0">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="text-slate-300 hidden sm:inline">KRYPTX AUTONOMOUS FORENSIC DEMO</span>
          <span className="text-slate-500 sm:hidden">KRYPTX DEMO</span>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-[#00D9FF]">{activeScene.subtitle}</span>
          <span className="hidden sm:inline text-slate-600">|</span>
          <span className="hidden sm:inline text-slate-500">Auto-closing at 50.0s</span>
        </div>
      </footer>
    </div>
  );
};

export default CinematicProductDemo;
