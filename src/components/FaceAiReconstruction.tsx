import React, { useState, useEffect, useRef } from 'react';
import { RotateCcw, CheckCircle2, ShieldCheck, Sparkles, Activity, Layers } from 'lucide-react';

export type ReconstructionStage =
  | 'initializing'
  | 'scanning'
  | 'constructing'
  | 'complete_face'
  | 'holographic_split';

interface FaceAiReconstructionProps {
  mode?: 'hero' | 'demo' | 'compact';
  autoStart?: boolean;
  onStageChange?: (stage: ReconstructionStage) => void;
  className?: string;
}

const ANATOMICAL_STEPS = [
  { id: 'forehead', label: '1. HEAD & FOREHEAD OUTLINE', yStart: 0, yEnd: 18, color: '#00E5FF' },
  { id: 'hairline', label: '2. HAIRLINE & HAIRSTYLE', yStart: 18, yEnd: 28, color: '#7B2BFF' },
  { id: 'eyes', label: '3. EYEBROWS & EYES (SYMMETRIC)', yStart: 28, yEnd: 42, color: '#00E5FF' },
  { id: 'nose', label: '4. NOSE & NASAL ARCHITECTURE', yStart: 42, yEnd: 56, color: '#8B32FF' },
  { id: 'cheeks', label: '5. CHEEKS & FACIAL CONTOURS', yStart: 56, yEnd: 68, color: '#00E5FF' },
  { id: 'mouth', label: '6. LIPS & ORAL GEOMETRY', yStart: 68, yEnd: 78, color: '#7B2BFF' },
  { id: 'jawline', label: '7. CHIN & MANDIBULAR JAWLINE', yStart: 78, yEnd: 88, color: '#00E5FF' },
  { id: 'details', label: '8. EARS, NECK & FINE DETAILS', yStart: 88, yEnd: 100, color: '#8B32FF' },
];

