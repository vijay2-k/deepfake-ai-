import React from 'react';
import { LiveAnalysisPreview } from './LiveAnalysisPreview';
import { UploadCloud, Layers, Search, ShieldCheck, ArrowRight } from 'lucide-react';
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
      glow: 'shadow-[0_8px_20px_rgba(85,21,216,0.12)]',
      bgGrad: 'from-[#5515D8]/15 via-[#8B32FF]/10 to-transparent',
      borderColor: 'border-[#E4DEFF]',
      iconColor: 'text-[#5515D8]',
    },
    {
      step: '2',
      title: 'Analyze',
      subtitle: 'Deep AI Models & Feature Extraction',
      desc: 'Computes Sobel gradient filters, Error Level Analysis (ELA), and optical physics specular coherence.',
      icon: Layers,
      glow: 'shadow-[0_8px_20px_rgba(22,119,255,0.12)]',
      bgGrad: 'from-[#1677FF]/15 via-[#00D9FF]/10 to-transparent',
      borderColor: 'border-[#D0E4FF]',
      iconColor: 'text-[#1677FF]',
    },
    {
      step: '3',
      title: 'Detect',
      subtitle: 'AI Artifacts, Editing & Anomalies',
      desc: 'Isolates neural diffusion latent signatures, GAN checkerboard patterns, and facial warp boundaries.',
      icon: Search,
      glow: 'shadow-[0_8px_20px_rgba(139,50,255,0.12)]',
      bgGrad: 'from-[#8B32FF]/15 via-[#5515D8]/10 to-transparent',
      borderColor: 'border-[#E8D4FF]',
      iconColor: 'text-[#8B32FF]',
    },
    {
      step: '4',
      title: 'Get Report',
      subtitle: 'Authenticity, Confidence & Forensic Insights',
      desc: 'Generates court-ready dockets, verified probability scores, heatmaps, and tamper breakdown.',
      icon: ShieldCheck,
      glow: 'shadow-[0_8px_20px_rgba(2,132,199,0.12)]',
      bgGrad: 'from-[#0284C7]/15 via-[#06B6D4]/10 to-transparent',
      borderColor: 'border-[#CCEFFF]',
      iconColor: 'text-[#0284C7]',
    },
  ];

  return (
    <section id="how-it-works" className="relative py-16 lg:py-20 bg-gradient-to-b from-[#FFFFFF] via-[#FAF8FF] to-[#FFFFFF] border-t border-[#E4DEFF]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Row Layout: Workflow Pipeline on the Left / Center, Live Analysis on the Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          
          {/* ================= LEFT / MAIN: WORKFLOW PIPELINE ================= */}
          <div className="lg:col-span-7 flex flex-col space-y-8">
            
            {/* Section Header */}
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F1EEFF] border border-[#E4DEFF] text-[#5515D8] text-[10px] font-mono tracking-widest uppercase mb-3 font-bold">
                FORENSIC METHODOLOGY
              </div>
              <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#10132F] tracking-tight">
                How <span className="bg-gradient-to-r from-[#5515D8] to-[#1677FF] bg-clip-text text-transparent">KRYPTX</span> Works
              </h2>
              <p className="text-xs sm:text-sm text-[#525779] mt-2 max-w-xl leading-relaxed">
                A multimodal forensic intelligence pipeline that examines digital media, identifies suspicious patterns and produces explainable forensic insights.
              </p>
            </div>

            {/* 4 Steps Horizontal Workflow with Luminous Modern Platforms */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 items-center">
              {steps.map((stg, index) => {
                const Icon = stg.icon;
                return (
                  <React.Fragment key={stg.step}>
                    <div className="group relative flex flex-col items-center text-center p-4 rounded-2xl bg-white border border-[#E4DEFF] hover:border-[#5515D8]/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#5515D8]/10 shadow-sm">
                      
                      {/* Step Number Tag */}
                      <div className="absolute top-2.5 left-3 text-[10px] font-mono font-bold text-[#5515D8]/60">
                        0{stg.step}
                      </div>

                      {/* Glowing Platform with Icon */}
                      <div className="relative mb-3.5 mt-2">
                        <div
                          className={`w-14 h-14 rounded-2xl bg-gradient-to-b ${stg.bgGrad} border ${stg.borderColor} ${stg.glow} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                        >
                          <Icon className={`w-7 h-7 ${stg.iconColor}`} />
                        </div>
                        <div className="w-10 h-1.5 mx-auto mt-1 rounded-full bg-[#5515D8]/15 blur-[2px]" />
                      </div>

                      {/* Title & Subtitle */}
                      <h4 className="font-heading font-bold text-[#10132F] text-xs sm:text-sm uppercase tracking-wide">
                        {stg.title}
                      </h4>
                      <p className="text-[11px] text-[#525779] font-medium mt-1 leading-snug">
                        {stg.subtitle}
                      </p>
                    </div>

                    {/* Connecting Arrow between steps */}
                    {index < steps.length - 1 && (
                      <div className="hidden xl:flex justify-center -mx-3 z-10 pointer-events-none text-[#5515D8]/60">
                        <ArrowRight className="w-4 h-4 text-[#5515D8] animate-pulse" />
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
