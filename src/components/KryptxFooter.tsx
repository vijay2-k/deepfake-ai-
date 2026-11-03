import React from 'react';
import { KryptxLogo } from './KryptxLogo';
import { ShieldCheck, Lock, Terminal, Cpu, ArrowUpRight, Github, Twitter, Linkedin } from 'lucide-react';

export const KryptxFooter: React.FC = () => {
  return (
    <footer className="border-t border-cyan-500/15 bg-gradient-to-b from-[#030712] via-[#02050c] to-[#010307] pt-16 pb-12 relative overflow-hidden z-10">
      {/* Subtle top glow line */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <KryptxLogo size="lg" showWordmark={true} showCategory={true} />
            <p className="text-xs text-slate-400 max-w-sm leading-relaxed mt-2">
              KRYPTX is an international deep-tech platform delivering multimodal forensic intelligence to expose synthetic reality, deepfakes, and automated media manipulation.
            </p>
            <div className="pt-2">
              <span className="inline-block text-[11px] font-mono font-bold tracking-widest text-[#00E5FF] uppercase border-b border-cyan-500/40 pb-0.5">
                EXPOSE WHAT ISN'T REAL.
              </span>
            </div>
            <div className="flex items-center gap-3 pt-3 text-slate-400">
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-cyan-400 transition-colors cursor-pointer">
                <Terminal className="w-4 h-4" />
              </div>
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-cyan-400 transition-colors cursor-pointer">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-cyan-400 transition-colors cursor-pointer">
                <Cpu className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Solutions Column */}
          <div className="space-y-3">
            <div className="text-xs font-mono font-bold tracking-wider text-white uppercase">
              Forensic Engines
            </div>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <a href="#capabilities" className="hover:text-cyan-400 transition-colors">
                  Image Diffusion Analysis
                </a>
              </li>
              <li>
                <a href="#capabilities" className="hover:text-cyan-400 transition-colors">
                  Video Deepfake Detection
                </a>
              </li>
              <li>
                <a href="#capabilities" className="hover:text-cyan-400 transition-colors">
                  AI Voice & Speech Formants
                </a>
              </li>
              <li>
                <a href="#capabilities" className="hover:text-cyan-400 transition-colors">
                  Error Level Analysis (ELA)
                </a>
              </li>
              <li>
                <a href="#capabilities" className="hover:text-cyan-400 transition-colors">
                  Cryptographic Provenance
                </a>
              </li>
            </ul>
          </div>

          {/* Technology Column */}
          <div className="space-y-3">
            <div className="text-xs font-mono font-bold tracking-wider text-white uppercase">
              Technology
            </div>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <a href="#how-it-works" className="hover:text-cyan-400 transition-colors">
                  Multimodal Pipeline
                </a>
              </li>
              <li>
                <a href="#hero" className="hover:text-cyan-400 transition-colors">
                  3D Holographic Laboratory
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-cyan-400 transition-colors">
                  Explainable Forensic Docket
                </a>
              </li>
              <li>
                <span className="text-slate-500">API Documentation (v4.0)</span>
              </li>
              <li>
                <span className="text-slate-500">Zero-Retention Security</span>
              </li>
            </ul>
          </div>

          {/* Compliance Column */}
          <div className="space-y-3">
            <div className="text-xs font-mono font-bold tracking-wider text-white uppercase">
              Enterprise
            </div>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <span className="hover:text-cyan-400 cursor-pointer transition-colors">
                  Courtroom Admissibility
                </span>
              </li>
              <li>
                <span className="hover:text-cyan-400 cursor-pointer transition-colors">
                  Newsroom Verification
                </span>
              </li>
              <li>
                <span className="hover:text-cyan-400 cursor-pointer transition-colors">
                  Financial Fraud Prevention
                </span>
              </li>
              <li>
                <span className="hover:text-cyan-400 cursor-pointer transition-colors">
                  SOC2 Type II & ISO 27001
                </span>
              </li>
              <li>
                <span className="hover:text-cyan-400 cursor-pointer transition-colors">
                  On-Premise Deployment
                </span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-mono text-slate-400">
          <div className="flex items-center gap-3">
            <span>© {new Date().getFullYear()} KRYPTX Intelligence Inc.</span>
            <span>•</span>
            <span className="text-cyan-400">All Systems Operational</span>
          </div>

          <div className="flex items-center gap-6">
            <span className="hover:text-slate-300 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-300 cursor-pointer">Forensic Standards</span>
            <span className="hover:text-slate-300 cursor-pointer">Security Whitepaper</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

