import React from 'react';
import { LiveAnalysisPreview } from './LiveAnalysisPreview';
import { UploadCloud, Layers, Search, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';
import { MediaType } from '../types/detector';

interface HowKryptxWorksProps {
  onAnalyze: (fileData: {
    file?: File;
    base64: string;
    mimeType: string;
    name: string;
    size: number;
    mediaType?: MediaType;
  }) => void;
  isAnalyzing: boolean;
  uploadProgress?: number | null;
}

export const HowKryptxWorks: React.FC<HowKryptxWorksProps> = ({
  onAnalyze,
  isAnalyzing,
  uploadProgress,
}) => {
  const steps = [
    {
      step: '1',
      title: 'Upload Media',
      subtitle: 'Image / Video / Voice',
      desc: 'Ingests RAW files, social media streams, audio payloads and extracts embedded EXIF hardware headers.',
      icon: UploadCloud,
      color: 'cyan',
      glow: 'shadow-[0_0_25px_rgba(0,229,255,0.35)]',
      bgGrad: 'from-cyan-500/20 via-cyan-500/5 to-transparent',
      borderColor: 'border-cyan-500/30',
      iconColor: 'text-cyan-400',
    },
    {
      step: '2',
      title: 'Analyze',
      subtitle: 'Deep AI Models & Feature Extraction',
      desc: 'Computes Sobel gradient filters, Error Level Analysis (ELA), and optical physics specular coherence.',
      icon: Layers,
      color: 'blue',
      glow: 'shadow-[0_0_25px_rgba(38,124,255,0.35)]',
      bgGrad: 'from-blue-500/20 via-blue-500/5 to-transparent',
      borderColor: 'border-blue-500/30',
      iconColor: 'text-blue-400',
    },
    {
      step: '3',
      title: 'Detect',
      subtitle: 'AI Artifacts, Editing & Anomalies',
      desc: 'Isolates neural diffusion latent signatures, GAN checkerboard patterns, and facial warp boundaries.',
      icon: Search,
      color: 'violet',
      glow: 'shadow-[0_0_25px_rgba(139,92,246,0.35)]',
      bgGrad: 'from-violet-500/20 via-violet-500/5 to-transparent',
      borderColor: 'border-violet-500/30',
      iconColor: 'text-violet-400',
    },
    {
      step: '4',
      title: 'Get Report',
      subtitle: 'Authenticity, Confidence & Forensic Insights',
      desc: 'Generates court-ready dockets, verified probability scores, heatmaps, and tamper breakdown.',
      icon: ShieldCheck,
      color: 'teal',
      glow: 'shadow-[0_0_25px_rgba(20,184,166,0.35)]',
      bgGrad: 'from-teal-500/20 via-teal-500/5 to-transparent',
      borderColor: 'border-teal-500/30',
      iconColor: 'text-teal-400',
    },
  ];

  return (
    <section id="how-it-works" className="relative py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Row Layout Matching Reference: Workflow Pipeline on the Left / Center, Live Analysis on the Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          
          {/* ================= LEFT / MAIN: WORKFLOW PIPELINE ================= */}
          <div className="lg:col-span-7 flex flex-col space-y-8">
            
            {/* Section Header */}
            <div>
              <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-white tracking-tight">
                How <span className="text-[#00E5FF]">KRYPTX</span> Works
              </h2>
              <p className="text-xs sm:text-sm text-slate-300/80 mt-2 max-w-xl leading-relaxed">
                A multimodal forensic intelligence pipeline that examines digital media, identifies suspicious patterns and produces explainable forensic insights.
              </p>
            </div>

            {/* 4 Steps Horizontal Workflow with 3D Glowing Platforms */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 items-center">
              {steps.map((stg, index) => {
                const Icon = stg.icon;
                return (
                  <React.Fragment key={stg.step}>
                    <div className="group relative flex flex-col items-center text-center p-4 rounded-2xl bg-[#050e1d]/85 border border-slate-800/90 hover:border-cyan-500/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                      
                      {/* Step Number Tag */}
                      <div className="absolute top-2.5 left-3 text-[10px] font-mono font-bold text-slate-400">
                        0{stg.step}
                      </div>

                      {/* 3D-inspired Glowing Platform with Icon */}
                      <div className="relative mb-3.5 mt-2">
                        {/* Elliptical Glowing Platform Base */}
                        <div
                          className={`w-14 h-14 rounded-2xl bg-gradient-to-b ${stg.bgGrad} border ${stg.borderColor} ${stg.glow} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                        >
                          <Icon className={`w-7 h-7 ${stg.iconColor}`} />
                        </div>
                        {/* Reflection ring beneath */}
                        <div className="w-10 h-2 mx-auto mt-1 rounded-full bg-cyan-400/20 blur-[2px]" />
                      </div>

                      {/* Title & Subtitle */}
                      <h4 className="font-heading font-bold text-white text-xs sm:text-sm uppercase tracking-wide">
                        {stg.title}
                      </h4>
                      <p className="text-[11px] text-slate-300 font-medium mt-1 leading-snug">
                        {stg.subtitle}
                      </p>
                    </div>

                    {/* Connecting Arrow between steps (hidden on last step & small screens) */}
                    {index < steps.length - 1 && (
                      <div className="hidden xl:flex justify-center -mx-3 z-10 pointer-events-none text-slate-400">
                        <ArrowRight className="w-4 h-4 text-cyan-400/60 animate-pulse" />
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>

          </div>

          {/* ================= RIGHT: TRY A LIVE ANALYSIS PANEL ================= */}
          <div className="lg:col-span-5">
            <LiveAnalysisPreview
              onAnalyze={onAnalyze}
              isAnalyzing={isAnalyzing}
              uploadProgress={uploadProgress}
            />
          </div>

        </div>

      </div>
    </section>
  );
};