export const FaceAiReconstruction: React.FC<FaceAiReconstructionProps> = ({
  mode = 'hero',
  autoStart = true,
  onStageChange,
  className = '',
}) => {
  const [stage, setStage] = useState<ReconstructionStage>('initializing');
  const [scanProgress, setScanProgress] = useState<number>(0);
  const [constructProgress, setConstructProgress] = useState<number>(0);
  const [splitProgress, setSplitProgress] = useState<number>(0);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const animIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Notify parent of stage change
  useEffect(() => {
    if (onStageChange) {
      onStageChange(stage);
    }
  }, [stage, onStageChange]);

  const clearTimers = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (animIntervalRef.current) clearInterval(animIntervalRef.current);
  };

  const startReconstructionSequence = () => {
    clearTimers();

    // Stage 1: Initializing (Dark empty facial silhouette, glowing outline)
    setStage('initializing');
    setScanProgress(0);
    setConstructProgress(0);
    setSplitProgress(0);
    setCurrentStepIndex(0);

    // After 1000ms: Begin Stage 2 (Digital Scanning 0% to 100%)
    timerRef.current = setTimeout(() => {
      setStage('scanning');
      let p = 0;
      animIntervalRef.current = setInterval(() => {
        p += 2.5;
        if (p >= 100) {
          clearInterval(animIntervalRef.current!);
          setScanProgress(100);

          // Begin Stage 3: Construct Face Part-by-Part (0% to 100%)
          timerRef.current = setTimeout(() => {
            setStage('constructing');
            let cp = 0;
            animIntervalRef.current = setInterval(() => {
              cp += 1.25; // Smooth progression (~2.8s total)
              if (cp >= 100) {
                clearInterval(animIntervalRef.current!);
                setConstructProgress(100);
                setCurrentStepIndex(ANATOMICAL_STEPS.length - 1);

                // Stage 4: Complete Realistic Human Face (held briefly for authenticity)
                setStage('complete_face');
                timerRef.current = setTimeout(() => {
                  // Stage 5: Holographic transformation on right half (50/50 split)
                  setStage('holographic_split');
                  let sp = 0;
                  animIntervalRef.current = setInterval(() => {
                    sp += 4;
                    if (sp >= 100) {
                      clearInterval(animIntervalRef.current!);
                      setSplitProgress(100);
                    } else {
                      setSplitProgress(sp);
                    }
                  }, 25);
                }, 1600); // 1.6s pause to admire the authentic photographic human face
              } else {
                setConstructProgress(cp);
                // Update anatomical step index
                const stepIdx = ANATOMICAL_STEPS.findIndex(
                  (s) => cp >= s.yStart && cp <= s.yEnd
                );
                if (stepIdx !== -1) {
                  setCurrentStepIndex(stepIdx);
                }
              }
            }, 35);
          }, 400);
        } else {
          setScanProgress(p);
        }
      }, 30);
    }, 1000);
  };

  useEffect(() => {
    if (autoStart) {
      startReconstructionSequence();
    }
    return () => clearTimers();
  }, [autoStart]);

  const currentAnatomicalStep = ANATOMICAL_STEPS[currentStepIndex] || ANATOMICAL_STEPS[0];

  return (
    <div
      className={`relative w-full h-full rounded-3xl overflow-hidden select-none bg-[#07091E] border border-[#8B32FF]/30 shadow-[0_20px_50px_rgba(85,21,216,0.22)] ${className}`}
    >
      {/* =========================================================================
          BACKGROUND AMBIENCE & DIGITAL PARTICLES
          ========================================================================= */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#090C22] via-[#0D1030] to-[#050616] pointer-events-none" />
      <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#00E5FF_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

      {/* =========================================================================
          STAGE 1: DARK EMPTY SILHOUETTE & SCANNING FRAME
          ========================================================================= */}
      <div
        className={`absolute inset-0 flex items-center justify-center transition-opacity duration-500 pointer-events-none ${
          stage === 'initializing' ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Silhouette head contour path */}
        <svg
          viewBox="0 0 200 260"
          className="w-48 sm:w-56 h-auto stroke-[#00E5FF]/40 fill-[#00E5FF]/5 animate-pulse"
        >
          {/* Anatomical head outline */}
          <path
            d="M100 20 C60 20, 35 55, 35 110 C35 155, 55 195, 75 220 L75 245 L125 245 L125 220 C145 195, 165 155, 165 110 C165 55, 140 20, 100 20 Z"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />
          {/* Facial axis crosshairs */}
          <line x1="100" y1="35" x2="100" y2="230" stroke="#00E5FF" strokeWidth="0.8" opacity="0.4" />
          <line x1="50" y1="110" x2="150" y2="110" stroke="#00E5FF" strokeWidth="0.8" opacity="0.4" />
          {/* Eye zone markers */}
          <circle cx="75" cy="110" r="8" stroke="#8B32FF" strokeWidth="1" fill="none" opacity="0.6" />
          <circle cx="125" cy="110" r="8" stroke="#8B32FF" strokeWidth="1" fill="none" opacity="0.6" />
        </svg>
      </div>

      {/* =========================================================================
          STAGE 2: DIGITAL SCANNING BEAM & PROGRESS GRID
          ========================================================================= */}
      {stage === 'scanning' && (
        <div className="absolute inset-0 pointer-events-none z-20">
          {/* Scanning Beam */}
          <div
            className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#00E5FF] to-transparent shadow-[0_0_20px_#00E5FF,0_0_40px_#8B32FF] transition-all ease-linear"
            style={{ top: `${scanProgress}%` }}
          >
            {/* Center laser point */}
            <div className="absolute left-1/2 -translate-x-1/2 -top-1 w-3 h-3 rounded-full bg-white shadow-[0_0_12px_#00E5FF]" />
            {/* Trailing scan veil */}
            <div className="absolute left-0 right-0 -top-12 h-12 bg-gradient-to-t from-[#00E5FF]/20 to-transparent pointer-events-none" />
          </div>

          {/* Grid points where beam travels */}
          <div
            className="absolute inset-0 overflow-hidden"
            style={{ clipPath: `inset(0 0 calc(100% - ${scanProgress}%) 0)` }}
          >
            <div className="w-full h-full bg-[radial-gradient(#00E5FF_1.5px,transparent_1.5px)] [background-size:20px_20px] opacity-40" />
          </div>
        </div>
      )}

      {/* =========================================================================
          STAGE 3 & 4: PHOTOGRAPHIC NATURAL HUMAN FACE (PROGRESSIVELY CONSTRUCTED)
          - Base is 100% genuine photographic portrait (undistorted, zero duplication)
          - Revealed progressively down the face in logical anatomical order
          ========================================================================= */}
      {(stage === 'constructing' || stage === 'complete_face' || stage === 'holographic_split') && (
        <div
          className="absolute inset-0 transition-all ease-linear"
          style={{
            clipPath:
              stage === 'constructing'
                ? `inset(0 0 calc(100% - ${constructProgress}%) 0)`
                : 'inset(0 0 0 0)',
          }}
        >
          {/* Layer 1: Pristine Photographic Natural Human Face */}
          <img
            src="/hero-face-natural.jpg"
            alt="Authentic Human Face"
            className="w-full h-full object-cover object-center select-none"
            draggable={false}
          />

          {/* Active Construction Laser & Target Bracket during Stage 3 */}
          {stage === 'constructing' && constructProgress < 100 && (
            <div
              className="absolute left-0 right-0 h-1 bg-gradient-to-r from-[#8B32FF] via-[#00E5FF] to-[#8B32FF] shadow-[0_0_25px_#00E5FF,0_0_50px_#8B32FF] z-30 pointer-events-none"
              style={{ top: `${constructProgress}%` }}
            >
              {/* Construction Edge Flare */}
              <div className="absolute left-1/2 -translate-x-1/2 -top-1.5 w-4 h-4 rounded-full bg-white shadow-[0_0_15px_#00E5FF] animate-pulse" />
              <div className="absolute left-6 -top-1 w-2 h-2 rounded-full bg-[#00E5FF]" />
              <div className="absolute right-6 -top-1 w-2 h-2 rounded-full bg-[#8B32FF]" />

              {/* Anatomical part floating label */}
              <div className="absolute right-3 -top-6 px-2 py-0.5 rounded-md bg-[#080A21]/90 border border-cyan-400/50 backdrop-blur-md shadow-lg text-[9px] font-mono text-cyan-300 font-bold uppercase tracking-wider flex items-center gap-1.5 whitespace-nowrap">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] animate-ping" />
                <span>{currentAnatomicalStep.label}</span>
              </div>
            </div>
          )}

          {/* Authentic verification pulse on complete_face */}
          {stage === 'complete_face' && (
            <div className="absolute inset-0 bg-[#00E5FF]/10 animate-pulse pointer-events-none border-2 border-[#00E5FF]/60 rounded-3xl" />
          )}
        </div>
      )}

      {/* =========================================================================
          STAGE 5: 3D HOLOGRAPHIC WIREFRAME MESH (RIGHT HALF, 50/50 SPLIT)
          ========================================================================= */}
      {stage === 'holographic_split' && (
        <div
          className="absolute inset-0 overflow-hidden transition-all ease-out z-20 pointer-events-none"
          style={{
            // Revealing from center (50%) to the right
            clipPath: `inset(0 0 0 calc(50% + (50% - ${splitProgress * 0.5}%)))`,
          }}
        >
          {/* Cyber-tinted base layer on right half */}
          <img
            src="/hero-face-cyber.jpg"
            alt="Holographic Face Reconstruction"
            className="w-full h-full object-cover object-center"
          />

          {/* Cyber deep-blue/violet holographic overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#0B0D2E]/50 to-[#100C38]/70 mix-blend-color-dodge pointer-events-none" />

          {/* SVG 3D Biometric Facet Wireframe & Landmark Points */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 300 400" preserveAspectRatio="none">
            <defs>
              <linearGradient id="cyberFacetGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00E5FF" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#8B32FF" stopOpacity="0.85" />
              </linearGradient>
            </defs>

            {/* Faceted wireframe geometric lines (right side only: x: 150 to 300) */}
            <g stroke="url(#cyberFacetGrad)" strokeWidth="0.9" fill="none" opacity="0.8">
              {/* Forehead facets */}
              <polygon points="150,70 185,60 220,75 180,95" strokeDasharray="2 2" />
              <polygon points="180,95 220,75 240,110 195,120" />
              
              {/* Right eye orbit & eyebrow */}
              <polygon points="165,135 195,125 225,135 195,145" />
              <polygon points="195,145 225,135 250,150 220,165" />
              <polygon points="165,135 195,145 185,170 160,165" />

              {/* Nose ridge & right cheek */}
              <polygon points="150,140 165,170 150,205" />
              <polygon points="165,170 205,185 240,195 210,225 175,215" />
              <polygon points="150,205 175,215 150,230" />

              {/* Cheeks to jawline */}
              <polygon points="210,225 245,235 235,275 195,270 175,245" />
              
              {/* Mouth & chin */}
              <polygon points="150,245 175,248 190,265 165,275 150,270" />
              <polygon points="150,270 165,275 185,295 150,305" />
              <polygon points="150,305 185,295 215,315 175,340 150,345" />
            </g>

            {/* Glowing biometric landmark nodes */}
            <g fill="#00E5FF">
              <circle cx="195" cy="140" r="3" className="animate-ping" style={{ animationDuration: '2.5s' }} />
              <circle cx="195" cy="140" r="2" />
              <circle cx="165" cy="135" r="2" fill="#8B32FF" />
              <circle cx="225" cy="135" r="2" />
              <circle cx="175" cy="215" r="2.5" fill="#00E5FF" />
              <circle cx="210" cy="225" r="2" fill="#8B32FF" />
              <circle cx="190" cy="265" r="2" fill="#00E5FF" />
              <circle cx="185" cy="295" r="2.5" fill="#8B32FF" />
              <circle cx="215" cy="315" r="2" fill="#00E5FF" />
            </g>
          </svg>

          {/* Floating Data Telemetry Stream on right margin */}
          <div className="absolute right-2 top-8 flex flex-col gap-1 pointer-events-none select-none">
            <span className="px-1.5 py-0.5 rounded text-[8px] font-mono bg-[#080A21]/90 border border-cyan-400/40 text-cyan-300">
              VERTICES: 3,420
            </span>
            <span className="px-1.5 py-0.5 rounded text-[8px] font-mono bg-[#080A21]/90 border border-purple-400/40 text-purple-300">
              VECTORS: 468
            </span>
            <span className="px-1.5 py-0.5 rounded text-[8px] font-mono bg-[#080A21]/90 border border-cyan-400/40 text-cyan-300">
              RESIDUAL: &lt;0.012
            </span>
          </div>

          {/* Vertical Glowing 50/50 Seam Divider Line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#8B32FF] via-[#00E5FF] to-[#8B32FF] shadow-[0_0_15px_#00E5FF,0_0_30px_#8B32FF]">
            <div className="absolute top-1/2 -translate-y-1/2 -left-1 w-2.5 h-2.5 rounded-full bg-white shadow-[0_0_10px_#00E5FF] animate-pulse" />
          </div>
        </div>
      )}

      {/* =========================================================================
          CORNER BRACKETS [ ... ] & BIOMETRIC SCANNING FRAME
          ========================================================================= */}
      <div className="absolute inset-4 sm:inset-5 pointer-events-none border border-cyan-400/25 rounded-2xl z-30">
        {/* Top-Left */}
        <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-[#8B32FF]" />
        {/* Top-Right */}
        <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-[#00E5FF]" />
        {/* Bottom-Left */}
        <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-[#8B32FF]" />
        {/* Bottom-Right */}
        <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-[#00E5FF]" />
      </div>

      {/* =========================================================================
          BOTTOM DYNAMIC STATUS BADGE & REPLAY TRIGGER
          ========================================================================= */}
      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between z-40 pointer-events-auto">
        {/* Status Pill */}
        <div className="px-3 py-1 rounded-full bg-[#080A21]/90 backdrop-blur-md border border-cyan-400/50 text-[10px] font-mono text-cyan-300 shadow-lg flex items-center gap-1.5 truncate">
          <span
            className={`w-1.5 h-1.5 rounded-full shrink-0 ${
              stage === 'complete_face'
                ? 'bg-emerald-400 animate-pulse'
                : stage === 'holographic_split'
                ? 'bg-cyan-400'
                : 'bg-[#00E5FF] animate-ping'
            }`}
          />
          <span className="truncate">
            {stage === 'initializing' && 'INITIALIZING FACIAL RECONSTRUCTION'}
            {stage === 'scanning' && `SCANNING TOPOLOGY (${Math.round(scanProgress)}%)`}
            {stage === 'constructing' &&
              `SYNTHESIZING: ${currentAnatomicalStep.label.split('.')[1] || 'ANATOMY'} (${Math.round(
                constructProgress
              )}%)`}
            {stage === 'complete_face' && 'AUTHENTIC HUMAN FACE (100%)'}
            {stage === 'holographic_split' && 'BIOMETRIC MESH ACTIVE (50/50 SPLIT)'}
          </span>
        </div>

        {/* Replay Button */}
        <button
          onClick={startReconstructionSequence}
          className="p-1.5 rounded-full bg-[#080A21]/90 hover:bg-[#8B32FF]/30 border border-cyan-400/40 hover:border-cyan-300 text-cyan-300 hover:text-white transition-all shadow-lg cursor-pointer group"
          title="Replay AI Facial Reconstruction Sequence"
        >
          <RotateCcw className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-500" />
        </button>
      </div>
    </div>
  );
};

