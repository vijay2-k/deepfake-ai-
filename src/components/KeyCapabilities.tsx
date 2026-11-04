import React from 'react';
import { Image, Video, Mic, FileText, ArrowUpRight } from 'lucide-react';

interface KeyCapabilitiesProps {
  onSelectCapability?: (type: 'image' | 'video' | 'audio' | 'report') => void;
}

export const KeyCapabilities: React.FC<KeyCapabilitiesProps> = ({
  onSelectCapability,
}) => {
  const capabilities = [
    {
      id: 'image' as const,
      tag: 'IMAGE FORENSICS',
      title: 'Image Detector',
      description: 'Detects AI-generated, edited, and manipulated images with spectral ELA and diffusion signature mapping.',
      icon: Image,
      accentBorder: 'border-[#E4DEFF] hover:border-[#5515D8]',
      accentGlow: 'hover:shadow-[0_10px_30px_rgba(85,21,216,0.12)]',
      iconBg: 'bg-[#F1EEFF] text-[#5515D8] border border-[#E4DEFF]',
      gradientTag: 'text-[#5515D8]',
      activeBadge: 'Diffusion / Midjourney / FLUX',
    },
    {
      id: 'video' as const,
      tag: 'VIDEO DEEPFAKE',
      title: 'Video Deepfake',
      description: 'Identifies deepfake videos, face swaps, lip-sync anomalies, and synthetic temporal manipulation.',
      icon: Video,
      accentBorder: 'border-[#E4DEFF] hover:border-[#1677FF]',
      accentGlow: 'hover:shadow-[0_10px_30px_rgba(22,119,255,0.12)]',
      iconBg: 'bg-[#EDF5FF] text-[#1677FF] border border-[#D0E4FF]',
      gradientTag: 'text-[#1677FF]',
      activeBadge: 'Temporal Optical Flow',
    },
    {
      id: 'audio' as const,
      tag: 'VOICE FORENSICS',
      title: 'Voice Clone',
      description: 'Analyzes synthetic speech, cloned voices, neural vocoder phase artifacts, and prosodic pitch variance.',
      icon: Mic,
      accentBorder: 'border-[#E4DEFF] hover:border-[#8B32FF]',
      accentGlow: 'hover:shadow-[0_10px_30px_rgba(139,50,255,0.12)]',
      iconBg: 'bg-[#F6EEFF] text-[#8B32FF] border border-[#E8D4FF]',
      gradientTag: 'text-[#8B32FF]',
      activeBadge: 'ElevenLabs / VALL-E / TTS',
    },
    {
      id: 'report' as const,
      tag: 'DIGITAL FORENSIC REPORT',
      title: 'Forensic Report',
      description: 'Generates detailed courtroom-grade evidence, Sobel heatmaps, tamper percentages, and explainable findings.',
      icon: FileText,
      accentBorder: 'border-[#E4DEFF] hover:border-[#0284C7]',
      accentGlow: 'hover:shadow-[0_10px_30px_rgba(2,132,199,0.12)]',
      iconBg: 'bg-[#EAF8FF] text-[#0284C7] border border-[#CCEFFF]',
      gradientTag: 'text-[#0284C7]',
      activeBadge: 'Verified Cryptographic Audit',
    },
  ];

  return (
    <section id="capabilities" className="relative py-14 lg:py-18 bg-white border-t border-[#E4DEFF]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="text-[11px] font-mono font-bold tracking-widest uppercase text-[#5515D8] mb-1">
              MULTIMODAL INTELLIGENCE ARSENAL
            </div>
            <h3 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#10132F] tracking-tight">
              Key Capabilities
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-[#525779] max-w-md">
            Dedicated forensic models specialized for different media formats, synthesis architectures, and manipulation vectors.
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {capabilities.map((cap) => {
            const Icon = cap.icon;
            return (
              <div
                key={cap.id}
                onClick={() => onSelectCapability?.(cap.id)}
                className={`group p-6 rounded-2xl bg-[#FAF8FF] border ${cap.accentBorder} transition-all duration-300 hover:-translate-y-1 ${cap.accentGlow} cursor-pointer flex flex-col justify-between shadow-sm`}
              >
                <div>
                  {/* Top Bar with Icon and Arrow */}
                  <div className="flex items-center justify-between mb-5">
                    <div
                      className={`w-12 h-12 rounded-2xl ${cap.iconBg} flex items-center justify-center transition-transform group-hover:scale-110 duration-200 shadow-sm`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>

                    <div className="w-8 h-8 rounded-full bg-white border border-[#E4DEFF] flex items-center justify-center text-[#525779] group-hover:text-[#5515D8] group-hover:border-[#5515D8]/40 transition-colors shadow-sm">
                      <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </div>
                  </div>

                  {/* Micro Tag */}
                  <div className={`text-[10px] font-mono font-bold uppercase tracking-wider mb-2 ${cap.gradientTag}`}>
                    {cap.tag}
                  </div>

                  {/* Title */}
                  <h4 className="text-lg font-heading font-bold text-[#10132F] mb-2 tracking-tight group-hover:text-[#5515D8] transition-colors">
                    {cap.title}
                  </h4>

                  {/* Description */}
                  <p className="text-xs text-[#525779] leading-relaxed">
                    {cap.description}
                  </p>
                </div>

                {/* Bottom Active Engine Pill */}
                <div className="mt-6 pt-4 border-t border-[#E4DEFF] flex items-center justify-between text-[11px] font-mono text-[#525779]">
                  <span>Engine</span>
                  <span className="font-semibold text-[#10132F] bg-white px-2 py-0.5 rounded-full border border-[#E4DEFF]">
                    {cap.activeBadge}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
