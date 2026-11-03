import React, { useState, useRef } from 'react';
import { UploadCloud, CheckCircle2, ArrowRight, FileCheck2, AlertCircle, RefreshCw, Sparkles, FileImage, Video, Mic } from 'lucide-react';
import { MediaType } from '../types/detector';

interface LiveAnalysisPreviewProps {
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
}

export const LiveAnalysisPreview: React.FC<LiveAnalysisPreviewProps> = ({
  onAnalyze,
  isAnalyzing,
  uploadProgress,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<{
    file?: File;
    base64: string;
    mimeType: string;
    name: string;
    size: number;
    previewUrl: string;
    mediaType: MediaType;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

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
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFileSelected(e.target.files[0]);
    }
  };

  const handleFileSelected = (file: File) => {
    let mediaType: MediaType = 'image';
    if (file.type.startsWith('video/')) mediaType = 'video';
    else if (file.type.startsWith('audio/')) mediaType = 'audio';

    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedFile({
        file,
        base64: reader.result as string,
        mimeType: file.type || 'image/jpeg',
        name: file.name,
        size: file.size,
        previewUrl: URL.createObjectURL(file),
        mediaType,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleStartAnalysis = () => {
    if (!selectedFile) {
      // Trigger file selection if nothing is selected yet
      if (fileInputRef.current) fileInputRef.current.click();
      return;
    }

    onAnalyze({
      file: selectedFile.file,
      base64: selectedFile.base64,
      mimeType: selectedFile.mimeType,
      name: selectedFile.name,
      size: selectedFile.size,
      mediaType: selectedFile.mediaType,
    });
  };

  return (
    <div
      id="live-analysis"
      className="w-full rounded-2xl border border-cyan-500/25 bg-gradient-to-b from-[#071426]/90 via-[#040c1a]/95 to-[#071426]/90 p-5 sm:p-6 backdrop-blur-xl shadow-[0_0_40px_-15px_rgba(0,229,255,0.25)] relative overflow-hidden"
    >
      {/* Top Header */}
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-heading font-bold text-white text-base sm:text-lg flex items-center gap-2">
          <span>Try a Live Analysis</span>
        </h3>
        
        {/* Real-time green indicator */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] font-mono font-bold tracking-wider text-emerald-400 uppercase">
            Real-time
          </span>
        </div>
      </div>

      {/* Grid: Upload Dropzone on Left, Live Preview Card on Right */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
        
        {/* Upload Drop Area */}
        <div className="md:col-span-8 flex flex-col justify-between space-y-4">
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`flex-1 border-2 border-dashed rounded-xl p-6 sm:p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 ${
              dragActive
                ? 'border-cyan-400 bg-cyan-500/10 scale-[1.01]'
                : selectedFile
                ? 'border-cyan-500/40 bg-cyan-950/20'
                : 'border-slate-700 hover:border-cyan-500/50 bg-slate-900/50 hover:bg-slate-900/80'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*,audio/*"
              className="hidden"
              onChange={handleChange}
            />

            {/* Upload Icon */}
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mb-3 shadow-[0_0_20px_rgba(0,229,255,0.2)]">
              <UploadCloud className="w-6 h-6 animate-pulse" />
            </div>

            {selectedFile ? (
              <div className="space-y-1">
                <p className="text-sm font-semibold text-white truncate max-w-xs sm:max-w-md">
                  {selectedFile.name}
                </p>
                <p className="text-xs font-mono text-cyan-400">
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready for Forensic Analysis
                </p>
              </div>
            ) : (
              <div className="space-y-1.5">
                <p className="text-sm font-medium text-slate-200">
                  <span className="text-cyan-400 font-semibold">Drag & drop a file</span> or click to upload
                </p>
                <p className="text-[11px] text-slate-400 font-mono">
                  Supports: JPG, PNG, MP4, WAV (≤ 500 MB)
                </p>
              </div>
            )}
          </div>

          {/* Action Button: Analyze Media -> */}
          <button
            onClick={handleStartAnalysis}
            disabled={isAnalyzing}
            className={`w-full py-3.5 px-6 rounded-full font-heading font-bold text-sm text-white shadow-lg transition-all duration-300 flex items-center justify-center gap-2 ${
              isAnalyzing
                ? 'bg-slate-800 cursor-not-allowed text-slate-400'
                : 'bg-gradient-to-r from-[#00E5FF] via-[#267CFF] to-[#FF9D32] hover:shadow-[0_0_30px_rgba(0,229,255,0.4)] hover:brightness-110 active:scale-[0.99]'
            }`}
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
                <span>
                  {uploadProgress !== null ? `Uploading ${uploadProgress}%...` : 'Analyzing Media...'}
                </span>
              </>
            ) : (
              <>
                <span>Analyze Media</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        {/* Small Live Preview Panel Beside Upload (Matches Reference Card) */}
        <div className="md:col-span-4 rounded-xl border border-cyan-500/20 bg-slate-950/80 p-3.5 flex flex-col justify-between relative overflow-hidden">
          {/* Header indicator */}
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-2">
            <span>FORENSIC TELEMETRY</span>
            <span className="text-cyan-400">LIVE SENSOR</span>
          </div>

          {/* Preview Image with Target Reticle */}
          <div className="relative aspect-square w-full rounded-lg overflow-hidden border border-cyan-500/30 bg-slate-900 group">
            {selectedFile && selectedFile.mediaType === 'image' ? (
              <img
                src={selectedFile.previewUrl}
                alt="Selected for Analysis"
                className="w-full h-full object-cover"
              />
            ) : (
              <img
                src="/demo-face.jpg"
                alt="Demo Analysis Subject"
                className="w-full h-full object-cover filter contrast-105"
              />
            )}

            {/* Corner scan brackets */}
            <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-emerald-400" />
            <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-emerald-400" />
            <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-emerald-400" />
            <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-emerald-400" />

            {/* Center target circle */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
              <div className="w-12 h-12 rounded-full border border-dashed border-emerald-400 animate-spin" />
            </div>
          </div>

          {/* Live Status Pill below image (matches reference green pill) */}
          <div className="mt-3 p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-xs font-mono font-bold text-emerald-400">
                {selectedFile ? 'Ready to Scan' : 'Real (92%)'}
              </span>
            </div>
            <div className="text-[10px] font-mono text-slate-400">
              {selectedFile ? 'Pending verdict' : 'Confidence: 0.92'}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

