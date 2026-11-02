import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  Bot,
  Camera,
  Copy,
  Check,
  Download,
  RotateCcw,
  Maximize2,
  ZoomIn,
  Eye,
  Sliders,
  Sparkles,
  Info,
  Layers,
  Cpu,
  FileText,
  HelpCircle,
  Hash,
} from 'lucide-react';
import { DetectionResult, VisualArtifact } from '../types/detector';
import {
  generateErrorLevelAnalysis,
  generateSobelEdgeMap,
  computeSHA256,
  printForensicReport,
} from '../utils/forensicAnalysis';

interface DetectionResultViewProps {
  result: DetectionResult;
  onReset: () => void;
}

export const DetectionResultView: React.FC<DetectionResultViewProps> = ({ result, onReset }) => {
  const [activeTab, setActiveTab] = useState<'explain' | 'artifacts' | 'physics' | 'metadata' | 'limitations'>('explain');
  const [viewMode, setViewMode] = useState<'original' | 'ela' | 'sobel' | 'split'>('original');
  const [elaImageUrl, setElaImageUrl] = useState<string | null>(null);
  const [sobelImageUrl, setSobelImageUrl] = useState<string | null>(null);
  const [sha256, setSha256] = useState<string>('Computing digest...');
  const [copied, setCopied] = useState(false);
  const [splitPos, setSplitPos] = useState(50);
  const [isProcessingForensicMaps, setIsProcessingForensicMaps] = useState(true);
  const [selectedArtifact, setSelectedArtifact] = useState<VisualArtifact | null>(null);

  const imgRef = useRef<HTMLImageElement>(null);

  const isAI = result.detection_result === 'Likely AI Generated';
  const isReal = result.detection_result === 'Likely Real Photograph';
  const isInconclusive = result.detection_result === 'Inconclusive';

  // Compute SHA-256 and forensic maps when image loads
  useEffect(() => {
    let isMounted = true;

    async function processMaps() {
      try {
        setIsProcessingForensicMaps(true);
        const hash = await computeSHA256(result.image_url);
        if (isMounted) setSha256(hash);

        // Wait for image element to load if needed
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = async () => {
          try {
            const [ela, sobel] = await Promise.all([
              generateErrorLevelAnalysis(img),
              generateSobelEdgeMap(img),
            ]);
            if (isMounted) {
              setElaImageUrl(ela);
              setSobelImageUrl(sobel);
              setIsProcessingForensicMaps(false);
            }
          } catch (e) {
            console.error('Forensic map calculation error', e);
            if (isMounted) setIsProcessingForensicMaps(false);
          }
        };
        img.onerror = () => {
          if (isMounted) setIsProcessingForensicMaps(false);
        };
        img.src = result.image_url;
      } catch (err) {
        console.error('Error generating hash', err);
        if (isMounted) setIsProcessingForensicMaps(false);
      }
    }

    processMaps();
    return () => {
      isMounted = false;
    };
  }, [result]);

  const handleCopySummary = () => {
    const text = `VeritasAI Authenticity Forensic Report
Target: ${result.image_name}
Verdict: ${result.detection_result} (Confidence: ${result.confidence_score}%)
Breakdown: ${result.analysis_details.ai_probability}% AI Probability | ${result.analysis_details.human_probability}% Photographic Likelihood
Summary: ${result.analysis_details.explainable_summary}
Hash: ${sha256}
Generated on: ${new Date(result.created_at).toUTCString()}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadDossier = () => {
    printForensicReport(result, sha256);
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8 space-y-8 animate-fade-in">
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <button
            onClick={onReset}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Analyze Another Image
          </button>
          <span className="text-xs text-slate-500 font-mono hidden sm:inline">
            Case Ref: #{result.id.slice(0, 14)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopySummary}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-indigo-500/50 text-xs font-semibold text-slate-300 hover:text-white transition-all cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied to Clipboard' : 'Copy Summary'}</span>
          </button>

          <button
            onClick={handleDownloadDossier}
            className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download PDF Dossier</span>
          </button>
        </div>
      </div>

      {/* Main Verdict Grand Banner */}
      <div
        className={`relative rounded-2xl border p-6 sm:p-8 overflow-hidden shadow-2xl transition-all ${
          isAI
            ? 'bg-gradient-to-br from-rose-950/80 via-slate-900 to-slate-950 border-rose-500/40'
            : isReal
            ? 'bg-gradient-to-br from-emerald-950/80 via-slate-900 to-slate-950 border-emerald-500/40'
            : 'bg-gradient-to-br from-amber-950/80 via-slate-900 to-slate-950 border-amber-500/40'
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-950/60 border border-white/10 backdrop-blur-md">
              {isAI && <Bot className="w-3.5 h-3.5 text-rose-400" />}
              {isReal && <Camera className="w-3.5 h-3.5 text-emerald-400" />}
              {isInconclusive && <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />}
              <span
                className={
                  isAI
                    ? 'text-rose-400'
                    : isReal
                    ? 'text-emerald-400'
                    : 'text-amber-400'
                }
              >
                Forensic Classification Result
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              {result.detection_result}
            </h2>

            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              {result.analysis_details.explainable_summary}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1 font-mono">
              <span>File: {result.image_name}</span>
              <span>•</span>
              <span>Engine: {result.model_name}</span>
              <span>•</span>
              <span>Time: {new Date(result.created_at).toLocaleTimeString()}</span>
            </div>
          </div>

          {/* Calibrated Confidence Dial */}
          <div className="shrink-0 flex flex-col items-center justify-center p-5 rounded-2xl bg-slate-950/70 border border-slate-800 shadow-xl min-w-[220px]">
            <div className="relative w-28 h-28 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="rgba(51, 65, 85, 0.4)"
                  strokeWidth="8"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke={isAI ? '#f43f5e' : isReal ? '#10b981' : '#f59e0b'}
                  strokeWidth="8"
                  strokeDasharray={`${(result.confidence_score / 100) * 251.2} 251.2`}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-black text-white">{result.confidence_score}%</span>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  Confidence
                </span>
              </div>
            </div>

            <div className="w-full mt-4 space-y-1.5 text-[11px]">
              <div className="flex justify-between text-slate-300">
                <span>AI Likelihood:</span>
                <span className="font-bold text-rose-400">
                  {result.analysis_details.ai_probability}%
                </span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Authentic Likelihood:</span>
                <span className="font-bold text-emerald-400">
                  {result.analysis_details.human_probability}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Forensics Inspector Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Image & Forensic Maps Viewer (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 shadow-xl">
            {/* Viewer Controls */}
            <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-800">
              <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800/80 text-xs">
                <button
                  onClick={() => setViewMode('original')}
                  className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                    viewMode === 'original'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Original
                </button>
                <button
                  onClick={() => setViewMode('ela')}
                  className={`px-3 py-1 rounded-lg font-semibold transition-all flex items-center gap-1 ${
                    viewMode === 'ela'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Layers className="w-3 h-3" />
                  ELA Heatmap
                </button>
                <button
                  onClick={() => setViewMode('sobel')}
                  className={`px-3 py-1 rounded-lg font-semibold transition-all flex items-center gap-1 ${
                    viewMode === 'sobel'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Sliders className="w-3 h-3" />
                  Frequency Sobel
                </button>
                <button
                  onClick={() => setViewMode('split')}
                  className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                    viewMode === 'split'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Split Compare
                </button>
              </div>

              {isProcessingForensicMaps && (
                <span className="text-[10px] text-indigo-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping" />
                  Calculating ELA...
                </span>
              )}
            </div>

            {/* Display Canvas Container */}
            <div className="relative w-full aspect-square max-h-[500px] bg-slate-950 rounded-xl overflow-hidden flex items-center justify-center select-none border border-slate-800">
              {viewMode === 'original' && (
                <div className="relative w-full h-full flex items-center justify-center">
                  <img
                    ref={imgRef}
                    src={result.image_url}
                    alt={result.image_name}
                    className="max-h-full max-w-full object-contain"
                  />
                  {/* Overlay Flagged Artifact Boxes */}
                  {result.analysis_details.visual_artifacts.map((art, idx) => {
                    if (!art.coordinates) return null;
                    const isSelected = selectedArtifact === art;
                    return (
                      <div
                        key={idx}
                        onClick={() => setSelectedArtifact(art)}
                        style={{
                          left: `${art.coordinates.x}%`,
                          top: `${art.coordinates.y}%`,
                          width: `${art.coordinates.width}%`,
                          height: `${art.coordinates.height}%`,
                        }}
                        className={`absolute border-2 rounded transition-all cursor-pointer ${
                          isSelected
                            ? 'border-cyan-400 bg-cyan-400/20 scale-105 z-20 shadow-lg shadow-cyan-500/50'
                            : art.severity === 'high'
                            ? 'border-rose-500 bg-rose-500/10 hover:border-rose-400'
                            : 'border-amber-500 bg-amber-500/10 hover:border-amber-400'
                        }`}
                        title={`${art.area}: ${art.finding}`}
                      >
                        <span className="absolute -top-5 left-0 px-1 py-0.2 rounded text-[9px] font-bold bg-slate-950/90 text-white border border-slate-700 whitespace-nowrap">
                          {art.area}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              {viewMode === 'ela' && (
                <div className="w-full h-full flex items-center justify-center relative">
                  {elaImageUrl ? (
                    <img
                      src={elaImageUrl}
                      alt="Error Level Analysis"
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <div className="text-xs text-slate-400">Rendering Error Level Analysis...</div>
                  )}
                  <div className="absolute bottom-2 left-2 px-2 py-1 rounded bg-slate-950/80 text-[10px] text-cyan-300 border border-slate-800 font-mono">
                    ELA 95% JPEG Delta Map (22x Amp)
                  </div>
                </div>
              )}

              {viewMode === 'sobel' && (
                <div className="w-full h-full flex items-center justify-center relative">
                  {sobelImageUrl ? (
                    <img
                      src={sobelImageUrl}
                      alt="Sobel Edge Frequency"
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <div className="text-xs text-slate-400">Rendering Sobel Edge Map...</div>
                  )}
                  <div className="absolute bottom-2 left-2 px-2 py-1 rounded bg-slate-950/80 text-[10px] text-indigo-300 border border-slate-800 font-mono">
                    High-Frequency Spatial Gradient
                  </div>
                </div>
              )}

              {viewMode === 'split' && (
                <div className="relative w-full h-full overflow-hidden flex items-center justify-center">
                  <img
                    src={result.image_url}
                    alt="Original"
                    className="absolute inset-0 w-full h-full object-contain"
                  />
                  {elaImageUrl && (
                    <div
                      className="absolute inset-0 overflow-hidden"
                      style={{ width: `${splitPos}%`, borderRight: '2px solid #38bdf8' }}
                    >
                      <img
                        src={elaImageUrl}
                        alt="ELA"
                        className="w-full h-full object-contain"
                        style={{ width: `${100 / (splitPos / 100)}%`, maxWidth: 'none' }}
                      />
                    </div>
                  )}
                  <div className="absolute bottom-2 inset-x-4 flex items-center gap-2 bg-slate-950/80 p-2 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-400 whitespace-nowrap">ELA</span>
                    <input
                      type="range"
                      min="5"
                      max="95"
                      value={splitPos}
                      onChange={(e) => setSplitPos(Number(e.target.value))}
                      className="w-full accent-cyan-400 h-1"
                    />
                    <span className="text-[10px] text-slate-400 whitespace-nowrap">Original</span>
                  </div>
                </div>
              )}
            </div>

            {/* Cryptographic Hash Bar */}
            <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono overflow-x-auto">
              <div className="flex items-center gap-1.5 shrink-0">
                <Hash className="w-3.5 h-3.5 text-indigo-400" />
                <span>SHA-256:</span>
              </div>
              <span className="truncate ml-2 text-slate-300" title={sha256}>
                {sha256}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Detailed Scientific Breakdown Tabs (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-xl">
            {/* Nav Tabs */}
            <div className="flex items-center gap-1 border-b border-slate-800 pb-3 overflow-x-auto">
              <button
                onClick={() => setActiveTab('explain')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                  activeTab === 'explain'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                Explainable AI
              </button>
              <button
                onClick={() => setActiveTab('artifacts')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1 ${
                  activeTab === 'artifacts'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                Artifacts ({result.analysis_details.visual_artifacts.length})
              </button>
              <button
                onClick={() => setActiveTab('physics')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                  activeTab === 'physics'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                Physics & Optics
              </button>
              <button
                onClick={() => setActiveTab('metadata')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                  activeTab === 'metadata'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                EXIF / Hardware
              </button>
              <button
                onClick={() => setActiveTab('limitations')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                  activeTab === 'limitations'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                Safety & Limits
              </button>
            </div>

            {/* Tab Contents */}
            <div className="pt-4 min-h-[360px]">
              {/* Tab 1: Explainable AI */}
              {activeTab === 'explain' && (
                <div className="space-y-4">
                  <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
                    <h4 className="text-xs font-bold text-white mb-1.5 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                      Why We Think This Image Is {isAI ? 'AI Generated' : isReal ? 'a Real Photograph' : 'Inconclusive'}
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {result.analysis_details.explainable_summary}
                    </p>
                  </div>

                  {/* Supporting Reasons */}
                  <div className="space-y-2">
                    <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Identified Empirical Observations
                    </h5>
                    <div className="space-y-1.5">
                      {result.analysis_details.supporting_reasons.map((reason, i) => (
                        <div
                          key={i}
                          className="p-2.5 rounded-lg bg-slate-950/40 border border-slate-800/80 text-xs text-slate-200 flex items-start gap-2"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                          <span>{reason}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Counter Factors / Uncertainty */}
                  {result.analysis_details.counter_factors_or_uncertainty?.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-slate-800">
                      <h5 className="text-[11px] font-bold text-amber-400/80 uppercase tracking-wider flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-amber-400" />
                        Factors Introducing Uncertainty
                      </h5>
                      <div className="space-y-1.5">
                        {result.analysis_details.counter_factors_or_uncertainty.map((factor, i) => (
                          <div
                            key={i}
                            className="p-2.5 rounded-lg bg-amber-950/20 border border-amber-900/40 text-xs text-amber-200/90 flex items-start gap-2"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                            <span>{factor}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: Visual Artifacts */}
              {activeTab === 'artifacts' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Flagged Visual Anomalies</span>
                    <span>Click on region to highlight</span>
                  </div>

                  {result.analysis_details.visual_artifacts.length === 0 ? (
                    <div className="p-8 text-center text-xs text-slate-500 bg-slate-950/40 rounded-xl border border-slate-800">
                      No synthetic diffusion anomalies detected. Features adhere to physical sensor parameters.
                    </div>
                  ) : (
                    <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
                      {result.analysis_details.visual_artifacts.map((art, idx) => {
                        const isSelected = selectedArtifact === art;
                        return (
                          <div
                            key={idx}
                            onClick={() => setSelectedArtifact(isSelected ? null : art)}
                            className={`p-3 rounded-xl border transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-indigo-950/40 border-cyan-400 shadow-md'
                                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-bold text-white">{art.area}</span>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                                  art.severity === 'high'
                                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                }`}
                              >
                                {art.severity} severity
                              </span>
                            </div>
                            <p className="text-xs text-slate-300 leading-normal">{art.finding}</p>
                            <div className="mt-2 text-[10px] text-slate-500 uppercase font-mono">
                              Type: {art.type}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Tab 3: Physics & Optics */}
              {activeTab === 'physics' && (
                <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-indigo-400">
                      Lighting & Specular Physics
                    </span>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {result.analysis_details.lighting_and_shadow_assessment}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-indigo-400">
                      Micro-Textures & Epidermal Surfaces
                    </span>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {result.analysis_details.texture_and_skin_assessment}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-indigo-400">
                      Anatomical & Geometric Coherence
                    </span>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {result.analysis_details.anatomical_and_geometric_coherence}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-indigo-400">
                      Compression & Pixel-Level Anomaly
                    </span>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {result.analysis_details.compression_and_pixel_anomalies}
                    </p>
                  </div>
                </div>
              )}

              {/* Tab 4: EXIF / Metadata */}
              {activeTab === 'metadata' && (
                <div className="space-y-4">
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Camera className="w-3.5 h-3.5 text-indigo-400" />
                        EXIF & Hardware Signature
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          result.analysis_details.metadata.hasExif
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {result.analysis_details.metadata.hasExif ? 'EXIF Detected' : 'No Hardware EXIF'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {result.analysis_details.metadata.assessmentNote}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                      <div className="text-[10px] text-slate-500">Camera Make</div>
                      <div className="text-slate-200 truncate">
                        {result.analysis_details.metadata.make || 'N/A'}
                      </div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                      <div className="text-[10px] text-slate-500">Camera Model</div>
                      <div className="text-slate-200 truncate">
                        {result.analysis_details.metadata.model || 'N/A'}
                      </div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                      <div className="text-[10px] text-slate-500">Lens Profile</div>
                      <div className="text-slate-200 truncate">
                        {result.analysis_details.metadata.lensModel || 'N/A'}
                      </div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                      <div className="text-[10px] text-slate-500">Aperture / Shutter</div>
                      <div className="text-slate-200 truncate">
                        {result.analysis_details.metadata.fNumber || 'N/A'} • {result.analysis_details.metadata.exposureTime || 'N/A'}
                      </div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                      <div className="text-[10px] text-slate-500">ISO Sensitivity</div>
                      <div className="text-slate-200 truncate">
                        {result.analysis_details.metadata.iso ? `ISO ${result.analysis_details.metadata.iso}` : 'N/A'}
                      </div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                      <div className="text-[10px] text-slate-500">Embedded Software</div>
                      <div className="text-slate-200 truncate">
                        {result.analysis_details.metadata.software || 'None'}
                      </div>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 italic">
                    * Forensic Principle: Absence of EXIF metadata is never treated as proof of generative AI, as web compression and social networks routinely strip EXIF blocks.
                  </p>
                </div>
              )}

              {/* Tab 5: Limitations */}
              {activeTab === 'limitations' && (
                <div className="space-y-4">
                  <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-900/40 text-xs text-amber-200/90 leading-relaxed">
                    <div className="font-bold flex items-center gap-1.5 mb-1.5 text-amber-300">
                      <AlertTriangle className="w-4 h-4" />
                      Forensic Accuracy & Safety Protocol
                    </div>
                    {result.analysis_details.detection_limitations}
                  </div>

                  <div className="space-y-2 text-xs text-slate-400">
                    <h5 className="font-bold text-slate-300">Best Practices for Verification:</h5>
                    <ul className="list-disc pl-4 space-y-1">
                      <li>Never base legal, disciplinary, or published determinations on a single automated detector.</li>
                      <li>Heavily compressed JPEGs (WhatsApp, Twitter/X, Instagram) suffer from blocking artifacts that mimic or obscure diffusion noise.</li>
                      <li>Cross-reference with original uncompressed RAW or high-resolution camera files whenever available.</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
