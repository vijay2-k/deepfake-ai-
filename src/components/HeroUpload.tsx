import React, { useState, useRef, DragEvent, ChangeEvent } from 'react';
import {
  UploadCloud,
  FileImage,
  Video,
  Mic,
  X,
  RefreshCw,
  Scan,
  ShieldAlert,
  Sparkles,
  Zap,
  Info,
  CheckCircle2,
  Lock,
  Film,
  Music,
} from 'lucide-react';
import { SampleImageItem } from '../data/sampleImages';
import { MediaType } from '../types/detector';

interface HeroUploadProps {
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
  onSelectSample: (sample: SampleImageItem) => void;
  samples: SampleImageItem[];
  error: string | null;
  onClearError: () => void;
}

const MAX_IMAGE_SIZE = 25 * 1024 * 1024; // 25MB
const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB
const MAX_AUDIO_SIZE = 50 * 1024 * 1024; // 50MB

export const HeroUpload: React.FC<HeroUploadProps> = ({
  onAnalyze,
  isAnalyzing,
  uploadProgress,
  onSelectSample,
  samples,
  error,
  onClearError,
}) => {
  const [mediaMode, setMediaMode] = useState<MediaType>('image');
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<{
    file?: File;
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

  // Loading steps per media mode
  const stepsByMode: Record<MediaType, string[]> = {
    image: [
      'Decoding image stream & extracting hardware EXIF header...',
      'Performing pixel variance & frequency spectrum analysis...',
      'Synthesizing Error Level Analysis (ELA) delta map...',
      'Scrutinizing diffusion latent markers & specular physics...',
      'Finalizing explainable AI forensic docket & calibrated score...',
    ],
    video: [
      'Uploading video binary payload to forensic server...',
      'Extracting video stream frames & temporal sequence...',
      'Analyzing inter-frame optical flow & facial landmark alignment...',
      'Inspecting lip-sync, eye blink frequency & temporal lighting...',
      'Scrutinizing neural video generator deepfake signatures...',
      'Finalizing video forensic report & suspicious frame index...',
    ],
    audio: [
      'Uploading audio binary payload to forensic server...',
      'Decoding audio waveform & short-time Fourier spectrum...',
      'Evaluating neural vocoder phase metallic artifacts...',
      'Analyzing vocal tract formant dynamics & prosodic pitch monotone...',
      'Inspecting breath pauses & acoustic room impulse response...',
      'Finalizing voice clone authenticity assessment...',
    ],
  };

  const currentSteps = stepsByMode[mediaMode];

  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAnalyzing) {
      setAnalysisStepIndex(0);
      interval = setInterval(() => {
        setAnalysisStepIndex((prev) => (prev < currentSteps.length - 1 ? prev + 1 : prev));
      }, 1800);
    }
    return () => clearInterval(interval);
  }, [isAnalyzing, mediaMode, currentSteps.length]);

  const handleSwitchMode = (mode: MediaType) => {
    if (mediaMode === mode) return;
    if (selectedFile?.previewUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(selectedFile.previewUrl);
    }
    setMediaMode(mode);
    setSelectedFile(null);
    setValidationError(null);
    onClearError();
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const processFile = (file: File) => {
    setValidationError(null);
    onClearError();

    const maxAllowed = mediaMode === 'video' ? MAX_VIDEO_SIZE : mediaMode === 'audio' ? MAX_AUDIO_SIZE : MAX_IMAGE_SIZE;
    const maxMb = Math.round(maxAllowed / (1024 * 1024));

    if (file.size > maxAllowed) {
      setValidationError(`File size exceeds the ${maxMb}MB limit for ${mediaMode} analysis.`);
      return;
    }

    if (mediaMode === 'image' && !file.type.startsWith('image/')) {
      setValidationError('Please upload a valid image file (JPG, PNG, WEBP).');
      return;
    }
    if (mediaMode === 'video' && !file.type.startsWith('video/') && !file.name.match(/\.(mp4|mov|avi|webm|mkv)$/i)) {
      setValidationError('Please upload a valid video file (MP4, MOV, AVI, WEBM, MKV).');
      return;
    }
    if (mediaMode === 'audio' && !file.type.startsWith('audio/') && !file.name.match(/\.(mp3|wav|m4a|aac|flac|ogg|webm)$/i)) {
      setValidationError('Please upload a valid audio file (MP3, WAV, M4A, AAC, FLAC, OGG).');
      return;
    }

    if (selectedFile?.previewUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(selectedFile.previewUrl);
    }

    const objectUrl = URL.createObjectURL(file);
    const mimeType = file.type || (mediaMode === 'video' ? 'video/mp4' : mediaMode === 'audio' ? 'audio/mp3' : 'image/jpeg');

    if (mediaMode === 'image') {
      const img = new Image();
      img.onload = () => {
        setSelectedFile({
          file,
          base64: '',
          mimeType,
          name: file.name,
          size: file.size,
          previewUrl: objectUrl,
          dimensions: { width: img.naturalWidth, height: img.naturalHeight },
        });
      };
      img.src = objectUrl;
    } else {
      setSelectedFile({
        file,
        base64: '',
        mimeType,
        name: file.name,
        size: file.size,
        previewUrl: objectUrl,
      });
    }
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
    if (selectedFile?.previewUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(selectedFile.previewUrl);
    }
    setSelectedFile(null);
    setValidationError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleTriggerAnalyze = () => {
    if (!selectedFile) return;

    if (selectedFile.file) {
      onAnalyze({
        file: selectedFile.file,
        base64: selectedFile.base64,
        mimeType: selectedFile.mimeType,
        name: selectedFile.name,
        size: selectedFile.size,
        mediaType: mediaMode,
      });
    } else {
      onAnalyze({
        base64: selectedFile.base64,
        mimeType: selectedFile.mimeType,
        name: selectedFile.name,
        size: selectedFile.size,
        mediaType: mediaMode,
      });
    }
  };

  const getAcceptAttribute = () => {
    if (mediaMode === 'image') return '.jpg,.jpeg,.png,.webp,image/*';
    if (mediaMode === 'video') return '.mp4,.mov,.avi,.webm,.mkv,video/*';
    return '.mp3,.wav,.m4a,.aac,.flac,.ogg,.webm,audio/*';
  };

  return (
    <div className="w-full">
      {/* Hero Headline Section */}
      <div className="text-center max-w-3xl mx-auto pt-6 pb-8 px-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-gradient-to-r from-violet-500/10 via-indigo-500/10 to-cyan-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-4 backdrop-blur-sm">
          <Zap className="w-3.5 h-3.5 text-cyan-400" />
          <span>Multimodal Forensic Vision & AI Voice Intelligence</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-4 leading-tight">
          Is This Media <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">Authentic</span> or <span className="bg-gradient-to-r from-rose-400 via-orange-400 to-amber-400 bg-clip-text text-transparent">AI Synthetic</span>?
        </h1>
        <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto">
          Examine Images, Deepfake Videos, and Voice Recordings with advanced optical physics, temporal coherence, and vocoder spectral analysis.
        </p>
      </div>

      {/* Main Upload / Inspector Card */}
      <div className="max-w-4xl mx-auto px-4">
        <div className="relative bg-slate-900/90 rounded-2xl border border-slate-800 shadow-2xl backdrop-blur-xl overflow-hidden p-6 sm:p-8">
          {/* Subtle Ambient Radial Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-indigo-500/10 blur-3xl pointer-events-none rounded-full" />

          {/* Prominent Three-Option Media Mode Switcher */}
          {!isAnalyzing && (
            <div className="flex items-center justify-center p-1.5 mb-8 rounded-xl bg-slate-950 border border-slate-800/80 gap-1.5 max-w-xl mx-auto shadow-inner">
              <button
                type="button"
                onClick={() => handleSwitchMode('image')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  mediaMode === 'image'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 border border-indigo-500/50'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <FileImage className="w-4 h-4 text-indigo-300" />
                <span>Image Detector</span>
              </button>

              <button
                type="button"
                onClick={() => handleSwitchMode('video')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  mediaMode === 'video'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 border border-indigo-500/50'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <Video className="w-4 h-4 text-cyan-300" />
                <span>Video Deepfake</span>
              </button>

              <button
                type="button"
                onClick={() => handleSwitchMode('audio')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  mediaMode === 'audio'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 border border-indigo-500/50'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <Mic className="w-4 h-4 text-violet-300" />
                <span>Voice Clone</span>
              </button>
            </div>
          )}

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
                <div className="absolute inset-0 rounded-full border-2 border-indigo-500/20 animate-ping" />
                <div className="absolute inset-2 rounded-full border border-cyan-400/30 animate-pulse" />
                <div className="absolute inset-0 rounded-full border-t-2 border-r-2 border-indigo-400 animate-spin" />
                <div className="w-16 h-16 rounded-full bg-slate-950 flex items-center justify-center border border-indigo-500/40 shadow-inner shadow-indigo-500/20">
                  <Scan className="w-8 h-8 text-cyan-400 animate-pulse" />
                </div>
              </div>

              <div className="space-y-2 max-w-md">
                <div className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {uploadProgress !== null && uploadProgress !== undefined && uploadProgress < 100
                    ? `Uploading Payload (${uploadProgress}%)`
                    : `Forensic Pass ${analysisStepIndex + 1} of ${currentSteps.length}`}
                </div>
                <h3 className="text-lg font-bold text-white tracking-tight">
                  {uploadProgress !== null && uploadProgress !== undefined && uploadProgress < 100
                    ? `Uploading ${mediaMode.toUpperCase()} File...`
                    : `Analyzing ${mediaMode.toUpperCase()} Authenticity...`}
                </h3>
                <p className="text-xs text-slate-300 font-mono min-h-[36px] transition-all">
                  {uploadProgress !== null && uploadProgress !== undefined && uploadProgress < 100
                    ? `Streaming binary file payload to backend server (${uploadProgress}%)...`
                    : currentSteps[analysisStepIndex]}
                </p>
              </div>

              {/* Progress bar */}
              <div className="w-full max-w-md bg-slate-800/80 rounded-full h-1.5 mt-6 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-violet-500 via-indigo-500 to-cyan-400 h-1.5 transition-all duration-300 rounded-full"
                  style={{
                    width:
                      uploadProgress !== null && uploadProgress !== undefined && uploadProgress < 100
                        ? `${uploadProgress}%`
                        : `${((analysisStepIndex + 1) / currentSteps.length) * 100}%`,
                  }}
                />
              </div>

              <p className="text-[11px] text-slate-500 mt-4 flex items-center gap-1.5">
                <Lock className="w-3 h-3 text-emerald-400" />
                Secure server-side processing via Gemini Multimodal Vision & Speech Engine
              </p>
            </div>
          ) : selectedFile ? (
            /* Media Preview State (Before Analysis) */
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row gap-6 items-center">
                {/* Preview Container per mode */}
                <div className="relative w-full md:w-1/2 aspect-square max-h-[380px] bg-slate-950 rounded-xl border border-slate-800 overflow-hidden flex flex-col items-center justify-center p-2 group shadow-inner">
                  {mediaMode === 'image' && (
                    <>
                      <img
                        src={selectedFile.previewUrl}
                        alt="Upload Preview"
                        className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
                      />
                      {selectedFile.dimensions && (
                        <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded bg-slate-950/80 border border-slate-800 text-[10px] text-slate-300 font-mono backdrop-blur-sm">
                          {selectedFile.dimensions.width} × {selectedFile.dimensions.height} px
                        </div>
                      )}
                    </>
                  )}

                  {mediaMode === 'video' && (
                    <div className="w-full h-full flex flex-col items-center justify-center relative">
                      <video
                        controls
                        src={selectedFile.previewUrl}
                        className="w-full max-h-[300px] rounded-lg bg-black object-contain"
                      />
                      <div className="absolute top-2 left-2 px-2 py-1 rounded bg-slate-950/80 border border-slate-800 text-[10px] text-cyan-300 font-semibold flex items-center gap-1">
                        <Film className="w-3 h-3" /> Video Stream Ready
                      </div>
                    </div>
                  )}

                  {mediaMode === 'audio' && (
                    <div className="w-full h-full flex flex-col items-center justify-center p-4 space-y-4">
                      <div className="w-16 h-16 rounded-full bg-violet-500/10 border border-violet-500/30 flex items-center justify-center text-violet-400">
                        <Music className="w-8 h-8 text-violet-400 animate-pulse" />
                      </div>
                      <div className="w-full">
                        <audio controls src={selectedFile.previewUrl} className="w-full rounded-lg" />
                      </div>
                      <div className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-[10px] text-violet-300 font-mono">
                        Acoustic Spectrum Stream
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handleRemove}
                    className="absolute top-3 right-3 p-1.5 rounded-lg bg-slate-900/80 hover:bg-rose-950 text-slate-400 hover:text-rose-300 border border-slate-700 transition-colors z-10"
                    title="Remove file"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* File Details & Action Panel */}
                <div className="w-full md:w-1/2 flex flex-col justify-between space-y-5">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded border border-indigo-500/20">
                      Target {mediaMode.toUpperCase()} Payload Verified
                    </span>
                    <h3 className="text-xl font-bold text-white mt-2 truncate" title={selectedFile.name}>
                      {selectedFile.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Ready for deep multi-modal forensic inspection.
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
                      <div className="font-semibold text-slate-200 mt-0.5 truncate" title={selectedFile.mimeType}>
                        {selectedFile.mimeType}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 pt-2">
                    <button
                      onClick={handleTriggerAnalyze}
                      className="w-full py-3.5 px-6 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 group cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4 text-cyan-300 group-hover:rotate-12 transition-transform" />
                      <span>Analyze {mediaMode.toUpperCase()} Authenticity</span>
                    </button>

                    <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="hover:text-white flex items-center gap-1.5 transition-colors"
                      >
                        <RefreshCw className="w-3.5 h-3.5 text-indigo-400" />
                        Replace file
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
                accept={getAcceptAttribute()}
                onChange={handleChange}
                className="hidden"
              />

              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-lg shadow-indigo-500/10 group-hover:scale-110 transition-transform">
                  {mediaMode === 'image' && <UploadCloud className="w-8 h-8 text-indigo-400" />}
                  {mediaMode === 'video' && <Video className="w-8 h-8 text-cyan-400" />}
                  {mediaMode === 'audio' && <Mic className="w-8 h-8 text-violet-400" />}
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-lg font-bold text-white">
                    Drag and drop your {mediaMode} here, or{' '}
                    <span className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">
                      browse device
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    {mediaMode === 'image' && 'Supports high-resolution forensic analysis for portraits, landscapes, artwork, and macros.'}
                    {mediaMode === 'video' && 'Detect face swaps, lip-sync glitches, temporal flickering, and Sora / Runway neural video deepfakes.'}
                    {mediaMode === 'audio' && 'Unmask ElevenLabs, Tortoise, Bark, and vocoder phase voice cloning signatures.'}
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                  {mediaMode === 'image' && (
                    <>
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">JPG / JPEG</span>
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">PNG</span>
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">WEBP</span>
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-indigo-950/60 text-indigo-300 border border-indigo-800/40">Max: 15 MB</span>
                    </>
                  )}
                  {mediaMode === 'video' && (
                    <>
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">MP4</span>
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">MOV</span>
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">WEBM</span>
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">MKV</span>
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-indigo-950/60 text-indigo-300 border border-indigo-800/40">Max: 50 MB</span>
                    </>
                  )}
                  {mediaMode === 'audio' && (
                    <>
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">MP3</span>
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">WAV</span>
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">M4A</span>
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">AAC</span>
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">FLAC</span>
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-indigo-950/60 text-indigo-300 border border-indigo-800/40">Max: 25 MB</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Sample Selector Bar */}
        {mediaMode === 'image' && !selectedFile && !isAnalyzing && (
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
            <h4 className="text-xs font-bold text-white mb-1">Empirical Vision & Audio Forensics</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              No simulated or randomized results. Powered by server-side Gemini 3.8 Flash multimodal reasoning with optical and acoustic physics analysis.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/60">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-3">
              <Lock className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-white mb-1">Encrypted & Confidential</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Your media payloads are processed securely through isolated backend proxy routes. API credentials remain strictly safeguarded on the server.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/60">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-3">
              <Info className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-white mb-1">Scientific Calibration</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Distinguishes real sensor/mic noise from generative artifacts. Inconclusive verdicts are assigned when media signal quality is ambiguous.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};