import React from 'react';
import { Image, Video, Mic, FileText, ArrowUpRight, Sparkles } from 'lucide-react';

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
      accentBorder: 'border-amber-500/40 hover:border-amber-400',
      accentGlow: 'hover:shadow-[0_0_30px_rgba(255,157,50,0.25)]',
      iconBg: 'bg-amber-500/10 text-[#FF9D32] border border-amber-500/30',
      gradientTag: 'text-amber-400',
      activeBadge: 'Diffusion / Midjourney / FLUX',
    },
    {
      id: 'video' as const,
      tag: 'VIDEO DEEPFAKE',
      title: 'Video Deepfake',
      description: 'Identifies deepfake videos, face swaps, lip-sync anomalies, and synthetic temporal manipulation.',
      icon: Video,
      accentBorder: 'border-blue-500/40 hover:border-blue-400',
      accentGlow: 'hover:shadow-[0_0_30px_rgba(38,124,255,0.25)]',
      iconBg: 'bg-blue-500/10 text-[#267CFF] border border-blue-500/30',
      gradientTag: 'text-blue-400',
      activeBadge: 'Temporal Optical Flow',
    },
    {
      id: 'audio' as const,
      tag: 'VOICE FORENSICS',
      title: 'Voice Clone',
      description: 'Analyzes synthetic speech, cloned voices, neural vocoder phase artifacts, and prosodic pitch variance.',
      icon: Mic,
      accentBorder: 'border-violet-500/40 hover:border-violet-400',
      accentGlow: 'hover:shadow-[0_0_30px_rgba(139,92,246,0.25)]',
      iconBg: 'bg-violet-500/10 text-[#8B5CF6] border border-violet-500/30',
      gradientTag: 'text-violet-400',
      activeBadge: 'ElevenLabs / VALL-E / TTS',
    },
    {
      id: 'report' as const,
      tag: 'DIGITAL FORENSIC REPORT',
      title: 'Forensic Report',
      description: 'Generates detailed courtroom-grade evidence, Sobel heatmaps, tamper percentages, and explainable findings.',
      icon: FileText,
      accentBorder: 'border-teal-500/40 hover:border-teal-400',
      accentGlow: 'hover:shadow-[0_0_30px_rgba(20,184,166,0.25)]',
      iconBg: 'bg-teal-500/10 text-[#14B8A6] border border-teal-500/30',
      gradientTag: 'text-teal-400',
      activeBadge: 'Verified Cryptographic Audit',
    },
  ];

  return (
    <section id="capabilities" className="relative py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="text-[11px] font-mono font-bold tracking-widest uppercase text-cyan-400 mb-1">
              MULTIMODAL INTELLIGENCE ARSENAL
            </div>
            <h3 className="text-2xl sm:text-3xl font-heading font-extrabold text-white tracking-tight">
              Key Capabilities
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md">
            Four specialized detection engines operating concurrently across visual, temporal, and auditory media vectors.
          </p>
        </div>

        {/* 4 Horizontal Capability Cards Matching Reference */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {capabilities.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                onClick={() => onSelectCapability && onSelectCapability(item.id)}
                className={`group relative p-5 rounded-2xl bg-gradient-to-b from-[#061224]/90 to-[#030914]/95 border ${item.accentBorder} ${item.accentGlow} backdrop-blur-xl transition-all duration-300 hover:-translate-y-1.5 cursor-pointer flex flex-col justify-between`}
              >
                <div>
                  {/* Top Row: Icon & Tag */}
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 ${item.iconBg}`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>

                    <div className="w-7 h-7 rounded-full bg-slate-800/60 flex items-center justify-center text-slate-400 group-hover:text-white group-hover:bg-cyan-500/20 transition-all">
                      <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div className="text-[10px] font-mono font-bold tracking-wider uppercase mb-1 text-slate-400">
                    {item.tag}
                  </div>
                  <h4 className="font-heading font-bold text-white text-base sm:text-lg mb-2">
                    {item.title}
                  </h4>
                  <p className="text-xs text-slate-300/80 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {/* Bottom Tech Badge */}
                <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-cyan-400/90 font-medium truncate">
                    {item.activeBadge}
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

