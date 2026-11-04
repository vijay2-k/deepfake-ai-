import React, { useState, useRef } from 'react';
import { UploadCloud, CheckCircle2, ArrowRight, RefreshCw, Zap } from 'lucide-react';
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
      className="w-full rounded-3xl border border-[#E4DEFF] bg-white p-5 sm:p-6 shadow-[0_15px_40px_rgba(85,21,216,0.08)] relative overflow-hidden"
    >
      {/* Top Header */}
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-heading font-bold text-[#10132F] text-base sm:text-lg flex items-center gap-2">
          <span>Try a Live Analysis</span>
        </h3>

        {/* Real-time purple indicator */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F1EEFF] border border-[#E4DEFF]">
          <span className="w-2 h-2 rounded-full bg-[#5515D8] animate-pulse" />
          <span className="text-[10px] font-mono font-bold tracking-wider text-[#5515D8] uppercase">
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
            className={`flex-1 border-2 border-dashed rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 ${
              dragActive
                ? 'border-[#5515D8] bg-[#F1EEFF] scale-[1.01]'
                : selectedFile
                ? 'border-[#5515D8]/40 bg-[#FAF8FF]'
                : 'border-[#E4DEFF] hover:border-[#5515D8]/60 bg-[#FAF8FF] hover:bg-[#F5F2FF]'
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
            <div className="w-12 h-12 rounded-2xl bg-[#F1EEFF] border border-[#E4DEFF] text-[#5515D8] flex items-center justify-center mb-3 shadow-sm">
              <UploadCloud className="w-6 h-6 animate-pulse" />
            </div>

            {selectedFile ? (
              <div className="space-y-1">
                <p className="text-sm font-semibold text-[#10132F] truncate max-w-xs sm:max-w-md">
                  {selectedFile.name}
                </p>
                <p className="text-xs font-mono text-[#5515D8]">
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready for Forensic Analysis
                </p>
              </div>
            ) : (
              <div className="space-y-1.5">
                <p className="text-sm font-medium text-[#10132F]">
                  <span className="text-[#5515D8] font-bold">Drag & drop a file</span> or click to upload
                </p>
                <p className="text-[11px] text-[#525779] font-mono">
                  Supports: JPG, PNG, MP4, WAV (≤ 500 MB)
                </p>
              </div>
            )}
          </div>

          {/* Action Button: Analyze Media -> */}
          <button
            onClick={handleStartAnalysis}
            disabled={isAnalyzing}
            className={`w-full py-3.5 px-6 rounded-full font-heading font-bold text-sm shadow-md transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${
              isAnalyzing
                ? 'bg-[#E4DEFF] cursor-not-allowed text-[#525779]'
                : 'bg-gradient-to-r from-[#5515D8] to-[#8B32FF] text-white hover:shadow-lg hover:shadow-[#5515D8]/25 hover:scale-[1.01] active:scale-[0.99]'
            }`}
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
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

        {/* Small Live Preview Panel Beside Upload */}
        <div className="md:col-span-4 rounded-2xl border border-[#E4DEFF] bg-[#F8F7FF] p-4 flex flex-col justify-between relative overflow-hidden">
          {/* Header indicator */}
          <div className="flex items-center justify-between text-[11px] font-mono text-[#525779] mb-2 font-semibold">
            <span>FORENSIC TELEMETRY</span>
            <span className="text-[#5515D8]">LIVE SENSOR</span>
          </div>

          {/* Preview Image with Target Reticle */}
          <div className="relative aspect-square w-full rounded-xl overflow-hidden border border-[#E4DEFF] bg-white group">
            {selectedFile && selectedFile.mediaType === 'image' ? (
              <img
                src={selectedFile.previewUrl}
                alt="Selected for Analysis"
                className="w-full h-full object-cover"
              />
            ) : (
              <img
                src="/hero-face-portrait.jpg"
                alt="Demo Analysis Subject"
                className="w-full h-full object-cover"
              />
            )}

            {/* Corner scan brackets in purple */}
            <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-[#5515D8]" />
            <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-[#5515D8]" />
            <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-[#5515D8]" />
            <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-[#5515D8]" />

            {/* Center target circle */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
              <div className="w-12 h-12 rounded-full border border-dashed border-[#5515D8] animate-spin" />
            </div>
          </div>

          {/* Live Status Pill below image */}
          <div className="mt-3 p-2.5 rounded-xl bg-white border border-[#E4DEFF] flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#5515D8] shrink-0" />
              <span className="text-xs font-mono font-bold text-[#10132F]">
                {selectedFile ? 'Ready to Scan' : 'Real (92%)'}
              </span>
            </div>
            <div className="text-[10px] font-mono text-[#525779]">
              {selectedFile ? 'Pending verdict' : 'Confidence: 0.92'}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
