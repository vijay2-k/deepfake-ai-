import React, { useState } from 'react';
import { HolographicHero3D } from './HolographicHero3D';
import {
  ShieldCheck,
  Play,
  ArrowRight,
  Crosshair,
  Zap,
  Layers,
  FileCheck2,
  CheckCircle2,
  Activity,
  Cpu,
  Scan,
  X,
  Volume2,
  Eye,
} from 'lucide-react';

interface KryptxHeroProps {
  onTryDemo: () => void;
  onWatchVideo?: () => void;
}

export const KryptxHero: React.FC<KryptxHeroProps> = ({ onTryDemo }) => {
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [activePipelineStep, setActivePipelineStep] = useState(2); // 0: Preprocess, 1: Features, 2: Deep Model, 3: Forgery, 4: Verdict

  const pipelineStages = [
    { id: 0, label: 'Preprocess', icon: Scan, desc: 'EXIF & Normalization' },
    { id: 1, label: 'Feature Extraction', icon: Activity, desc: 'Frequency & ELA Differencing' },
    { id: 2, label: 'AI Analysis (Deep Model)', icon: Layers, desc: 'Multimodal Vision Reasoning' },
    { id: 3, label: 'Forgery Detection', icon: Cpu, desc: 'Diffusion Latent Markers' },
    { id: 4, label: 'Final Verdict', icon: CheckCircle2, desc: 'Explainable Forensic Docket' },
  ];

  return (
    <section id="hero" className="relative pt-6 pb-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Two-Column Composition Matching Reference Screenshot */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-6 items-center">
          
          {/* ================= LEFT COLUMN ================= */}
          <div className="lg:col-span-5 flex flex-col justify-center space-y-6 z-10">
            {/* Small Top Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 backdrop-blur-md shadow-[0_0_15px_rgba(0,229,255,0.15)] self-start">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-cyan-300">
                AI Media Forensics Platform
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[46px] font-heading font-extrabold text-white tracking-tight leading-[1.12]">
              Detect AI-Generated Media.{' '}
              <span className="block mt-1 bg-gradient-to-r from-[#00E5FF] via-[#38BDF8] to-[#8B5CF6] bg-clip-text text-transparent">
                Expose What's Not Real.
              </span>
            </h1>

            {/* Description */}
            <p className="text-sm sm:text-base text-slate-300/90 leading-relaxed max-w-xl font-normal">
              Advanced multimodal intelligence to detect AI-generated, manipulated and deepfake images, videos and voices through explainable digital forensic analysis.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-1">
              {/* Primary CTA Button: Try Live Demo */}
              <button
                onClick={onTryDemo}
                className="relative group px-7 py-3 rounded-full text-sm font-bold text-white overflow-hidden shadow-[0_0_30px_rgba(255,157,50,0.35)] hover:shadow-[0_0_40px_rgba(255,157,50,0.55)] transition-all duration-300 flex items-center gap-2"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#FF9D32] via-[#FF6B35] to-[#E63946] group-hover:scale-105 transition-transform duration-300" />
                <span className="relative z-10 flex items-center gap-2">
                  <span>Try Live Demo</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>

              {/* Secondary CTA Button: Watch 2-min Demo */}
              <button
                onClick={() => setVideoModalOpen(true)}
                className="px-6 py-3 rounded-full text-sm font-semibold text-slate-200 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 hover:border-slate-500 shadow-md backdrop-blur-md transition-all duration-200 flex items-center gap-2.5"
              >
                <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-white">
                  <Play className="w-3 h-3 fill-current ml-0.5" />
                </div>
                <span>Watch 2-min Demo</span>
              </button>
            </div>

            {/* 4 Compact Trust Indicators */}
            <div className="pt-4 border-t border-slate-800/80">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {/* Indicator 1 */}
                <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-900/40 border border-slate-800/60">
                  <div className="w-7 h-7 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0">
                    <Crosshair className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-[11px] font-medium text-slate-200 leading-tight">
                    Advanced Detection
                  </div>
                </div>

                {/* Indicator 2 */}
                <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-900/40 border border-slate-800/60">
                  <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
                    <Zap className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-[11px] font-medium text-slate-200 leading-tight">
                    Multimodal Intelligence
                  </div>
                </div>

                {/* Indicator 3 */}
                <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-900/40 border border-slate-800/60">
                  <div className="w-7 h-7 rounded-lg bg-violet-500/10 text-violet-400 flex items-center justify-center shrink-0">
                    <FileCheck2 className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-[11px] font-medium text-slate-200 leading-tight">
                    Forensic Evidence
                  </div>
                </div>

                {/* Indicator 4 */}
                <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-900/40 border border-slate-800/60">
                  <div className="w-7 h-7 rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center shrink-0">
                    <Layers className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-[11px] font-medium text-slate-200 leading-tight">
                    Explainable Results
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ================= RIGHT COLUMN: 3D HOLOGRAPHIC CONSTRUCTION & PIPELINE ================= */}
          <div className="lg:col-span-7 flex flex-col space-y-4 relative">
            
            {/* Top Bar: Pipeline Header & Stage Navigation */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-slate-950/80 border border-cyan-500/20 backdrop-blur-md">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded-lg bg-cyan-500/10 text-cyan-400">
                  <Layers className="w-4 h-4" />
                </div>
                <span className="text-xs font-mono font-bold tracking-wider text-white uppercase">
                  AI Analysis & Construction Pipeline
                </span>
              </div>

              {/* Status indicator */}
              <div className="flex items-center gap-2 text-[10px] font-mono text-cyan-400">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span>MULTIMODAL NEURAL SCAN</span>
              </div>
            </div>

            {/* Split Composition: Subject Face Scan on the Left connecting to 3D Construction Lab */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-stretch">
              
              {/* Subject Face Scan Box (Matches reference split face & Face Detected bracket) */}
              <div className="md:col-span-4 rounded-2xl border border-cyan-500/25 bg-[#030a17]/90 p-3 relative flex flex-col items-center justify-between overflow-hidden shadow-lg shadow-cyan-950/30">
                {/* Corner reticle brackets */}
                <div className="absolute top-2 left-2 w-3.5 h-3.5 border-t-2 border-l-2 border-cyan-400 pointer-events-none" />
                <div className="absolute top-2 right-2 w-3.5 h-3.5 border-t-2 border-r-2 border-cyan-400 pointer-events-none" />
                <div className="absolute bottom-2 left-2 w-3.5 h-3.5 border-b-2 border-l-2 border-cyan-400 pointer-events-none" />
                <div className="absolute bottom-2 right-2 w-3.5 h-3.5 border-b-2 border-r-2 border-cyan-400 pointer-events-none" />

                {/* Subject Image with Split Wireframe Scanning Overlay */}
                <div className="relative w-full aspect-[4/5] rounded-xl overflow-hidden border border-cyan-500/20 bg-slate-900 group">
                  <img
                    src="/hero-face-scan.jpg"
                    alt="Biometric Facial Reconstruction"
                    className="w-full h-full object-cover object-center filter contrast-105"
                    onError={(e) => {
                      // Fallback SVG if image not found
                      e.currentTarget.src = '/demo-face.jpg';
                    }}
                  />

                  {/* Cyan Scanning Reticle / Grid Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent pointer-events-none" />
                  
                  {/* Vertical Scan Laser Bar */}
                  <div className="absolute inset-x-0 h-0.5 bg-cyan-400 shadow-[0_0_10px_#00E5FF] animate-scan pointer-events-none" />

                  {/* Neural Landmark Points Overlay */}
                  <div className="absolute inset-0 pointer-events-none">
                    <span className="absolute top-1/3 left-1/4 w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#00E5FF]" />
                    <span className="absolute top-1/3 right-1/4 w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#00E5FF]" />
                    <span className="absolute top-1/2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-cyan-300" />
                    <span className="absolute bottom-1/3 left-1/3 w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    <span className="absolute bottom-1/3 right-1/3 w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  </div>
                </div>

                {/* Face Detected Status Badge (matching reference green rounded pill) */}
                <div className="mt-2.5 w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 text-xs font-mono font-bold shadow-[0_0_12px_rgba(16,185,129,0.2)]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Face Detected</span>
                </div>

                {/* Connecting Curved Data Beam SVG linking to the 3D pipeline */}
                <div className="hidden md:block absolute -right-6 top-1/2 -translate-y-1/2 z-20 pointer-events-none">
                  <svg width="40" height="24" viewBox="0 0 40 24" fill="none">
                    <path
                      d="M 0 12 C 20 12, 20 12, 40 12"
                      stroke="#00E5FF"
                      strokeWidth="2.5"
                      strokeDasharray="4 2"
                      className="animate-pulse"
                    />
                    <circle cx="20" cy="12" r="3" fill="#00E5FF" className="animate-ping" />
                  </svg>
                </div>
              </div>

              {/* 3D Holographic Laboratory Construction Viewport */}
              <div className="md:col-span-8 flex flex-col">
                <HolographicHero3D onExploreDemo={onTryDemo} />
              </div>
            </div>

            {/* Pipeline Stage Breadcrumbs (Preprocess -> Feature Extraction -> AI Analysis -> Forgery -> Verdict) */}
            <div className="grid grid-cols-5 gap-1.5 pt-1">
              {pipelineStages.map((stg, i) => {
                const Icon = stg.icon;
                const isActive = activePipelineStep === i;
                return (
                  <button
                    key={stg.id}
                    onClick={() => setActivePipelineStep(i)}
                    className={`p-2 rounded-xl border text-center transition-all ${
                      isActive
                        ? 'bg-cyan-500/15 border-cyan-400/50 text-cyan-300 shadow-[0_0_15px_rgba(0,229,255,0.2)]'
                        : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 mx-auto mb-1 text-cyan-400" />
                    <div className="text-[10px] font-bold font-mono truncate">{stg.label}</div>
                  </button>
                );
              })}
            </div>

          </div>

        </div>
      </div>

      {/* 2-Min Demo Video Modal */}
      {videoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xl">
          <div className="relative w-full max-w-3xl rounded-2xl border border-cyan-500/30 bg-slate-900 p-6 shadow-2xl">
            <button
              onClick={() => setVideoModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <h3 className="font-heading font-bold text-white text-lg">
                KRYPTX Multimodal Architecture Walkthrough (2 Min)
              </h3>
            </div>

            {/* Interactive Simulation Video Canvas */}
            <div className="aspect-video w-full rounded-xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center p-6 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Play className="w-8 h-8 fill-current ml-1" />
              </div>
              <div>
                <p className="text-white font-semibold text-base">
                  Forensic Pipeline Demo: Image, Video & Voice Deepfake Analysis
                </p>
                <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                  See how KRYPTX extracts EXIF stream signatures, computes Sobel and ELA differencing, checks corneal specular reflection, and outputs court-ready dockets.
                </p>
              </div>

              <button
                onClick={() => {
                  setVideoModalOpen(false);
                  onTryDemo();
                }}
                className="px-6 py-2.5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold text-xs shadow-lg shadow-cyan-500/25"
              >
                Launch Live Interactive Demo Instead →
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

