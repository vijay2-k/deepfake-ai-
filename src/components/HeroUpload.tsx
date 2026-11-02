import React, { useState, useRef, DragEvent, ChangeEvent } from 'react';
import {
  UploadCloud,
  FileImage,
  X,
  RefreshCw,
  Scan,
  ShieldAlert,
  Sparkles,
  Zap,
  Info,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { SampleImageItem } from '../data/sampleImages';

interface HeroUploadProps {
  onAnalyze: (fileData: { base64: string; mimeType: string; name: string; size: number }) => void;
  isAnalyzing: boolean;
  onSelectSample: (sample: SampleImageItem) => void;
  samples: SampleImageItem[];
  error: string | null;
  onClearError: () => void;
}

const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export const HeroUpload: React.FC<HeroUploadProps> = ({
  onAnalyze,
  isAnalyzing,
  onSelectSample,
  samples,
  error,
  onClearError,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<{
    base64: string;
    mimeType: string;
    name: string;
    size: number;
    previewUrl: string;
    dimensions?: { width: number; height: number };
  } | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [analysisStepIndex, setAnalysisStepIndex] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Loading steps animation
  const analysisSteps = [
    'Decoding image stream & extracting hardware EXIF header...',
    'Performing pixel variance & frequency spectrum analysis...',
    'Synthesizing Error Level Analysis (ELA) delta map...',
    'Scrutinizing diffusion latent markers & specular physics...',
    'Finalizing explainable AI forensic docket & calibrated score...',
  ];

  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAnalyzing) {
      setAnalysisStepIndex(0);
      interval = setInterval(() => {
        setAnalysisStepIndex((prev) => (prev < analysisSteps.length - 1 ? prev + 1 : prev));
      }, 1600);
    }
    return () => clearInterval(interval);
  }, [isAnalyzing]);

  const processFile = (file: File) => {
    setValidationError(null);
    onClearError();

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setValidationError('Unsupported format. Please upload JPG, JPEG, PNG, or WEBP.');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setValidationError('File size exceeds the 15MB threshold.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      const img = new Image();
      img.onload = () => {
        setSelectedFile({
          base64,
          mimeType: file.type,
          name: file.name,
          size: file.size,
          previewUrl: base64,
          dimensions: { width: img.naturalWidth, height: img.naturalHeight },
        });
      };
      img.src = base64;
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleRemove = () => {
    setSelectedFile(null);
    setValidationError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleTriggerAnalyze = () => {
    if (!selectedFile) return;
    onAnalyze({
      base64: selectedFile.base64,
      mimeType: selectedFile.mimeType,
      name: selectedFile.name,
      size: selectedFile.size,
    });
  };

  return (
    <div className="w-full">
      {/* Hero Headline Section */}
      <div className="text-center max-w-3xl mx-auto pt-6 pb-8 px-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-violet-500/10 via-indigo-500/10 to-cyan-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-4 backdrop-blur-sm">
          <Zap className="w-3.5 h-3.5 text-cyan-400" />
          <span>Multimodal Forensic Vision • Zero Synthetic Hallucination</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-4 leading-tight">
          Is This Image <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">Real</span> or <span className="bg-gradient-to-r from-rose-400 via-orange-400 to-amber-400 bg-clip-text text-transparent">AI Generated</span>?
        </h1>
        <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto">
          Detect AI-generated images using advanced image forensics and AI-powered analysis. Unmask Midjourney, DALL-E, Stable Diffusion, and Flux artifacts with calibrated confidence.
        </p>
      </div>

      {/* Main Upload / Inspector Card */}
      <div className="max-w-4xl mx-auto px-4">
        <div className="relative bg-slate-900/90 rounded-2xl border border-slate-800 shadow-2xl backdrop-blur-xl overflow-hidden p-6 sm:p-8">
          {/* Subtle Ambient Radial Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-indigo-500/10 blur-3xl pointer-events-none rounded-full" />

          {/* Validation or API Error Banner */}
          {(validationError || error) && (
            <div className="mb-6 p-4 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs flex items-start justify-between gap-3 animate-fade-in">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{validationError || error}</span>
              </div>
              <button
                onClick={() => {
                  setValidationError(null);
                  onClearError();
                }}
                className="text-rose-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Loading Animation Overlay */}
          {isAnalyzing ? (
            <div className="py-16 px-4 flex flex-col items-center justify-center text-center">
              <div className="relative w-28 h-28 mb-8 flex items-center justify-center">
                {/* Radar sweep ring */}
                <div className="absolute inset-0 rounded-full border-2 border-indigo-500/20 animate-ping" />
                <div className="absolute inset-2 rounded-full border border-cyan-400/30 animate-pulse" />
                <div className="absolute inset-0 rounded-full border-t-2 border-r-2 border-indigo-400 animate-spin" />
                <div className="w-16 h-16 rounded-full bg-slate-950 flex items-center justify-center border border-indigo-500/40 shadow-inner shadow-indigo-500/20">
                  <Scan className="w-8 h-8 text-cyan-400 animate-pulse" />
                </div>
              </div>

              <div className="space-y-2 max-w-md">
                <div className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Forensic Pass {analysisStepIndex + 1} of {analysisSteps.length}
                </div>
                <h3 className="text-lg font-bold text-white tracking-tight">
                  Analyzing Image Authenticity...
                </h3>
                <p className="text-xs text-slate-300 font-mono min-h-[36px] transition-all">
                  {analysisSteps[analysisStepIndex]}
                </p>
              </div>

              {/* Progress bar */}
              <div className="w-full max-w-md bg-slate-800/80 rounded-full h-1.5 mt-6 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-violet-500 via-indigo-500 to-cyan-400 h-1.5 transition-all duration-700 rounded-full"
                  style={{ width: `${((analysisStepIndex + 1) / analysisSteps.length) * 100}%` }}
                />
              </div>

              <p className="text-[11px] text-slate-500 mt-4 flex items-center gap-1.5">
                <Lock className="w-3 h-3 text-emerald-400" />
                Secure server-side processing via Gemini 3.8 Flash Vision Engine
              </p>
            </div>
          ) : selectedFile ? (
            /* Image Preview State (Before Analysis) */
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row gap-6 items-center">
                {/* Preview Thumbnail Container */}
                <div className="relative w-full md:w-1/2 aspect-square max-h-[380px] bg-slate-950 rounded-xl border border-slate-800 overflow-hidden flex items-center justify-center group shadow-inner">
                  <img
                    src={selectedFile.previewUrl}
                    alt="Upload Preview"
                    className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute top-3 right-3 flex items-center gap-1.5">
                    <button
                      onClick={handleRemove}
                      className="p-1.5 rounded-lg bg-slate-900/80 hover:bg-rose-950 text-slate-400 hover:text-rose-300 border border-slate-700 transition-colors"
                      title="Remove image"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded bg-slate-950/80 border border-slate-800 text-[10px] text-slate-300 font-mono backdrop-blur-sm">
                    {selectedFile.dimensions?.width} × {selectedFile.dimensions?.height} px
                  </div>
                </div>

                {/* File Details & Action Panel */}
                <div className="w-full md:w-1/2 flex flex-col justify-between space-y-5">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded border border-indigo-500/20">
                      Ready for Deep Analysis
                    </span>
                    <h3 className="text-xl font-bold text-white mt-2 truncate" title={selectedFile.name}>
                      {selectedFile.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Target payload verified. Click below to begin forensic examination.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                      <div className="text-[10px] text-slate-500 uppercase font-semibold">File Size</div>
                      <div className="font-semibold text-slate-200 mt-0.5">
                        {(selectedFile.size / 1024).toFixed(1)} KB
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                      <div className="text-[10px] text-slate-500 uppercase font-semibold">MIME Type</div>
                      <div className="font-semibold text-slate-200 mt-0.5">{selectedFile.mimeType}</div>
                    </div>
                  </div>

                  <div className="space-y-3 pt-2">
                    <button
                      onClick={handleTriggerAnalyze}
                      className="w-full py-3.5 px-6 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 group cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4 text-cyan-300 group-hover:rotate-12 transition-transform" />
                      <span>Analyze Image Authenticity</span>
                    </button>

                    <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="hover:text-white flex items-center gap-1.5 transition-colors"
                      >
                        <RefreshCw className="w-3.5 h-3.5 text-indigo-400" />
                        Replace with another image
                      </button>
                      <button
                        onClick={handleRemove}
                        className="hover:text-rose-400 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Idle Drag & Drop Area */
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-200 ${
                dragActive
                  ? 'border-indigo-400 bg-indigo-950/20 scale-[1.01]'
                  : 'border-slate-700/80 hover:border-indigo-500/60 bg-slate-950/40 hover:bg-slate-950/60'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.webp"
                onChange={handleChange}
                className="hidden"
              />

              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-lg shadow-indigo-500/10 group-hover:scale-110 transition-transform">
                  <UploadCloud className="w-8 h-8 text-indigo-400" />
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-lg font-bold text-white">
                    Drag and drop your image here, or{' '}
                    <span className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">
                      browse device
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Supports high-resolution forensic analysis for portraits, landscapes, artwork, and macros.
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                  <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                    JPG / JPEG
                  </span>
                  <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                    PNG
                  </span>
                  <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                    WEBP
                  </span>
                  <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-indigo-950/60 text-indigo-300 border border-indigo-800/40">
                    Max file size: 15 MB
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Sample Selector Bar */}
        {!selectedFile && !isAnalyzing && (
          <div className="mt-8 pt-6 border-t border-slate-800/80">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Or Test with Curated Specimens
                </h4>
              </div>
              <span className="text-[11px] text-slate-500">Instant one-click benchmark</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {samples.map((sample) => (
                <div
                  key={sample.id}
                  onClick={() => onSelectSample(sample)}
                  className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-indigo-500/50 hover:bg-slate-900 cursor-pointer transition-all flex flex-col justify-between group"
                >
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-slate-950 overflow-hidden shrink-0 border border-slate-800 flex items-center justify-center">
                      <img
                        src={sample.dataUrl}
                        alt={sample.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white truncate">{sample.title}</div>
                      <div className="text-[10px] text-slate-400">{sample.category}</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800/50">
                    <span>Expected: {sample.expectedVerdict.replace('Likely ', '')}</span>
                    <span className="text-indigo-400 font-semibold group-hover:translate-x-0.5 transition-transform">
                      Test →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Informative Privacy & Trust Pillars */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/60">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-3">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-white mb-1">Empirical Vision Forensics</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              No simulated or randomized results. Powered by server-side Gemini 3.8 Flash multi-modal vision with optical physics reasoning.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/60">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-3">
              <Lock className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-white mb-1">Encrypted & Confidential</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Your images are processed securely through isolated backend proxy routes. API credentials remain strictly safeguarded on the server.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/60">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-3">
              <Info className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-white mb-1">Scientific Calibration</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Distinguishes hard physical indicators from compression noise. Inconclusive verdicts are supported when evidence is ambiguous.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
