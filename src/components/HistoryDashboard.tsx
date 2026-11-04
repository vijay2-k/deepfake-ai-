import React, { useState } from 'react';
import {
  History,
  Search,
  Filter,
  Trash2,
  ExternalLink,
  Download,
  AlertTriangle,
  Bot,
  Camera,
  Calendar,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { DetectionResult, DetectionVerdict } from '../types/detector';

interface HistoryDashboardProps {
  records: DetectionResult[];
  onSelectRecord: (record: DetectionResult) => void;
  onDeleteRecord: (id: string) => void;
  onClearAll: () => void;
  onAnalyzeNew: () => void;
}

export const HistoryDashboard: React.FC<HistoryDashboardProps> = ({
  records,
  onSelectRecord,
  onDeleteRecord,
  onClearAll,
  onAnalyzeNew,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [verdictFilter, setVerdictFilter] = useState<string>('all');
  const [mediaTypeFilter, setMediaTypeFilter] = useState<string>('all');

  const filtered = records.filter((r) => {
    const matchesVerdict = verdictFilter === 'all' || r.detection_result === verdictFilter;
    const matchesMedia = mediaTypeFilter === 'all' || (r.media_type || 'image') === mediaTypeFilter;
    const matchesSearch =
      r.image_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.analysis_details.explainable_summary.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesVerdict && matchesMedia && matchesSearch;
  });

  const exportAsJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(records, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `veritas_forensic_history_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8 space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E4DEFF]">
        <div>
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-[#5515D8]" />
            <h2 className="text-2xl font-extrabold text-[#10132F] tracking-tight">Analysis History</h2>
          </div>
          <p className="text-xs text-[#525779] mt-1">
            Persisted forensic examination docket with audit trails, timestamps, and confidence scores.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {records.length > 0 && (
            <>
              <button
                onClick={exportAsJSON}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#E4DEFF] hover:border-[#5515D8] text-xs font-semibold text-[#525779] hover:text-[#10132F] transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                Export JSON
              </button>
              <button
                onClick={onClearAll}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-950/40 border border-rose-900/60 hover:bg-rose-900/50 text-xs font-semibold text-rose-300 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear All
              </button>
            </>
          )}

          <button
            onClick={onAnalyzeNew}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-[#5515D8] to-[#8B32FF] text-white shadow-md shadow-[#5515D8]/20 hover:brightness-110 text-xs font-bold text-white shadow-md shadow-[#5515D8]/10 transition-all"
          >
            New Scan +
          </button>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-[#8C90A8] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by filename or forensic observations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-[#E4DEFF] rounded-xl pl-9 pr-4 py-2 text-xs text-[#10132F] placeholder-[#8C90A8] focus:outline-none focus:border-[#5515D8] transition-colors"
            />
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setMediaTypeFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                mediaTypeFilter === 'all'
                  ? 'bg-[#5515D8] text-white font-bold shadow-sm'
                  : 'bg-white text-[#525779] border border-[#E4DEFF] hover:text-[#10132F]'
              }`}
            >
              All Types
            </button>
            <button
              onClick={() => setMediaTypeFilter('image')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                mediaTypeFilter === 'image'
                  ? 'bg-[#5515D8] text-white font-bold shadow-sm'
                  : 'bg-white text-[#525779] border border-[#E4DEFF] hover:text-[#10132F]'
              }`}
            >
              Images
            </button>
            <button
              onClick={() => setMediaTypeFilter('video')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                mediaTypeFilter === 'video'
                  ? 'bg-[#5515D8] text-white font-bold shadow-sm'
                  : 'bg-white text-[#525779] border border-[#E4DEFF] hover:text-[#10132F]'
              }`}
            >
              Videos
            </button>
            <button
              onClick={() => setMediaTypeFilter('audio')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                mediaTypeFilter === 'audio'
                  ? 'bg-[#5515D8] text-white font-bold shadow-sm'
                  : 'bg-white text-[#525779] border border-[#E4DEFF] hover:text-[#10132F]'
              }`}
            >
              Audio
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <span className="text-[11px] font-bold text-[#8C90A8] uppercase tracking-wider mr-1">Verdict Filter:</span>
          <button
            onClick={() => setVerdictFilter('all')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold whitespace-nowrap transition-all ${
              verdictFilter === 'all'
                ? 'bg-[#0B3526] text-[#5515D8] border border-[#E4DEFF]'
                : 'bg-white text-[#525779] border border-[#E4DEFF] hover:text-[#10132F]'
            }`}
          >
            All Verdicts ({records.length})
          </button>
          <button
            onClick={() => setVerdictFilter('Likely AI Generated')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold whitespace-nowrap transition-all ${
              verdictFilter === 'Likely AI Generated'
                ? 'bg-rose-600 text-white'
                : 'bg-white text-[#525779] border border-[#E4DEFF] hover:text-[#10132F]'
            }`}
          >
            AI / Deepfake / Clone
          </button>
          <button
            onClick={() => setVerdictFilter('Likely Real Photograph')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold whitespace-nowrap transition-all ${
              verdictFilter === 'Likely Real Photograph'
                ? 'bg-[#5515D8] text-white font-bold'
                : 'bg-white text-[#525779] border border-[#E4DEFF] hover:text-[#10132F]'
            }`}
          >
            Authentic / Real
          </button>
          <button
            onClick={() => setVerdictFilter('Inconclusive')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold whitespace-nowrap transition-all ${
              verdictFilter === 'Inconclusive'
                ? 'bg-amber-600 text-white'
                : 'bg-white text-[#525779] border border-[#E4DEFF] hover:text-[#10132F]'
            }`}
          >
            Inconclusive
          </button>
        </div>
      </div>

      {/* History Grid / List */}
      {filtered.length === 0 ? (
        <div className="py-20 text-center rounded-2xl bg-[#F8F7FF] border border-[#E4DEFF] p-8 space-y-3">
          <Layers className="w-10 h-10 text-[#8C90A8] mx-auto" />
          <h3 className="text-base font-bold text-[#10132F]">No Forensic Records Found</h3>
          <p className="text-xs text-[#525779] max-w-sm mx-auto">
            {records.length === 0
              ? 'You have not scanned any images yet. Upload an image or select a specimen to begin.'
              : 'No scanned files match your search query or verdict filter.'}
          </p>
          <button
            onClick={onAnalyzeNew}
            className="mt-3 px-4 py-2 rounded-xl bg-gradient-to-r from-[#5515D8] to-[#8B32FF] text-white shadow-md shadow-[#5515D8]/20 hover:brightness-110 text-xs font-bold text-white shadow-md inline-flex items-center gap-1.5"
          >
            Analyze First Image
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item) => {
            const isAI = item.detection_result === 'Likely AI Generated';
            const isReal = item.detection_result === 'Likely Real Photograph';
            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-[#E4DEFF] hover:border-[#5515D8]/60 transition-all overflow-hidden flex flex-col justify-between group shadow-lg shadow-[#5515D8]/10"
              >
                <div>
                  {/* Thumbnail Banner */}
                  <div className="relative aspect-[16/10] bg-[#F8F7FF] overflow-hidden flex items-center justify-center">
                    <img
                      src={item.image_url}
                      alt={item.image_name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Verdict Pill Badge */}
                    <div className="absolute top-2.5 left-2.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md shadow-md ${
                          isAI
                            ? 'bg-rose-950/80 text-rose-300 border border-rose-500/40'
                            : isReal
                            ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                            : 'bg-amber-950/80 text-amber-300 border border-amber-500/40'
                        }`}
                      >
                        {isAI && <Bot className="w-3 h-3" />}
                        {isReal && <Camera className="w-3 h-3" />}
                        {item.detection_result.replace('Likely ', '')}
                      </span>
                    </div>

                    {/* Confidence percentage badge */}
                    <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-lg bg-[#F8F7FF] border border-[#E4DEFF] text-[10px] font-black text-[#10132F] font-mono backdrop-blur-md">
                      {item.confidence_score}%
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 space-y-2">
                    <h4 className="text-sm font-bold text-[#10132F] truncate" title={item.image_name}>
                      {item.image_name}
                    </h4>

                    <p className="text-xs text-[#525779] line-clamp-2 leading-relaxed">
                      {item.analysis_details.explainable_summary}
                    </p>

                    <div className="pt-2 flex items-center justify-between text-[11px] text-[#8C90A8] font-mono">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(item.created_at).toLocaleDateString()}
                      </span>
                      <span>
                        {item.file_size ? `${(item.file_size / 1024).toFixed(0)} KB` : 'Standard'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="p-3 border-t border-[#E4DEFF] bg-white/60 flex items-center justify-between gap-2">
                  <button
                    onClick={() => onSelectRecord(item)}
                    className="flex-1 py-1.5 px-3 rounded-lg bg-[#5515D8]/10 hover:bg-[#5515D8] text-[#5515D8] hover:text-white border border-[#E4DEFF] text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <span>View Dossier</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteRecord(item.id);
                    }}
                    className="p-1.5 rounded-lg bg-white hover:bg-rose-950 text-[#8C90A8] hover:text-rose-300 border border-[#E4DEFF] transition-colors"
                    title="Delete record"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
