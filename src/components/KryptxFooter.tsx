import React from 'react';
import { KryptxLogo } from './KryptxLogo';
import { ShieldCheck, Terminal, Cpu } from 'lucide-react';

export const KryptxFooter: React.FC = () => {
  return (
    <footer className="border-t border-[#E4DEFF] bg-[#FAF8FF] pt-16 pb-12 relative overflow-hidden z-10 text-[#525779]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <KryptxLogo size="lg" showWordmark={true} showCategory={true} />
            <p className="text-xs text-[#525779] max-w-sm leading-relaxed mt-2">
              KRYPTX is an international deep-tech platform delivering multimodal forensic intelligence to expose synthetic reality, deepfakes, and automated media manipulation.
            </p>
            <div className="pt-2">
              <span className="inline-block text-[11px] font-mono font-bold tracking-widest text-[#5515D8] uppercase border-b border-[#5515D8]/40 pb-0.5">
                EXPOSE WHAT ISN'T REAL.
              </span>
            </div>
            <div className="flex items-center gap-3 pt-3">
              <div className="p-2.5 rounded-xl bg-white border border-[#E4DEFF] text-[#525779] hover:text-[#5515D8] hover:border-[#5515D8]/50 transition-colors cursor-pointer shadow-sm">
                <Terminal className="w-4 h-4" />
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-[#E4DEFF] text-[#525779] hover:text-[#5515D8] hover:border-[#5515D8]/50 transition-colors cursor-pointer shadow-sm">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-[#E4DEFF] text-[#525779] hover:text-[#5515D8] hover:border-[#5515D8]/50 transition-colors cursor-pointer shadow-sm">
                <Cpu className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Solutions Column */}
          <div className="space-y-3">
            <div className="text-xs font-mono font-bold tracking-wider text-[#10132F] uppercase">
              Forensic Engines
            </div>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#capabilities" className="hover:text-[#5515D8] transition-colors">
                  Image Diffusion Analysis
                </a>
              </li>
              <li>
                <a href="#capabilities" className="hover:text-[#5515D8] transition-colors">
                  Video Deepfake Detection
                </a>
              </li>
              <li>
                <a href="#capabilities" className="hover:text-[#5515D8] transition-colors">
                  AI Voice & Speech Formants
                </a>
              </li>
              <li>
                <a href="#capabilities" className="hover:text-[#5515D8] transition-colors">
                  Error Level Analysis (ELA)
                </a>
              </li>
              <li>
                <a href="#capabilities" className="hover:text-[#5515D8] transition-colors">
                  Cryptographic Provenance
                </a>
              </li>
            </ul>
          </div>

          {/* Technology Column */}
          <div className="space-y-3">
            <div className="text-xs font-mono font-bold tracking-wider text-[#10132F] uppercase">
              Technology
            </div>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#how-it-works" className="hover:text-[#5515D8] transition-colors">
                  Multimodal Pipeline
                </a>
              </li>
              <li>
                <a href="#hero" className="hover:text-[#5515D8] transition-colors">
                  3D Face Reconstruction
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-[#5515D8] transition-colors">
                  Explainable Forensic Docket
                </a>
              </li>
              <li>
                <span className="text-[#525779]/60">API Documentation (v4.0)</span>
              </li>
              <li>
                <span className="text-[#525779]/60">Zero-Retention Security</span>
              </li>
            </ul>
          </div>

          {/* Compliance & Standards */}
          <div className="space-y-3">
            <div className="text-xs font-mono font-bold tracking-wider text-[#10132F] uppercase">
              Compliance & Safety
            </div>
            <ul className="space-y-2 text-xs">
              <li>
                <span className="hover:text-[#5515D8] transition-colors cursor-pointer">
                  C2PA Provenance Standards
                </span>
              </li>
              <li>
                <span className="hover:text-[#5515D8] transition-colors cursor-pointer">
                  NIST Forensic Audio Alignment
                </span>
              </li>
              <li>
                <span className="hover:text-[#5515D8] transition-colors cursor-pointer">
                  EU AI Act Compliance
                </span>
              </li>
              <li>
                <span className="hover:text-[#5515D8] transition-colors cursor-pointer">
                  Ethical AI Verification
                </span>
              </li>
              <li>
                <span className="hover:text-[#5515D8] transition-colors cursor-pointer">
                  Security Whitepaper
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright & Status */}
        <div className="pt-8 border-t border-[#E4DEFF] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-mono">
          <div className="text-[#525779]">
            © {new Date().getFullYear()} KRYPTX Forensic Intelligence Inc. All rights reserved.
          </div>
          <div className="flex items-center gap-4 text-[#525779]">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#1677FF] animate-pulse" />
              <span>Multi-Model Forensic Consensus: Operational</span>
            </span>
            <span>•</span>
            <span className="text-[#5515D8] font-bold">KRYPTX Core v4.2</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
