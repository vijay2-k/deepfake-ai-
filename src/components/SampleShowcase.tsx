import React from 'react';
import { Sparkles, Bot, Camera, AlertTriangle, ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';
import { SAMPLE_SHOWCASE_IMAGES, SampleImageItem } from '../data/sampleImages';

interface SampleShowcaseProps {
  onSelectSample: (sample: SampleImageItem) => void;
}

export const SampleShowcase: React.FC<SampleShowcaseProps> = ({ onSelectSample }) => {
  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#5515D8]/10 border border-[#E4DEFF] text-[#5515D8] text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Forensic Benchmarking Laboratory</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          How to Differentiate AI from Real Photographs
        </h2>
        <p className="text-sm text-slate-300">
          Explore benchmark specimens designed to test optical physics, diffusion signatures, and ambiguous compression limits. Click any specimen to run an empirical forensic pass.
        </p>
      </div>

      {/* Grid of Specimen Studies */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {SAMPLE_SHOWCASE_IMAGES.map((sample) => {
          const isAI = sample.category === 'AI Generated';
          const isReal = sample.category === 'Real Photograph';

          return (
            <div
              key={sample.id}
              className="bg-white rounded-2xl border border-[#E4DEFF] p-5 hover:border-[#5515D8]/60 transition-all flex flex-col justify-between shadow-xl"
            >
              <div className="space-y-4">
                {/* Image and Badge */}
                <div className="relative aspect-[16/10] bg-[#F8F7FF] rounded-xl overflow-hidden border border-[#E4DEFF] flex items-center justify-center group">
                  <img
                    src={sample.dataUrl}
                    alt={sample.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md ${
                        isAI
                          ? 'bg-rose-950/80 text-rose-300 border border-rose-500/40'
                          : isReal
                          ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                          : 'bg-amber-950/80 text-amber-300 border border-amber-500/40'
                      }`}
                    >
                      {isAI && <Bot className="w-3.5 h-3.5" />}
                      {isReal && <Camera className="w-3.5 h-3.5" />}
                      {!isAI && !isReal && <AlertTriangle className="w-3.5 h-3.5" />}
                      {sample.category}
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div>
                  <h3 className="text-lg font-bold text-white">{sample.title}</h3>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">{sample.description}</p>
                </div>

                {/* Forensic Telltales List */}
                <div className="space-y-2 pt-2 border-t border-[#E4DEFF]">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Forensic Examination Markers:
                  </div>
                  <ul className="space-y-1.5">
                    {sample.indicators.map((ind, i) => (
                      <li key={i} className="text-xs text-slate-400 flex items-start gap-2">
                        <CheckCircle2
                          className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${
                            isAI ? 'text-rose-400' : isReal ? 'text-emerald-400' : 'text-amber-400'
                          }`}
                        />
                        <span>{ind}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-5 pt-4 border-t border-[#E4DEFF]">
                <button
                  onClick={() => onSelectSample(sample)}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#F8F7FF] hover:bg-[#5515D8] text-[#5515D8] hover:text-white border border-[#E4DEFF] hover:border-[#5515D8] text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
                >
                  <span>Load Specimen & Run Forensic Scan</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Forensic Deep-Dive Educational Section */}
      <div className="bg-white rounded-2xl border border-[#E4DEFF] p-6 sm:p-8 space-y-6">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-[#5515D8]" />
          The Science of AI Image Forensics
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-300">
          <div className="space-y-2">
            <h4 className="font-bold text-white text-sm">1. High-Frequency Fourier Discrepancies</h4>
            <p className="leading-relaxed text-slate-400">
              Diffusion denoisers create subtle high-frequency checkerboard anomalies in the discrete cosine transform (DCT) spectrum that do not occur in CMOS or CCD physical sensors.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-white text-sm">2. Specular Fresnel & Ray Geometry</h4>
            <p className="leading-relaxed text-slate-400">
              Real photons reflect off curved surfaces (eyes, water, chrome) in strict adherence to Snell's law and Fresnel equations. AI generators regularly produce mismatched corneal reflections.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-white text-sm">3. Error Level Analysis (ELA)</h4>
            <p className="leading-relaxed text-slate-400">
              Re-compressing the image isolates localized differences in compression tolerances. Real captures compress uniformly, whereas inpainting or composite edits flare with distinct delta intensities.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
