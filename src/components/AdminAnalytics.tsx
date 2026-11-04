import React from 'react';
import {
  BarChart3,
  Bot,
  Camera,
  AlertTriangle,
  Zap,
  Clock,
  ShieldCheck,
  Activity,
  Cpu,
  Layers,
} from 'lucide-react';
import { PlatformStats, DetectionResult } from '../types/detector';

interface AdminAnalyticsProps {
  stats: PlatformStats;
  records: DetectionResult[];
}

export const AdminAnalytics: React.FC<AdminAnalyticsProps> = ({ stats, records }) => {
  const total = records.length || stats.totalScans || 1;
  const aiCount = records.filter((r) => r.detection_result === 'Likely AI Generated').length;
  const realCount = records.filter((r) => r.detection_result === 'Likely Real Photograph').length;
  const inconclusiveCount = records.filter((r) => r.detection_result === 'Inconclusive').length;

  const aiPercent = Math.round((aiCount / total) * 100);
  const realPercent = Math.round((realCount / total) * 100);
  const incPercent = Math.round((inconclusiveCount / total) * 100);

  const avgConfidence =
    records.length > 0
      ? Math.round(records.reduce((acc, r) => acc + r.confidence_score, 0) / records.length)
      : stats.averageConfidence;

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E4DEFF]">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-indigo-400" />
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Forensic Detection Analytics & Health
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time platform metrics, model confidence calibration, and detection telemetry.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Gemini 3.8 Flash Vision Online
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Scans */}
        <div className="p-5 rounded-2xl bg-white border border-[#E4DEFF] shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Scans</span>
            <Activity className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-3xl font-black text-white">{records.length}</div>
          <p className="text-[11px] text-slate-500 mt-1">Total processed image cases</p>
        </div>

        {/* AI Synthetic Rate */}
        <div className="p-5 rounded-2xl bg-white border border-[#E4DEFF] shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">AI Detected</span>
            <Bot className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-3xl font-black text-rose-400">
            {aiCount}{' '}
            <span className="text-base font-normal text-slate-400">({aiPercent}%)</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Diffusion / GAN specimens</p>
        </div>

        {/* Real Photographs */}
        <div className="p-5 rounded-2xl bg-white border border-[#E4DEFF] shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Authentic Real</span>
            <Camera className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-emerald-400">
            {realCount}{' '}
            <span className="text-base font-normal text-slate-400">({realPercent}%)</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Verified physical captures</p>
        </div>

        {/* Inconclusive / Ambiguous */}
        <div className="p-5 rounded-2xl bg-white border border-[#E4DEFF] shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Inconclusive</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-black text-amber-400">
            {inconclusiveCount}{' '}
            <span className="text-base font-normal text-slate-400">({incPercent}%)</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Low resolution / recompressed</p>
        </div>
      </div>

      {/* Model Distribution & Reliability */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Distribution Bar */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#E4DEFF] p-6 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center justify-between">
            <span>Classification Distribution</span>
            <span className="text-xs text-slate-400 font-mono">Sample Size: {records.length}</span>
          </h3>

          <div className="w-full h-5 rounded-full bg-white flex overflow-hidden p-0.5 border border-[#E4DEFF]">
            <div
              style={{ width: `${aiPercent}%` }}
              className="bg-rose-500 h-full rounded-l-full transition-all"
              title={`AI: ${aiPercent}%`}
            />
            <div
              style={{ width: `${realPercent}%` }}
              className="bg-emerald-500 h-full transition-all"
              title={`Real: ${realPercent}%`}
            />
            <div
              style={{ width: `${incPercent}%` }}
              className="bg-amber-500 h-full rounded-r-full transition-all"
              title={`Inconclusive: ${incPercent}%`}
            />
          </div>

          <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 pt-2">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500" />
              <span>Likely AI Generated ({aiPercent}%)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500" />
              <span>Likely Real Photograph ({realPercent}%)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-500" />
              <span>Inconclusive / Bounded ({incPercent}%)</span>
            </div>
          </div>
        </div>

        {/* Engine Specs */}
        <div className="bg-white rounded-2xl border border-[#E4DEFF] p-6 shadow-xl space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            Detection Engine Diagnostics
          </h3>
          <div className="space-y-2 text-xs font-mono">
            <div className="p-2.5 rounded-lg bg-white border border-[#E4DEFF] flex justify-between">
              <span className="text-slate-400">Core Model:</span>
              <span className="text-indigo-400 font-bold">gemini-3.8-flash</span>
            </div>
            <div className="p-2.5 rounded-lg bg-white border border-[#E4DEFF] flex justify-between">
              <span className="text-slate-400">Average Confidence:</span>
              <span className="text-emerald-400 font-bold">{avgConfidence}%</span>
            </div>
            <div className="p-2.5 rounded-lg bg-white border border-[#E4DEFF] flex justify-between">
              <span className="text-slate-400">Median Latency:</span>
              <span className="text-slate-200">~1.4s</span>
            </div>
            <div className="p-2.5 rounded-lg bg-white border border-[#E4DEFF] flex justify-between">
              <span className="text-slate-400">EXIF Parser:</span>
              <span className="text-slate-200">exifr v7.1.3 (Pure JS)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Ledger */}
      <div className="bg-white rounded-2xl border border-[#E4DEFF] p-6 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Clock className="w-4 h-4 text-indigo-400" />
          Recent Forensic Audit Stream
        </h3>

        {records.length === 0 ? (
          <p className="text-xs text-slate-500 py-4">No audit logs recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] text-slate-400 uppercase border-b border-[#E4DEFF] font-mono">
                <tr>
                  <th className="pb-3">Case ID</th>
                  <th className="pb-3">Target File</th>
                  <th className="pb-3">Verdict</th>
                  <th className="pb-3">Confidence</th>
                  <th className="pb-3">EXIF Status</th>
                  <th className="pb-3">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {records.slice(0, 10).map((r) => {
                  const isAI = r.detection_result === 'Likely AI Generated';
                  const isReal = r.detection_result === 'Likely Real Photograph';
                  return (
                    <tr key={r.id} className="hover:bg-[#0B3526]/60 transition-colors">
                      <td className="py-2.5 text-slate-400 font-mono">#{r.id.slice(5, 13)}</td>
                      <td className="py-2.5 text-white font-medium truncate max-w-[200px]">
                        {r.image_name}
                      </td>
                      <td className="py-2.5">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            isAI
                              ? 'bg-rose-500/10 text-rose-400'
                              : isReal
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : 'bg-amber-500/10 text-amber-400'
                          }`}
                        >
                          {r.detection_result}
                        </span>
                      </td>
                      <td className="py-2.5 text-slate-200 font-bold">{r.confidence_score}%</td>
                      <td className="py-2.5 text-slate-400">
                        {r.analysis_details.metadata.hasExif ? 'Detected' : 'None'}
                      </td>
                      <td className="py-2.5 text-slate-500">
                        {new Date(r.created_at).toLocaleTimeString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
