import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileImage,
  Video,
  Mic,
  Sparkles,
  Lock,
  RefreshCw,
  X,
  ShieldAlert,
  Film,
  Music,
  CheckCircle2,
  Info,
  Scan,
  Zap,
} from 'lucide-react';
import { MediaType } from '../types/detector';
import { SampleImageItem } from '../data/sampleImages';

const MAX_IMAGE_SIZE = 25 * 1024 * 1024;
const MAX_VIDEO_SIZE = 100 * 1024 * 1024;
const MAX_AUDIO_SIZE = 50 * 1024 * 1024;

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
  error?: string | null;
  onClearError: () => void;
}

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
  const [validationError, setValidationError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<{
    file: File;
    previewUrl: string;
    dimensions?: { width: number; height: number };
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [analysisStepIndex, setAnalysisStepIndex] = useState(0);

  const stepsByMode: Record<MediaType, string[]> = {
    image: [
      'Ingesting binary file & decoding EXIF camera metadata...',
      'Computing camera sensor PRNU noise floor & shot noise baseline...',
      'Extracting spatial sub-patches & calculating local Error Level (ELA)...',
      'Running multimodal forensic vision reasoning & latent markers...',
      'Synthesizing multi-model consensus & generating forensic docket...',
    ],
    video: [
      'Decoding video frames, audio tracks & container metadata...',
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
  const [elapsedSeconds, setElapsedSeconds] = React.useState<number>(0);

  React.useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isAnalyzing) {
      setElapsedSeconds(0);
      setAnalysisStepIndex(0);
      const start = Date.now();
      timer = setInterval(() => {
        const sec = (Date.now() - start) / 1000;
        setElapsedSeconds(sec);

        if (sec < 1.5) {
          setAnalysisStepIndex(0);
        } else if (sec < 3.5) {
          setAnalysisStepIndex(1);
        } else if (sec < 6.0) {
          setAnalysisStepIndex(2);
        } else if (sec < 9.0) {
          setAnalysisStepIndex(3);
        } else {
          setAnalysisStepIndex(Math.min(currentSteps.length - 1, 4));
        }
      }, 100);
    } else {
      setElapsedSeconds(0);
    }
    return () => clearInterval(timer);
  }, [isAnalyzing, currentSteps.length]);

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

    if (mediaMode === 'image') {
      const allowedImageMimes = ['image/jpeg', 'image/png', 'image/webp'];
      const ext = file.name.split('.').pop()?.toLowerCase();
      const allowedExts = ['jpg', 'jpeg', 'png', 'webp'];
      if (!allowedImageMimes.includes(file.type) && !allowedExts.includes(ext || '')) {
        setValidationError('Invalid image format. Supported formats: JPG, PNG, WEBP.');
        return;
      }
    } else if (mediaMode === 'video') {
      const allowedVideoMimes = ['video/mp4', 'video/quicktime', 'video/webm', 'video/x-matroska', 'video/avi'];
      const ext = file.name.split('.').pop()?.toLowerCase();
      const allowedExts = ['mp4', 'mov', 'webm', 'mkv', 'avi'];
      if (!allowedVideoMimes.includes(file.type) && !allowedExts.includes(ext || '')) {
        setValidationError('Invalid video format. Supported formats: MP4, MOV, WEBM, MKV.');
        return;
      }
    } else if (mediaMode === 'audio') {
      const allowedAudioMimes = [
        'audio/mpeg',
        'audio/mp3',
        'audio/wav',
        'audio/x-wav',
        'audio/m4a',
        'audio/x-m4a',
        'audio/aac',
        'audio/flac',
        'audio/ogg',
        'audio/webm',
      ];
      const ext = file.name.split('.').pop()?.toLowerCase();
      const allowedExts = ['mp3', 'wav', 'm4a', 'aac', 'flac', 'ogg', 'webm'];
      if (!allowedAudioMimes.includes(file.type) && !allowedExts.includes(ext || '')) {
        setValidationError('Invalid audio format. Supported formats: MP3, WAV, M4A, AAC, FLAC, OGG.');
        return;
      }
    }

    const objectUrl = URL.createObjectURL(file);

    if (mediaMode === 'image') {
      const img = new Image();
      img.onload = () => {
        setSelectedFile({
          file,
          previewUrl: objectUrl,
          dimensions: { width: img.naturalWidth, height: img.naturalHeight },
        });
      };
      img.onerror = () => {
        setSelectedFile({ file, previewUrl: objectUrl });
      };
      img.src = objectUrl;
    } else {
      setSelectedFile({ file, previewUrl: objectUrl });
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
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
    onClearError();
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleTriggerAnalyze = () => {
    if (!selectedFile) return;

    if (selectedFile.file.size > 2 * 1024 * 1024) {
      onAnalyze({
        file: selectedFile.file,
        base64: '',
        mimeType: selectedFile.file.type || (mediaMode === 'image' ? 'image/jpeg' : mediaMode === 'video' ? 'video/mp4' : 'audio/mpeg'),
        name: selectedFile.file.name,
        size: selectedFile.file.size,
        mediaType: mediaMode,
      });
    } else {
      const reader = new FileReader();
      reader.onloadend = () => {
        onAnalyze({
          file: selectedFile.file,
          base64: reader.result as string,
          mimeType: selectedFile.file.type || (mediaMode === 'image' ? 'image/jpeg' : mediaMode === 'video' ? 'video/mp4' : 'audio/mpeg'),
          name: selectedFile.file.name,
          size: selectedFile.file.size,
          mediaType: mediaMode,
        });
      };
      reader.readAsDataURL(selectedFile.file);
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
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#F1EEFF] border border-[#E4DEFF] text-[#5515D8] text-xs font-semibold mb-4 backdrop-blur-sm shadow-sm">
          <Zap className="w-3.5 h-3.5 text-[#5515D8]" />
          <span>Multimodal Forensic Vision & AI Voice Intelligence</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#10132F] mb-4 leading-tight font-heading">
          Is This Media <span className="bg-gradient-to-r from-[#5515D8] to-[#1677FF] bg-clip-text text-transparent">Authentic</span> or <span className="bg-gradient-to-r from-rose-500 to-amber-500 bg-clip-text text-transparent">AI Synthetic</span>?
        </h1>
        <p className="text-base sm:text-lg text-[#525779] leading-relaxed max-w-2xl mx-auto">
          Examine Images, Deepfake Videos, and Voice Recordings with advanced optical physics, temporal coherence, and vocoder spectral analysis.
        </p>
      </div>

      {/* Main Upload / Inspector Card */}
      <div className="max-w-4xl mx-auto px-4">
        <div className="relative bg-white rounded-3xl border border-[#E4DEFF] shadow-[0_20px_50px_rgba(85,21,216,0.08)] overflow-hidden p-6 sm:p-8">
          
          {/* Prominent Three-Option Media Mode Switcher */}
          {!isAnalyzing && (
            <div className="flex items-center justify-center p-1.5 mb-8 rounded-full bg-[#F1EEFF] border border-[#E4DEFF] gap-1.5 max-w-xl mx-auto shadow-inner">
              <button
                type="button"
                onClick={() => handleSwitchMode('image')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  mediaMode === 'image'
                    ? 'bg-gradient-to-r from-[#5515D8] to-[#8B32FF] text-white shadow-md shadow-[#5515D8]/20'
                    : 'text-[#525779] hover:text-[#10132F] hover:bg-white/60'
                }`}
              >
                <FileImage className="w-4 h-4" />
                <span>Image Detector</span>
              </button>

              <button
                type="button"
                onClick={() => handleSwitchMode('video')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  mediaMode === 'video'
                    ? 'bg-gradient-to-r from-[#5515D8] to-[#8B32FF] text-white shadow-md shadow-[#5515D8]/20'
                    : 'text-[#525779] hover:text-[#10132F] hover:bg-white/60'
                }`}
              >
                <Video className="w-4 h-4" />
                <span>Video Deepfake</span>
              </button>

              <button
                type="button"
                onClick={() => handleSwitchMode('audio')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  mediaMode === 'audio'
                    ? 'bg-gradient-to-r from-[#5515D8] to-[#8B32FF] text-white shadow-md shadow-[#5515D8]/20'
                    : 'text-[#525779] hover:text-[#10132F] hover:bg-white/60'
                }`}
              >
                <Mic className="w-4 h-4" />
                <span>Voice Clone</span>
              </button>
            </div>
          )}

          {/* Validation or API Error Banner */}
          {(validationError || error) && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start justify-between gap-3 animate-fade-in shadow-sm">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0" />
                <span>{validationError || error}</span>
              </div>
              <button
                onClick={() => {
                  setValidationError(null);
                  onClearError();
                }}
                className="text-rose-400 hover:text-rose-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Loading Animation Overlay */}
          {isAnalyzing ? (
            <div className="py-16 px-4 flex flex-col items-center justify-center text-center">
              <div className="relative w-28 h-28 mb-8 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-2 border-[#8B32FF]/20 animate-ping" />
                <div className="absolute inset-2 rounded-full border border-[#1677FF]/30 animate-pulse" />
                <div className="absolute inset-0 rounded-full border-t-2 border-r-2 border-[#5515D8] animate-spin" />
                <div className="w-16 h-16 rounded-full bg-[#FAF8FF] flex items-center justify-center border border-[#E4DEFF] shadow-inner">
                  <Scan className="w-8 h-8 text-[#5515D8] animate-pulse" />
                </div>
              </div>

              <div className="space-y-2 max-w-md">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#F1EEFF] text-[#5515D8] border border-[#E4DEFF]">
                  <span>
                    {uploadProgress !== null && uploadProgress !== undefined && uploadProgress < 100
                      ? `Uploading Payload (${uploadProgress}%)`
                      : `Forensic Pass ${analysisStepIndex + 1} of ${currentSteps.length}`}
                  </span>
                  {isAnalyzing && (
                    <span className="font-mono text-[11px] text-[#5515D8] font-normal border-l border-[#E4DEFF] pl-2">
                      {elapsedSeconds.toFixed(1)}s
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-bold text-[#10132F] tracking-tight font-heading">
                  {uploadProgress !== null && uploadProgress !== undefined && uploadProgress < 100
                    ? `Uploading ${mediaMode.toUpperCase()} File...`
                    : `Analyzing ${mediaMode.toUpperCase()} Authenticity...`}
                </h3>
                <p className="text-xs text-[#525779] font-mono min-h-[36px] transition-all">
                  {uploadProgress !== null && uploadProgress !== undefined && uploadProgress < 100
                    ? `Streaming binary file payload to backend server (${uploadProgress}%)...`
                    : currentSteps[analysisStepIndex]}
                </p>
              </div>

              {/* Progress bar */}
              <div className="w-full max-w-md bg-[#F1EEFF] rounded-full h-2 mt-6 overflow-hidden border border-[#E4DEFF]">
                <div
                  className="bg-gradient-to-r from-[#5515D8] via-[#7B2BFF] to-[#1677FF] h-2 transition-all duration-200 rounded-full"
                  style={{
                    width:
                      uploadProgress !== null && uploadProgress !== undefined && uploadProgress < 100
                        ? `${uploadProgress}%`
                        : `${Math.min(95, ((analysisStepIndex + 0.3 + (elapsedSeconds % 2) * 0.3) / currentSteps.length) * 100)}%`,
                  }}
                />
              </div>

              <p className="text-[11px] text-[#525779] mt-4 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-[#5515D8]" />
                Secure server-side processing via Gemini Vision & Deepfake Neural Forensics
              </p>
            </div>
          ) : selectedFile ? (
            /* Media Preview State (Before Analysis) */
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row gap-6 items-center">
                {/* Preview Container per mode */}
                <div className="relative w-full md:w-1/2 aspect-square max-h-[380px] bg-[#FAF8FF] rounded-2xl border border-[#E4DEFF] overflow-hidden flex flex-col items-center justify-center p-2 group shadow-inner">
                  {mediaMode === 'image' && (
                    <>
                      <img
                        src={selectedFile.previewUrl}
                        alt="Upload Preview"
                        className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
                      />
                      {selectedFile.dimensions && (
                        <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-lg bg-white/90 border border-[#E4DEFF] text-[10px] text-[#10132F] font-mono backdrop-blur-sm shadow-sm">
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
                        className="w-full max-h-[300px] rounded-xl bg-black object-contain"
                      />
                      <div className="absolute top-2 left-2 px-2.5 py-1 rounded-lg bg-white/90 border border-[#E4DEFF] text-[10px] text-[#1677FF] font-semibold flex items-center gap-1 shadow-sm">
                        <Film className="w-3.5 h-3.5" /> Video Stream Ready
                      </div>
                    </div>
                  )}

                  {mediaMode === 'audio' && (
                    <div className="w-full h-full flex flex-col items-center justify-center p-4 space-y-4">
                      <div className="w-16 h-16 rounded-2xl bg-[#F1EEFF] border border-[#E4DEFF] flex items-center justify-center text-[#5515D8]">
                        <Music className="w-8 h-8 text-[#5515D8] animate-pulse" />
                      </div>
                      <div className="w-full">
                        <audio controls src={selectedFile.previewUrl} className="w-full rounded-lg" />
                      </div>
                      <div className="px-2.5 py-1 rounded-lg bg-white border border-[#E4DEFF] text-[10px] text-[#5515D8] font-mono shadow-sm">
                        Acoustic Spectrum Stream
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handleRemove}
                    className="absolute top-3 right-3 p-2 rounded-xl bg-white/90 hover:bg-rose-50 text-[#525779] hover:text-rose-600 border border-[#E4DEFF] transition-colors z-10 shadow-sm cursor-pointer"
                    title="Remove file"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* File Details & Action Panel */}
                <div className="w-full md:w-1/2 flex flex-col justify-between space-y-5">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#5515D8] bg-[#F1EEFF] px-3 py-1 rounded-full border border-[#E4DEFF]">
                      Target {mediaMode.toUpperCase()} Payload Verified
                    </span>
                    <h3 className="text-xl font-bold text-[#10132F] mt-2 truncate font-heading" title={selectedFile.file.name}>
                      {selectedFile.file.name}
                    </h3>
                    <p className="text-xs text-[#525779] mt-1">
                      Ready for deep multi-modal forensic inspection.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-[#FAF8FF] border border-[#E4DEFF]">
                      <div className="text-[10px] text-[#525779] uppercase font-semibold">File Size</div>
                      <div className="font-bold text-[#10132F] mt-0.5 font-mono">
                        {(selectedFile.file.size / 1024).toFixed(1)} KB
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-[#FAF8FF] border border-[#E4DEFF]">
                      <div className="text-[10px] text-[#525779] uppercase font-semibold">MIME Type</div>
                      <div className="font-bold text-[#10132F] mt-0.5 truncate font-mono" title={selectedFile.file.type}>
                        {selectedFile.file.type || 'image/jpeg'}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 pt-2">
                    <button
                      onClick={handleTriggerAnalyze}
                      className="w-full py-3.5 px-6 rounded-full font-bold text-sm text-white bg-gradient-to-r from-[#5515D8] to-[#8B32FF] hover:brightness-110 transition-all shadow-lg shadow-[#5515D8]/25 flex items-center justify-center gap-2 group cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4 text-cyan-300 group-hover:rotate-12 transition-transform" />
                      <span>Analyze {mediaMode.toUpperCase()} Authenticity</span>
                    </button>

                    <div className="flex items-center justify-between text-xs text-[#525779] px-1">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="hover:text-[#5515D8] flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5 text-[#5515D8]" />
                        <span>Replace file</span>
                      </button>
                      <button
                        onClick={handleRemove}
                        className="hover:text-rose-600 transition-colors cursor-pointer"
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
              className={`relative border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-200 ${
                dragActive
                  ? 'border-[#5515D8] bg-[#F1EEFF] scale-[1.01]'
                  : 'border-[#D4CAFF] hover:border-[#5515D8]/60 bg-[#FAF8FF] hover:bg-[#F3EFFF]'
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
                <div className="w-16 h-16 rounded-2xl bg-[#F1EEFF] border border-[#E4DEFF] flex items-center justify-center text-[#5515D8] shadow-md shadow-[#5515D8]/10 group-hover:scale-110 transition-transform">
                  {mediaMode === 'image' && <UploadCloud className="w-8 h-8 text-[#5515D8]" />}
                  {mediaMode === 'video' && <Video className="w-8 h-8 text-[#1677FF]" />}
                  {mediaMode === 'audio' && <Mic className="w-8 h-8 text-[#8B32FF]" />}
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-lg font-bold text-[#10132F] font-heading">
                    Drag and drop your {mediaMode} here, or{' '}
                    <span className="text-[#5515D8] underline underline-offset-4 hover:text-[#3210A8]">
                      browse device
                    </span>
                  </h3>
                  <p className="text-xs text-[#525779] max-w-md mx-auto">
                    {mediaMode === 'image' && 'Supports high-resolution forensic analysis for portraits, landscapes, artwork, and macros.'}
                    {mediaMode === 'video' && 'Detect face swaps, lip-sync glitches, temporal flickering, and Sora / Runway neural video deepfakes.'}
                    {mediaMode === 'audio' && 'Unmask ElevenLabs, Tortoise, Bark, and vocoder phase voice cloning signatures.'}
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                  {mediaMode === 'image' && (
                    <>
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-white text-[#525779] border border-[#E4DEFF]">JPG / JPEG</span>
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-white text-[#525779] border border-[#E4DEFF]">PNG</span>
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-white text-[#525779] border border-[#E4DEFF]">WEBP</span>
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-[#F1EEFF] text-[#5515D8] border border-[#E4DEFF]">Max: 25 MB</span>
                    </>
                  )}
                  {mediaMode === 'video' && (
                    <>
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-white text-[#525779] border border-[#E4DEFF]">MP4</span>
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-white text-[#525779] border border-[#E4DEFF]">MOV</span>
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-white text-[#525779] border border-[#E4DEFF]">WEBM</span>
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-[#F1EEFF] text-[#1677FF] border border-[#E4DEFF]">Max: 100 MB</span>
                    </>
                  )}
                  {mediaMode === 'audio' && (
                    <>
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-white text-[#525779] border border-[#E4DEFF]">MP3</span>
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-white text-[#525779] border border-[#E4DEFF]">WAV</span>
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-white text-[#525779] border border-[#E4DEFF]">M4A</span>
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-[#F1EEFF] text-[#8B32FF] border border-[#E4DEFF]">Max: 50 MB</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Sample Selector Bar */}
        {mediaMode === 'image' && !selectedFile && !isAnalyzing && (
          <div className="mt-8 pt-6 border-t border-[#E4DEFF]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#5515D8]" />
                <h4 className="text-xs font-bold text-[#10132F] uppercase tracking-wider font-heading">
                  Or Test with Curated Specimens
                </h4>
              </div>
              <span className="text-[11px] text-[#525779]">Instant one-click benchmark</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {samples.map((sample) => (
                <div
                  key={sample.id}
                  onClick={() => onSelectSample(sample)}
                  className="p-3 rounded-2xl bg-white border border-[#E4DEFF] hover:border-[#5515D8]/50 hover:shadow-md hover:shadow-[#5515D8]/8 cursor-pointer transition-all flex flex-col justify-between group shadow-sm"
                >
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="w-9 h-9 rounded-xl bg-[#FAF8FF] overflow-hidden shrink-0 border border-[#E4DEFF] flex items-center justify-center">
                      <img
                        src={sample.dataUrl}
                        alt={sample.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-[#10132F] truncate">{sample.title}</div>
                      <div className="text-[10px] text-[#525779]">{sample.category}</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-[#525779] pt-2 border-t border-[#E4DEFF]">
                    <span>Expected: {sample.expectedVerdict.replace('Likely ', '')}</span>
                    <span className="text-[#5515D8] font-bold group-hover:translate-x-0.5 transition-transform">
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
          <div className="p-5 rounded-2xl bg-white border border-[#E4DEFF] shadow-sm">
            <div className="w-9 h-9 rounded-xl bg-[#F1EEFF] text-[#5515D8] flex items-center justify-center mb-3">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold text-[#10132F] mb-1 font-heading">Empirical Vision & Audio Forensics</h4>
            <p className="text-[11px] text-[#525779] leading-relaxed">
              No simulated or randomized results. Powered by server-side multimodal reasoning with optical and acoustic physics analysis.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-[#E4DEFF] shadow-sm">
            <div className="w-9 h-9 rounded-xl bg-[#EDF5FF] text-[#1677FF] flex items-center justify-center mb-3">
              <Lock className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold text-white text-[#10132F] mb-1 font-heading">Encrypted & Confidential</h4>
            <p className="text-[11px] text-[#525779] leading-relaxed">
              Your media payloads are processed securely through isolated backend proxy routes. API credentials remain strictly safeguarded on the server.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-[#E4DEFF] shadow-sm">
            <div className="w-9 h-9 rounded-xl bg-[#F6EEFF] text-[#8B32FF] flex items-center justify-center mb-3">
              <Info className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold text-[#10132F] mb-1 font-heading">Scientific Calibration</h4>
            <p className="text-[11px] text-[#525779] leading-relaxed">
              Distinguishes real sensor/mic noise from generative artifacts. Inconclusive verdicts are assigned when media signal quality is ambiguous.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
