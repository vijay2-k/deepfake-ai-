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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-400" />
            <h2 className="text-2xl font-extrabold text-white tracking-tight">Analysis History</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Persisted forensic examination docket with audit trails, timestamps, and confidence scores.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {records.length > 0 && (
            <>
              <button
                onClick={exportAsJSON}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition-all"
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
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-sm transition-all"
          >
            New Scan +
          </button>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by filename or forensic observations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900/80 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setMediaTypeFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                mediaTypeFilter === 'all'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
              }`}
            >
              All Types
            </button>
            <button
              onClick={() => setMediaTypeFilter('image')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                mediaTypeFilter === 'image'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
              }`}
            >
              Images
            </button>
            <button
              onClick={() => setMediaTypeFilter('video')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                mediaTypeFilter === 'video'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
              }`}
            >
              Videos
            </button>
            <button
              onClick={() => setMediaTypeFilter('audio')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                mediaTypeFilter === 'audio'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
              }`}
            >
              Audio
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mr-1">Verdict Filter:</span>
          <button
            onClick={() => setVerdictFilter('all')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold whitespace-nowrap transition-all ${
              verdictFilter === 'all'
                ? 'bg-slate-700 text-white'
                : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            All Verdicts ({records.length})
          </button>
          <button
            onClick={() => setVerdictFilter('Likely AI Generated')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold whitespace-nowrap transition-all ${
              verdictFilter === 'Likely AI Generated'
                ? 'bg-rose-600 text-white'
                : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            AI / Deepfake / Clone
          </button>
          <button
            onClick={() => setVerdictFilter('Likely Real Photograph')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold whitespace-nowrap transition-all ${
              verdictFilter === 'Likely Real Photograph'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            Authentic / Real
          </button>
          <button
            onClick={() => setVerdictFilter('Inconclusive')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold whitespace-nowrap transition-all ${
              verdictFilter === 'Inconclusive'
                ? 'bg-amber-600 text-white'
                : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            Inconclusive
          </button>
        </div>
      </div>

      {/* History Grid / List */}
      {filtered.length === 0 ? (
        <div className="py-20 text-center rounded-2xl bg-slate-900/40 border border-slate-800/80 p-8 space-y-3">
          <Layers className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No Forensic Records Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {records.length === 0
              ? 'You have not scanned any images yet. Upload an image or select a specimen to begin.'
              : 'No scanned files match your search query or verdict filter.'}
          </p>
          <button
            onClick={onAnalyzeNew}
            className="mt-3 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-md inline-flex items-center gap-1.5"
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
                className="bg-slate-900/90 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all overflow-hidden flex flex-col justify-between group shadow-lg shadow-black/20"
              >
                <div>
                  {/* Thumbnail Banner */}
                  <div className="relative aspect-[16/10] bg-slate-950 overflow-hidden flex items-center justify-center">
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
                    <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-lg bg-slate-950/80 border border-slate-800 text-[10px] font-black text-white font-mono backdrop-blur-md">
                      {item.confidence_score}%
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 space-y-2">
                    <h4 className="text-sm font-bold text-white truncate" title={item.image_name}>
                      {item.image_name}
                    </h4>

                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {item.analysis_details.explainable_summary}
                    </p>

                    <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500 font-mono">
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
                <div className="p-3 border-t border-slate-800/80 bg-slate-950/40 flex items-center justify-between gap-2">
                  <button
                    onClick={() => onSelectRecord(item)}
                    className="flex-1 py-1.5 px-3 rounded-lg bg-indigo-600/10 hover:bg-indigo-600 text-indigo-400 hover:text-white border border-indigo-500/20 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                  >
                    <span>View Dossier</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteRecord(item.id);
                    }}
                    className="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-950 text-slate-400 hover:text-rose-300 border border-slate-800 transition-colors"
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
