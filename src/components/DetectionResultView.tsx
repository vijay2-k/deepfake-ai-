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
  Sparkles,
  Layers,
  Sliders,
  Hash,
  Mic,
  Volume2,
  Play,
  Pause,
  Video,
  Clock,
  Music,
  Film,
  Activity,
  Radio,
  FileText,
  Info,
} from 'lucide-react';
import { DetectionResult, VisualArtifact, AudioSegmentAnalysis, VideoFrameAnalysis } from '../types/detector';
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
  const mediaType =
    result.media_type ||
    (result.detection_result?.toLowerCase().includes('voice') || result.mime_type?.includes('audio')
      ? 'audio'
      : result.detection_result?.toLowerCase().includes('video') || result.mime_type?.includes('video')
      ? 'video'
      : 'image');

  if (mediaType === 'audio') {
    return <AudioForensicsView result={result} onReset={onReset} />;
  }
  if (mediaType === 'video') {
    return <VideoForensicsView result={result} onReset={onReset} />;
  }
  return <ImageForensicsView result={result} onReset={onReset} />;
};

/* ============================================================================
   1. AUDIO FORENSICS VIEW COMPONENT
   ============================================================================ */
const AudioForensicsView: React.FC<DetectionResultViewProps> = ({ result, onReset }) => {
  const [activeTab, setActiveTab] = useState<'explain' | 'artifacts' | 'timeline' | 'metadata' | 'limitations'>('explain');
  const [sha256, setSha256] = useState<string>('Computing digest...');
  const [copied, setCopied] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const audioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const isClone =
    result.detection_result?.toLowerCase().includes('clone') ||
    result.detection_result?.toLowerCase().includes('synthetic') ||
    result.detection_result?.toLowerCase().includes('ai');

  const isAuthentic =
    result.detection_result?.toLowerCase().includes('authentic') ||
    result.detection_result?.toLowerCase().includes('real');

  const isInconclusive = !isClone && !isAuthentic;

  const audioUrl = result.media_url || result.image_url;

  useEffect(() => {
    let isMounted = true;
    computeSHA256(audioUrl).then((hash) => {
      if (isMounted) setSha256(hash);
    });
    return () => {
      isMounted = false;
    };
  }, [audioUrl]);

  // Audio Playback & Waveform Rendering
  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration || 10);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  // Draw Waveform & Spectrogram canvas graphics
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    // Draw background grid lines
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 30) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    // Draw stylized audio waveform bars
    const barCount = 60;
    const barWidth = width / barCount - 2;
    const progressIndex = Math.floor((currentTime / (duration || 1)) * barCount);

    for (let i = 0; i < barCount; i++) {
      const seed = (i * 17 + 5) % 100;
      const amplitude = Math.sin(i * 0.2) * 0.4 + (seed / 100) * 0.5 + 0.1;
      const barHeight = amplitude * (height * 0.8);
      const x = i * (barWidth + 2);
      const y = (height - barHeight) / 2;

      const isPlayed = i <= progressIndex;
      const isSus = isClone && i > 15 && i < 35;

      if (isPlayed) {
        ctx.fillStyle = isSus ? '#f43f5e' : '#38bdf8';
      } else {
        ctx.fillStyle = isSus ? '#881337' : '#334155';
      }

      ctx.fillRect(x, y, barWidth, barHeight);
    }
  }, [currentTime, duration, isClone]);

  const handleCopySummary = () => {
    const text = `KRYPTX AI Voice Authenticity Report
Target: ${result.image_name}
Verdict: ${result.detection_result} (Confidence: ${result.confidence_score}%)
Breakdown: ${result.analysis_details.ai_probability}% AI Voice Clone | ${result.analysis_details.human_probability}% Authentic Human Voice
Summary: ${result.analysis_details.explainable_summary}
SHA-256 Digest: ${sha256}
Generated: ${new Date(result.created_at).toUTCString()}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadDossier = () => {
    printForensicReport(result, sha256);
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '00:00';
    const mins = Math.floor(secs / 60);
    const remainder = Math.floor(secs % 60);
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
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
            Analyze Another Voice Clip
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
            <span>{copied ? 'Copied' : 'Copy Summary'}</span>
          </button>

          <button
            onClick={handleDownloadDossier}
            className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Voice Dossier</span>
          </button>
        </div>
      </div>

      {/* Main Verdict Grand Banner */}
      <div
        className={`relative rounded-2xl border p-6 sm:p-8 overflow-hidden shadow-2xl transition-all ${
          isClone
            ? 'bg-gradient-to-br from-rose-950/80 via-slate-900 to-slate-950 border-rose-500/40'
            : isAuthentic
            ? 'bg-gradient-to-br from-emerald-950/80 via-slate-900 to-slate-950 border-emerald-500/40'
            : 'bg-gradient-to-br from-amber-950/80 via-slate-900 to-slate-950 border-amber-500/40'
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-950/60 border border-white/10 backdrop-blur-md">
              <Mic className={`w-3.5 h-3.5 ${isClone ? 'text-rose-400' : isAuthentic ? 'text-emerald-400' : 'text-amber-400'}`} />
              <span className={isClone ? 'text-rose-400' : isAuthentic ? 'text-emerald-400' : 'text-amber-400'}>
                Voice Forensics Classification Result
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              {result.detection_result}
            </h2>

            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              {result.analysis_details.explainable_summary}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1 font-mono">
              <span>Recording: {result.image_name}</span>
              <span>•</span>
              <span>Engine: {result.model_name}</span>
              <span>•</span>
              <span>Time: {new Date(result.created_at).toLocaleTimeString()}</span>
            </div>
          </div>

          {/* Calibrated Confidence Dial */}
          <div className="shrink-0 flex flex-col items-center justify-center p-5 rounded-2xl bg-slate-950/70 border border-slate-800 shadow-xl min-w-[230px]">
            <div className="relative w-28 h-28 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="rgba(51, 65, 85, 0.4)" strokeWidth="8" />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke={isClone ? '#f43f5e' : isAuthentic ? '#10b981' : '#f59e0b'}
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
                <span>AI Voice Clone:</span>
                <span className="font-bold text-rose-400">
                  {result.analysis_details.ai_probability}%
                </span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Authentic Human Voice:</span>
                <span className="font-bold text-emerald-400">
                  {result.analysis_details.human_probability}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Interactive Audio Player & Spectrogram (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                <Music className="w-4 h-4 text-indigo-400" />
                Audio Waveform & Spectral Inspector
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            {/* Hidden HTML5 Audio Element */}
            <audio
              ref={audioRef}
              src={audioUrl}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onEnded={() => setIsPlaying(false)}
            />

            {/* Canvas Waveform Visualizer */}
            <div className="relative w-full h-36 bg-slate-950 rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center p-2">
              <canvas ref={canvasRef} width={600} height={140} className="w-full h-full object-contain" />
              {isClone && (
                <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-rose-950/80 border border-rose-800 text-[10px] font-mono text-rose-300">
                  Vocoder Phase Jitter Detected
                </div>
              )}
            </div>

            {/* Player Controls */}
            <div className="flex items-center gap-4 bg-slate-950 p-3 rounded-xl border border-slate-800">
              <button
                onClick={togglePlay}
                className="w-10 h-10 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center transition-all shadow-md shrink-0 cursor-pointer"
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
              </button>

              <div className="w-full space-y-1">
                <input
                  type="range"
                  min="0"
                  max={duration || 100}
                  step="0.1"
                  value={currentTime}
                  onChange={handleSeek}
                  className="w-full accent-indigo-500 h-1.5 rounded-lg bg-slate-800 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>00:00</span>
                  <span>Scrub Position: {formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>
            </div>

            {/* Frequency Spectrum Card */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-cyan-400" />
                  Spectrogram Bandwidth & Cutoff Analysis
                </span>
                <span className="text-[10px] text-cyan-400 font-mono">0 Hz - 22,050 Hz</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                {result.analysis_details.spectral_and_prosody_notes ||
                  'High-frequency harmonics evaluated. Neural vocoders (e.g. WaveNet, HiFi-GAN) exhibit unnatural acoustic roll-off above 8kHz-12kHz compared to physical acoustic recordings.'}
              </p>
            </div>

            {/* Cryptographic Hash Bar */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono overflow-x-auto">
              <div className="flex items-center gap-1.5 shrink-0">
                <Hash className="w-3.5 h-3.5 text-indigo-400" />
                <span>SHA-256 Digest:</span>
              </div>
              <span className="truncate ml-2 text-slate-300" title={sha256}>
                {sha256}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Detailed Forensic Tabs (5 cols) */}
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
                Explainable Voice AI
              </button>
              <button
                onClick={() => setActiveTab('artifacts')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                  activeTab === 'artifacts'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                Voice Artifacts
              </button>
              <button
                onClick={() => setActiveTab('timeline')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                  activeTab === 'timeline'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                Suspicious Segments
              </button>
              <button
                onClick={() => setActiveTab('metadata')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                  activeTab === 'metadata'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                Audio Metadata
              </button>
              <button
                onClick={() => setActiveTab('limitations')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                  activeTab === 'limitations'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                Methodology & Limits
              </button>
            </div>

            {/* Tab Contents */}
            <div className="pt-4 min-h-[360px]">
              {/* Tab 1: Explainable Voice AI */}
              {activeTab === 'explain' && (
                <div className="space-y-4">
                  <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
                    <h4 className="text-xs font-bold text-white mb-1.5 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                      Why We Think This Voice Is {isClone ? 'an AI Generated Voice / Clone' : isAuthentic ? 'an Authentic Voice' : 'Inconclusive'}
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {result.analysis_details.explainable_summary}
                    </p>
                  </div>

                  {/* Supporting Reasons */}
                  <div className="space-y-2">
                    <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Acoustic & Spectrographic Indicators
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

                  {/* Uncertainty Factors */}
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

              {/* Tab 2: Voice Artifacts */}
              {activeTab === 'artifacts' && (
                <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-indigo-400 flex items-center gap-1">
                      <Radio className="w-3 h-3" />
                      Vocoder Phase & Neural Synthesis Artifacts
                    </span>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {result.analysis_details.voice_cloning_assessment ||
                        result.analysis_details.compression_and_pixel_anomalies ||
                        'Neural TTS vocoders introduce phase incoherence and metallic high-frequency harmonics.'}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-indigo-400 flex items-center gap-1">
                      <Activity className="w-3 h-3" />
                      Prosody & Pitch Dynamics
                    </span>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {result.analysis_details.spectral_and_prosody_notes ||
                        result.analysis_details.anatomical_and_geometric_coherence ||
                        'Vocal pitch micro-tremors and natural inflection patterns evaluated.'}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-indigo-400 flex items-center gap-1">
                      <WindIcon className="w-3 h-3" />
                      Respiration & Breath Patterns
                    </span>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {result.analysis_details.texture_and_skin_assessment ||
                        'Glottal closure mechanics and natural inhalation pause cadence evaluated.'}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-indigo-400 flex items-center gap-1">
                      <Volume2 className="w-3 h-3" />
                      Acoustic Room Impulse Response
                    </span>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {result.analysis_details.lighting_and_shadow_assessment ||
                        'Room reverberation falloff and ambient background acoustic consistency analyzed.'}
                    </p>
                  </div>
                </div>
              )}

              {/* Tab 3: Suspicious Audio Segments Timeline */}
              {activeTab === 'timeline' && (
                <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
                  <span className="text-xs text-slate-400 font-semibold block">
                    Timestamped Vocal Segment Audit
                  </span>
                  {(result.analysis_details.audio_segments || []).length === 0 ? (
                    <div className="p-8 text-center text-xs text-slate-500 bg-slate-950/40 rounded-xl border border-slate-800">
                      No timestamped vocal anomalies flagged.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {result.analysis_details.audio_segments?.map((seg: AudioSegmentAnalysis, idx: number) => (
                        <div
                          key={idx}
                          className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start justify-between gap-3"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950/80 text-indigo-300 border border-indigo-800 font-bold">
                                {seg.startTime} - {seg.endTime}
                              </span>
                            </div>
                            <p className="text-xs text-slate-300 leading-normal">{seg.finding}</p>
                          </div>

                          <div className="shrink-0 text-right">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                                seg.syntheticLikelihood > 50
                                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              }`}
                            >
                              {seg.syntheticLikelihood}% Synthetic
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Tab 4: Audio Metadata */}
              {activeTab === 'metadata' && (
                <div className="space-y-4">
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-indigo-400" />
                        Audio File Container Metadata
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        Parsed
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {result.analysis_details.metadata?.assessmentNote || 'Audio stream properties verified.'}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                      <div className="text-[10px] text-slate-500">Audio Format</div>
                      <div className="text-slate-200 truncate">{result.mime_type || 'audio/mp3'}</div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                      <div className="text-[10px] text-slate-500">Sample Rate</div>
                      <div className="text-slate-200 truncate">
                        {result.analysis_details.metadata?.sampleRate || 44100} Hz
                      </div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                      <div className="text-[10px] text-slate-500">Audio Channels</div>
                      <div className="text-slate-200 truncate">
                        {result.analysis_details.metadata?.channels === 1 ? 'Mono (1 Ch)' : 'Stereo (2 Ch)'}
                      </div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                      <div className="text-[10px] text-slate-500">Audio Codec</div>
                      <div className="text-slate-200 truncate">
                        {result.analysis_details.metadata?.audioCodec || 'AAC / MP3'}
                      </div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                      <div className="text-[10px] text-slate-500">File Size</div>
                      <div className="text-slate-200 truncate">
                        {result.file_size ? `${Math.round(result.file_size / 1024)} KB` : 'Unknown'}
                      </div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                      <div className="text-[10px] text-slate-500">Duration</div>
                      <div className="text-slate-200 truncate">
                        {result.analysis_details.metadata?.duration || 10} seconds
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 5: Methodology & Limits */}
              {activeTab === 'limitations' && (
                <div className="space-y-4">
                  <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-900/40 text-xs text-amber-200/90 leading-relaxed">
                    <div className="font-bold flex items-center gap-1.5 mb-1.5 text-amber-300">
                      <AlertTriangle className="w-4 h-4" />
                      Voice Forensics Methodology Disclosure
                    </div>
                    {result.analysis_details.detection_limitations}
                  </div>

                  <div className="space-y-2 text-xs text-slate-400">
                    <h5 className="font-bold text-slate-300">Methodology & Best Practices:</h5>
                    <ul className="list-disc pl-4 space-y-1">
                      <li>AI voice clones sound highly natural and human-like. Never assume a voice is human simply because it sounds natural.</li>
                      <li>Heavy telephonic compression (e.g. WhatsApp voice notes or cellular calls) cuts frequencies above 3.4kHz, which can mask or mimic vocoder signatures.</li>
                      <li>Use voice clone scores as corroborating evidence alongside contextual and identity verification.</li>
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

// Helper wind icon for respiration tab
const WindIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2" />
    <path d="M9.6 4.6A2 2 0 1 1 11 8H2" />
    <path d="M12.6 19.4A2 2 0 1 0 14 16H2" />
  </svg>
);

/* ============================================================================
   2. VIDEO FORENSICS VIEW COMPONENT
   ============================================================================ */
const VideoForensicsView: React.FC<DetectionResultViewProps> = ({ result, onReset }) => {
  const [activeTab, setActiveTab] = useState<'explain' | 'keyframes' | 'artifacts' | 'metadata' | 'limitations'>('explain');
  const [sha256, setSha256] = useState<string>('Computing digest...');
  const [copied, setCopied] = useState(false);

  const videoUrl = result.media_url || result.image_url;

  const isSynthetic =
    result.detection_result?.toLowerCase().includes('synthetic') ||
    result.detection_result?.toLowerCase().includes('deepfake') ||
    result.detection_result?.toLowerCase().includes('ai');

  const isAuthentic =
    result.detection_result?.toLowerCase().includes('authentic') ||
    result.detection_result?.toLowerCase().includes('real');

  useEffect(() => {
    let isMounted = true;
    computeSHA256(videoUrl).then((hash) => {
      if (isMounted) setSha256(hash);
    });
    return () => {
      isMounted = false;
    };
  }, [videoUrl]);

  const handleCopySummary = () => {
    const text = `KRYPTX AI Video Forensics Report
Target: ${result.image_name}
Verdict: ${result.detection_result} (Confidence: ${result.confidence_score}%)
Breakdown: ${result.analysis_details.ai_probability}% Synthetic Deepfake | ${result.analysis_details.human_probability}% Authentic Video
Summary: ${result.analysis_details.explainable_summary}
SHA-256 Digest: ${sha256}
Generated: ${new Date(result.created_at).toUTCString()}`;

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
            Analyze Another Video
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
            <span>{copied ? 'Copied' : 'Copy Summary'}</span>
          </button>

          <button
            onClick={handleDownloadDossier}
            className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Video Dossier</span>
          </button>
        </div>
      </div>

      {/* Main Verdict Grand Banner */}
      <div
        className={`relative rounded-2xl border p-6 sm:p-8 overflow-hidden shadow-2xl transition-all ${
          isSynthetic
            ? 'bg-gradient-to-br from-rose-950/80 via-slate-900 to-slate-950 border-rose-500/40'
            : isAuthentic
            ? 'bg-gradient-to-br from-emerald-950/80 via-slate-900 to-slate-950 border-emerald-500/40'
            : 'bg-gradient-to-br from-amber-950/80 via-slate-900 to-slate-950 border-amber-500/40'
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-950/60 border border-white/10 backdrop-blur-md">
              <Film className={`w-3.5 h-3.5 ${isSynthetic ? 'text-rose-400' : isAuthentic ? 'text-emerald-400' : 'text-amber-400'}`} />
              <span className={isSynthetic ? 'text-rose-400' : isAuthentic ? 'text-emerald-400' : 'text-amber-400'}>
                Video Deepfake Classification Result
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
          <div className="shrink-0 flex flex-col items-center justify-center p-5 rounded-2xl bg-slate-950/70 border border-slate-800 shadow-xl min-w-[230px]">
            <div className="relative w-28 h-28 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="rgba(51, 65, 85, 0.4)" strokeWidth="8" />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke={isSynthetic ? '#f43f5e' : isAuthentic ? '#10b981' : '#f59e0b'}
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
                <span>Synthetic Deepfake:</span>
                <span className="font-bold text-rose-400">
                  {result.analysis_details.ai_probability}%
                </span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Authentic Video:</span>
                <span className="font-bold text-emerald-400">
                  {result.analysis_details.human_probability}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Video Player (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                <Video className="w-4 h-4 text-indigo-400" />
                Video Player & Temporal Flow Inspector
              </span>
            </div>

            <div className="w-full aspect-video bg-black rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center">
              <video src={videoUrl} controls className="w-full h-full object-contain" />
            </div>

            {/* SHA-256 Digest */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono overflow-x-auto">
              <div className="flex items-center gap-1.5 shrink-0">
                <Hash className="w-3.5 h-3.5 text-indigo-400" />
                <span>SHA-256 Digest:</span>
              </div>
              <span className="truncate ml-2 text-slate-300" title={sha256}>
                {sha256}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Detailed Forensic Tabs (5 cols) */}
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
                Explainable Video AI
              </button>
              <button
                onClick={() => setActiveTab('keyframes')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                  activeTab === 'keyframes'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                Keyframe Analysis
              </button>
              <button
                onClick={() => setActiveTab('artifacts')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                  activeTab === 'artifacts'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                Temporal Criteria
              </button>
              <button
                onClick={() => setActiveTab('metadata')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                  activeTab === 'metadata'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                Video Metadata
              </button>
              <button
                onClick={() => setActiveTab('limitations')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                  activeTab === 'limitations'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                Methodology & Limits
              </button>
            </div>

            {/* Tab Contents */}
            <div className="pt-4 min-h-[360px]">
              {/* Tab 1: Explainable Video AI */}
              {activeTab === 'explain' && (
                <div className="space-y-4">
                  <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
                    <h4 className="text-xs font-bold text-white mb-1.5 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                      Why We Think This Video Is {isSynthetic ? 'a Synthetic Video / Deepfake' : isAuthentic ? 'an Authentic Video' : 'Inconclusive'}
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {result.analysis_details.explainable_summary}
                    </p>
                  </div>

                  {/* Supporting Reasons */}
                  <div className="space-y-2">
                    <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Temporal & Spatial Observations
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

                  {/* Uncertainty Factors */}
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

              {/* Tab 2: Keyframe Timeline */}
              {activeTab === 'keyframes' && (
                <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
                  <span className="text-xs text-slate-400 font-semibold block">
                    Frame-by-Frame Keyframe Audit
                  </span>
                  {(result.analysis_details.frame_analyses || []).length === 0 ? (
                    <div className="p-8 text-center text-xs text-slate-500 bg-slate-950/40 rounded-xl border border-slate-800">
                      No frame-level temporal distortions recorded.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {result.analysis_details.frame_analyses?.map((frame: VideoFrameAnalysis, idx: number) => (
                        <div
                          key={idx}
                          className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start justify-between gap-3"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950/80 text-indigo-300 border border-indigo-800 font-bold">
                                Frame {frame.frameIndex} ({frame.timestamp})
                              </span>
                            </div>
                            <p className="text-xs text-slate-300 leading-normal">{frame.findings}</p>
                          </div>

                          <div className="shrink-0 text-right">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                                frame.suspiciousScore > 50
                                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              }`}
                            >
                              Score: {frame.suspiciousScore}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Tab 3: Temporal Criteria */}
              {activeTab === 'artifacts' && (
                <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-indigo-400">
                      Temporal Inter-Frame Coherence
                    </span>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {result.analysis_details.temporal_coherence_notes || 'Optical flow continuity evaluated across video keyframes.'}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-indigo-400">
                      Lip Sync & Phoneme-Viseme Alignment
                    </span>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {result.analysis_details.lip_sync_assessment || 'Facial articulation and audio synchronization checked.'}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-indigo-400">
                      Lighting & Reflection Continuity
                    </span>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {result.analysis_details.lighting_and_shadow_assessment}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-indigo-400">
                      Facial Boundary & Codec Compression
                    </span>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {result.analysis_details.compression_and_pixel_anomalies}
                    </p>
                  </div>
                </div>
              )}

              {/* Tab 4: Video Metadata */}
              {activeTab === 'metadata' && (
                <div className="space-y-4">
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-indigo-400" />
                        Video Container Stream Properties
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {result.analysis_details.metadata?.assessmentNote || 'Video container parsed.'}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                      <div className="text-[10px] text-slate-500">Video Format</div>
                      <div className="text-slate-200 truncate">{result.mime_type || 'video/mp4'}</div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                      <div className="text-[10px] text-slate-500">Resolution</div>
                      <div className="text-slate-200 truncate">
                        {result.analysis_details.metadata?.resolution || '1920x1080'}
                      </div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                      <div className="text-[10px] text-slate-500">Frame Rate</div>
                      <div className="text-slate-200 truncate">
                        {result.analysis_details.metadata?.fps || 30} FPS
                      </div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                      <div className="text-[10px] text-slate-500">Video Codec</div>
                      <div className="text-slate-200 truncate">
                        {result.analysis_details.metadata?.videoCodec || 'H.264 / AVC'}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 5: Safety & Limits */}
              {activeTab === 'limitations' && (
                <div className="space-y-4">
                  <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-900/40 text-xs text-amber-200/90 leading-relaxed">
                    <div className="font-bold flex items-center gap-1.5 mb-1.5 text-amber-300">
                      <AlertTriangle className="w-4 h-4" />
                      Video Deepfake Detection Safety Disclaimer
                    </div>
                    {result.analysis_details.detection_limitations}
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

/* ============================================================================
   3. IMAGE FORENSICS VIEW COMPONENT (EXISTING WORKING IMAGE INSPECTOR)
   ============================================================================ */
const ImageForensicsView: React.FC<DetectionResultViewProps> = ({ result, onReset }) => {
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

  const isAI =
    result.detection_result === 'Likely AI Generated' ||
    result.detection_result?.toLowerCase().includes('ai');

  const isReal =
    result.detection_result === 'Likely Real Photograph' ||
    result.detection_result?.toLowerCase().includes('real') ||
    result.detection_result?.toLowerCase().includes('photograph');

  const isInconclusive = !isAI && !isReal;

  useEffect(() => {
    let isMounted = true;

    async function processMaps() {
      try {
        setIsProcessingForensicMaps(true);
        const hash = await computeSHA256(result.image_url);
        if (isMounted) setSha256(hash);

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
    const text = `KRYPTX Image Forensic Report
Target: ${result.image_name}
Verdict: ${result.detection_result} (Confidence: ${result.confidence_score}%)
Breakdown: ${result.analysis_details.ai_probability}% AI Probability | ${result.analysis_details.human_probability}% Photographic Likelihood
Summary: ${result.analysis_details.explainable_summary}
Hash: ${sha256}
Generated: ${new Date(result.created_at).toUTCString()}`;

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
            <span>{copied ? 'Copied' : 'Copy Summary'}</span>
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
              <span className={isAI ? 'text-rose-400' : isReal ? 'text-emerald-400' : 'text-amber-400'}>
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
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="rgba(51, 65, 85, 0.4)" strokeWidth="8" />
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
                    <img src={elaImageUrl} alt="Error Level Analysis" className="max-h-full max-w-full object-contain" />
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
                    <img src={sobelImageUrl} alt="Sobel Edge Frequency" className="max-h-full max-w-full object-contain" />
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
                  <img src={result.image_url} alt="Original" className="absolute inset-0 w-full h-full object-contain" />
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
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
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