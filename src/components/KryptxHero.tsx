import React, { useState } from 'react';
import { CinematicProductDemo } from './CinematicProductDemo';
import { FaceAiReconstruction } from './FaceAiReconstruction';
import {
  ShieldCheck,
  Play,
  ArrowRight,
  Layers,
  Zap,
  Clock,
  Image as ImageIcon,
  Video as VideoIcon,
  Mic,
  Maximize2,
  AlertTriangle,
  Activity,
  Scan,
  Box,
  ChevronRight,
  Sparkles,
  RotateCcw,
} from 'lucide-react';

interface KryptxHeroProps {
  onTryDemo: () => void;
  onSelectModule?: (type: 'image' | 'video' | 'audio' | 'multimodal') => void;
  onOpenCinematicDemo?: () => void;
}

export const KryptxHero: React.FC<KryptxHeroProps> = ({
  onTryDemo,
  onSelectModule,
  onOpenCinematicDemo,
}) => {
  const [videoModalOpen, setVideoModalOpen] = useState(false);

  const handleModuleClick = (type: 'image' | 'video' | 'audio' | 'multimodal') => {
    if (onSelectModule) {
      onSelectModule(type);
    } else {
      onTryDemo();
    }
  };

  return (
    <section id="hero" className="relative pt-6 pb-12 overflow-hidden bg-gradient-to-b from-[#FFFFFF] via-[#FAF8FF] to-[#F1EEFF]">
      {/* Background Soft Purple & Blue Ambient Lights */}
      <div className="absolute top-10 left-1/4 w-[500px] h-[500px] bg-[#8B32FF]/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-20 right-10 w-[600px] h-[600px] bg-[#1677FF]/6 blur-[140px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* ================= HERO COMPOSITION: MATCHING REFERENCE SCREENSHOT ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-4 items-center">
          
          {/* ================= LEFT COLUMN ================= */}
          <div className="lg:col-span-5 flex flex-col justify-center space-y-6">
            {/* Small Top Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F1EEFF] border border-[#E4DEFF] self-start shadow-sm">
              <ShieldCheck className="w-4 h-4 text-[#5515D8]" />
              <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-[#5515D8]">
                AI Media Forensics Platform
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-[50px] font-heading font-extrabold text-[#10132F] tracking-tight leading-[1.12]">
              Detect AI-Generated Media.{' '}
              <span className="block mt-1 bg-gradient-to-r from-[#6C24EE] via-[#5515D8] to-[#1677FF] bg-clip-text text-transparent">
                Expose What's Not Real.
              </span>
            </h1>

            {/* Description */}
            <p className="text-sm sm:text-base text-[#525779] leading-relaxed max-w-xl font-normal">
              Advanced multimodal intelligence to detect AI-generated, manipulated and deepfake images, videos and voices through explainable digital forensic analysis.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-1">
              {/* Primary CTA: Try Live Demo */}
              <button
                onClick={onTryDemo}
                className="relative group px-8 py-3.5 rounded-full text-sm font-bold text-white overflow-hidden shadow-[0_8px_25px_rgba(85,21,216,0.28)] hover:shadow-[0_12px_32px_rgba(85,21,216,0.42)] transition-all duration-300 flex items-center gap-2.5 cursor-pointer bg-gradient-to-r from-[#5515D8] via-[#7B2BFF] to-[#8B32FF] hover:scale-[1.02]"
              >
                <span>Try Live Demo</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              {/* Secondary CTA: Watch 50-Second Fullscreen Demo */}
              <button
                onClick={onOpenCinematicDemo ? onOpenCinematicDemo : () => setVideoModalOpen(true)}
                className="px-6 py-3.5 rounded-full text-sm font-bold text-[#10132F] bg-white hover:bg-[#F8F7FF] border border-[#E4DEFF] hover:border-[#5515D8]/40 shadow-sm transition-all duration-200 flex items-center gap-2 cursor-pointer group hover:scale-[1.01]"
              >
                <div className="w-6 h-6 rounded-full bg-[#F1EEFF] group-hover:bg-[#5515D8] flex items-center justify-center text-[#5515D8] group-hover:text-white transition-colors">
                  <Play className="w-3 h-3 fill-current ml-0.5" />
                </div>
                <span>Watch Demo</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-[#5515D8]/10 text-[#5515D8] font-bold">50s</span>
              </button>
            </div>

            {/* 4 Trust Indicators (Matches Reference) */}
            <div className="pt-4 flex flex-wrap items-center gap-5 text-xs text-[#525779] font-medium">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#5515D8]" />
                <span className="font-semibold text-[#10132F]">Accurate</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-[#5515D8]" />
                <span className="font-semibold text-[#10132F]">Explainable</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-[#5515D8]" />
                <span className="font-semibold text-[#10132F]">Multimodal</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#5515D8]" />
                <span className="font-semibold text-[#10132F]">Real-time</span>
              </div>
            </div>
          </div>

          {/* ================= CENTER-RIGHT: FUTURISTIC FACE & FLOATING DASHBOARD ================= */}
          <div className="lg:col-span-7 relative flex items-center justify-center min-h-[460px] sm:min-h-[500px]">
            
            {/* Luminous Circular Orbital Rings behind face */}
            <div className="absolute left-1/3 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[340px] sm:w-[420px] sm:h-[420px] rounded-full border border-[#8B32FF]/20 animate-spin-slow pointer-events-none" />
            <div className="absolute left-1/3 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] h-[280px] sm:w-[350px] sm:h-[350px] rounded-full border border-dashed border-[#00D9FF]/30 pointer-events-none" />

            {/* Gradual Human-Face-to-AI Hologram Transformation Container */}
            <div className="relative z-10 w-[240px] sm:w-[280px] md:w-[310px] h-[340px] sm:h-[390px] md:h-[420px] rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(85,21,216,0.22)] border border-[#E4DEFF] mr-auto lg:ml-8">
              <FaceAiReconstruction mode="hero" />
            </div>

            {/* ================= FLOATING FORENSIC DASHBOARD PANEL (Overlapping Right Side) ================= */}
            <div className="absolute -right-2 sm:right-2 md:right-4 top-1/2 -translate-y-1/2 w-[280px] sm:w-[330px] md:w-[360px] z-20 rounded-3xl p-5 bg-gradient-to-b from-[#0E1030]/95 via-[#141242]/95 to-[#1C1250]/95 backdrop-blur-2xl border border-[#8B32FF]/40 shadow-[0_25px_60px_rgba(16,19,47,0.35),0_0_35px_rgba(85,21,216,0.15)] text-white space-y-4">
              
              {/* Panel Header */}
              <div className="flex items-center gap-2.5 pb-2 border-b border-white/10">
                <div className="w-7 h-7 rounded-lg bg-[#5515D8]/30 flex items-center justify-center text-[#8B32FF] border border-[#8B32FF]/40">
                  <Activity className="w-4 h-4 animate-pulse text-[#00D9FF]" />
                </div>
                <h3 className="text-xs sm:text-sm font-heading font-bold tracking-tight text-white">
                  AI Analysis & Forensic Report
                </h3>
              </div>

              {/* Sub-Card with Thumbnail & Alert */}
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-cyan-400/40 relative">
                    <img
                      src="/hero-face-portrait.jpg"
                      alt="Analyzed target"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-cyan-500/10 pointer-events-none" />
                  </div>

                  {/* Red Alert Pill */}
                  <div className="flex-1 min-w-0 p-2 rounded-xl bg-rose-500/15 border border-rose-500/30">
                    <div className="flex items-center gap-1.5 text-rose-400 font-bold text-[11px]">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">AI-Generated Media Detected</span>
                    </div>
                    <div className="text-[10px] text-rose-200/80 font-mono mt-0.5">
                      Confidence: <span className="font-bold text-white">99.4%</span>
                    </div>
                  </div>
                </div>

                {/* Evidence Progress Bars */}
                <div className="space-y-1.5 pt-1 text-[10px] font-medium">
                  <div>
                    <div className="flex justify-between text-slate-300 mb-0.5">
                      <span className="flex items-center gap-1">
                        <Box className="w-3 h-3 text-[#8B32FF]" />
                        <span>Model Artifacts</span>
                      </span>
                      <span className="font-mono text-cyan-300 font-bold">99%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-[#5515D8] via-[#8B32FF] to-[#00D9FF]" style={{ width: '99%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-300 mb-0.5">
                      <span className="flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-[#8B32FF]" />
                        <span>Texture Inconsistency</span>
                      </span>
                      <span className="font-mono text-cyan-300 font-bold">97%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-[#5515D8] via-[#8B32FF] to-[#00D9FF]" style={{ width: '97%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-300 mb-0.5">
                      <span className="flex items-center gap-1">
                        <Zap className="w-3 h-3 text-[#8B32FF]" />
                        <span>Lighting & Shadows</span>
                      </span>
                      <span className="font-mono text-cyan-300 font-bold">98%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-[#5515D8] via-[#8B32FF] to-[#00D9FF]" style={{ width: '98%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-300 mb-0.5">
                      <span className="flex items-center gap-1">
                        <Scan className="w-3 h-3 text-[#8B32FF]" />
                        <span>Facial Structure (GAN)</span>
                      </span>
                      <span className="font-mono text-cyan-300 font-bold">99%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-[#5515D8] via-[#8B32FF] to-[#00D9FF]" style={{ width: '99%' }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Analysis Overview 2x2 Grid */}
              <div className="pt-1">
                <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Analysis Overview
                </div>
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div className="p-2 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-[#8B32FF] shrink-0" />
                    <div>
                      <div className="text-slate-400 text-[9px]">Media Type</div>
                      <div className="font-bold text-white">Image</div>
                    </div>
                  </div>

                  <div className="p-2 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-[#1677FF] shrink-0" />
                    <div>
                      <div className="text-slate-400 text-[9px]">Method</div>
                      <div className="font-bold text-white truncate">Multimodal</div>
                    </div>
                  </div>

                  <div className="p-2 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2">
                    <Maximize2 className="w-4 h-4 text-[#00D9FF] shrink-0" />
                    <div>
                      <div className="text-slate-400 text-[9px]">Resolution</div>
                      <div className="font-mono font-bold text-white">1024 × 1024</div>
                    </div>
                  </div>

                  <div className="p-2 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2">
                    <Box className="w-4 h-4 text-[#8B32FF] shrink-0" />
                    <div>
                      <div className="text-slate-400 text-[9px]">Detected Model</div>
                      <div className="font-bold text-white truncate">Diffusion/GAN</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ================= 4 FORENSIC MODULE CARDS (DIRECTLY BELOW HERO) ================= */}
        <div className="mt-14 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Card 1: Image Forensics */}
            <button
              onClick={() => handleModuleClick('image')}
              className="group text-left p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#4A11BF] via-[#5515D8] to-[#7626E8] text-white shadow-lg shadow-[#5515D8]/20 hover:shadow-xl hover:shadow-[#5515D8]/35 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center text-white shrink-0 group-hover:scale-110 transition-transform">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-heading font-bold text-white truncate">
                    Image Forensics
                  </h4>
                  <p className="text-[11px] text-white/80 truncate">
                    Detect AI, edits & forgeries
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-white/70 group-hover:text-white group-hover:translate-x-1 transition-all shrink-0 ml-2" />
            </button>

            {/* Card 2: Video Forensics */}
            <button
              onClick={() => handleModuleClick('video')}
              className="group text-left p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#0D65E8] via-[#1677FF] to-[#0099FF] text-white shadow-lg shadow-[#1677FF]/20 hover:shadow-xl hover:shadow-[#1677FF]/35 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center text-white shrink-0 group-hover:scale-110 transition-transform">
                  <VideoIcon className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-heading font-bold text-white truncate">
                    Video Forensics
                  </h4>
                  <p className="text-[11px] text-white/80 truncate">
                    Find deepfakes & manipulations
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-white/70 group-hover:text-white group-hover:translate-x-1 transition-all shrink-0 ml-2" />
            </button>

            {/* Card 3: Audio Forensics */}
            <button
              onClick={() => handleModuleClick('audio')}
              className="group text-left p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#7A18E6] via-[#8B32FF] to-[#A838FF] text-white shadow-lg shadow-[#8B32FF]/20 hover:shadow-xl hover:shadow-[#8B32FF]/35 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center text-white shrink-0 group-hover:scale-110 transition-transform">
                  <Mic className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-heading font-bold text-white truncate">
                    Audio Forensics
                  </h4>
                  <p className="text-[11px] text-white/80 truncate">
                    Identify AI-generated voices
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-white/70 group-hover:text-white group-hover:translate-x-1 transition-all shrink-0 ml-2" />
            </button>

            {/* Card 4: Multimodal Analysis */}
            <button
              onClick={() => handleModuleClick('multimodal')}
              className="group text-left p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#0284C7] via-[#0284C7] to-[#06B6D4] text-white shadow-lg shadow-[#0284C7]/20 hover:shadow-xl hover:shadow-[#0284C7]/35 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center text-white shrink-0 group-hover:scale-110 transition-transform">
                  <Layers className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-heading font-bold text-white truncate">
                    Multimodal Analysis
                  </h4>
                  <p className="text-[11px] text-white/80 truncate">
                    Combine signals for accuracy
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-white/70 group-hover:text-white group-hover:translate-x-1 transition-all shrink-0 ml-2" />
            </button>
          </div>
        </div>
      </div>

      {/* ================= FULL-WIDTH MULTICOLOUR CONTINUOUS FLOWING WAVE (EDGE TO EDGE) ================= */}
      <div className="relative w-full overflow-hidden pointer-events-none mt-10 sm:mt-14 select-none -mb-1">
        <div className="relative w-full h-16 sm:h-20 lg:h-24 overflow-hidden">
          {/* Layer 1: Deep Violet / Indigo Back Wave (Slow continuous drift) */}
          <div className="absolute inset-0 w-[200%] flex animate-wave-flow-slow opacity-40">
            <svg viewBox="0 0 1440 100" fill="none" preserveAspectRatio="none" className="w-1/2 h-full shrink-0">
              <path
                d="M0 45C320 15 540 75 800 40C1060 5 1280 65 1440 35V100H0V45Z"
                fill="url(#wave-grad-back)"
              />
            </svg>
            <svg viewBox="0 0 1440 100" fill="none" preserveAspectRatio="none" className="w-1/2 h-full shrink-0">
              <path
                d="M0 45C320 15 540 75 800 40C1060 5 1280 65 1440 35V100H0V45Z"
                fill="url(#wave-grad-back)"
              />
            </svg>
          </div>

          {/* Layer 2: Electric Blue / Cyan Middle Wave */}
          <div className="absolute inset-0 w-[200%] flex animate-wave-flow opacity-60">
            <svg viewBox="0 0 1440 100" fill="none" preserveAspectRatio="none" className="w-1/2 h-full shrink-0">
              <path
                d="M0 55C240 25 480 85 760 50C1040 15 1240 75 1440 45V100H0V55Z"
                fill="url(#wave-grad-mid)"
              />
            </svg>
            <svg viewBox="0 0 1440 100" fill="none" preserveAspectRatio="none" className="w-1/2 h-full shrink-0">
              <path
                d="M0 55C240 25 480 85 760 50C1040 15 1240 75 1440 45V100H0V55Z"
                fill="url(#wave-grad-mid)"
              />
            </svg>
          </div>

          {/* Layer 3: Vibrant Glowing Front Ribbon (Purple -> Violet -> Blue -> Cyan) */}
          <div className="absolute inset-0 w-[200%] flex animate-wave-flow-fast opacity-90">
            <svg viewBox="0 0 1440 100" fill="none" preserveAspectRatio="none" className="w-1/2 h-full shrink-0">
              <defs>
                <linearGradient id="wave-grad-front" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#8B32FF" />
                  <stop offset="30%" stopColor="#5515D8" />
                  <stop offset="65%" stopColor="#1677FF" />
                  <stop offset="100%" stopColor="#00D9FF" />
                </linearGradient>
                <linearGradient id="wave-grad-mid" x1="100%" y1="0%" x2="0%" y2="0%">
                  <stop offset="0%" stopColor="#00D9FF" stopOpacity="0.8" />
                  <stop offset="50%" stopColor="#1677FF" stopOpacity="0.7" />
                  <stop offset="100%" stopColor="#8B32FF" stopOpacity="0.6" />
                </linearGradient>
                <linearGradient id="wave-grad-back" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#5515D8" stopOpacity="0.6" />
                  <stop offset="50%" stopColor="#3210A8" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="#8B32FF" stopOpacity="0.6" />
                </linearGradient>
              </defs>
              <path
                d="M0 65C200 35 440 95 720 55C1000 15 1200 80 1440 50V100H0V65Z"
                fill="url(#wave-grad-front)"
              />
            </svg>
            <svg viewBox="0 0 1440 100" fill="none" preserveAspectRatio="none" className="w-1/2 h-full shrink-0">
              <path
                d="M0 65C200 35 440 95 720 55C1000 15 1200 80 1440 50V100H0V65Z"
                fill="url(#wave-grad-front)"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Cinematic Product Demo Modal */}
      {videoModalOpen && (
        <CinematicProductDemo
          isOpen={videoModalOpen}
          onClose={() => setVideoModalOpen(false)}
        />
      )}
    </section>
  );
};
