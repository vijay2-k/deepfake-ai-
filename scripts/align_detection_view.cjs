const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, '../src/components/DetectionResultView.tsx');
let content = fs.readFileSync(targetPath, 'utf-8');

// Normalize line breaks
content = content.replace(/\r\n/g, '\n');

// 1. Voice Forensics Card & Metrics
const vadOldBlock = `{/* Voice Activity Detection (VAD) & Usable Speech Meter */}
            {result.analysis_details.voice_forensics && (
              <div className="p-4 rounded-xl bg-slate-950/90 border border-cyan-500/30 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-bold text-white flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-cyan-400" />
                    Voice Activity Detection (VAD) & Usable Speech
                  </span>
                  <span
                    className={\`px-2 py-0.5 rounded text-[10px] font-mono font-bold \${
                      result.analysis_details.voice_forensics.isSpeechDurationSufficient
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }\`}
                  >
                    {result.analysis_details.voice_forensics.isSpeechDurationSufficient
                      ? '✓ Usable Speech >= 1.5s'
                      : '⚠ Insufficient Usable Speech (<1.5s)'}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-[11px]">
                  <div className="p-2 rounded bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">Total Duration</span>
                    <span className="text-white font-bold">
                      {result.analysis_details.voice_forensics.totalDurationSec.toFixed(2)}s
                    </span>
                  </div>
                  <div className="p-2 rounded bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">Usable Speech (VAD)</span>
                    <span className="text-cyan-300 font-bold">
                      {result.analysis_details.voice_forensics.usableSpeechSec.toFixed(2)}s
                    </span>
                  </div>
                  <div className="p-2 rounded bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">Speech Density</span>
                    <span className="text-indigo-300 font-bold">
                      {Math.round(result.analysis_details.voice_forensics.speechRatio * 100)}%
                    </span>
                  </div>
                  <div className="p-2 rounded bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">Signal-to-Noise (SNR)</span>
                    <span className="text-emerald-300 font-bold">
                      {result.analysis_details.voice_forensics.snrDb.toFixed(1)} dB
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>Voiced Audio Activity</span>
                    <span>{result.analysis_details.voice_forensics.usableSpeechSec.toFixed(2)}s / {result.analysis_details.voice_forensics.totalDurationSec.toFixed(2)}s</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full"
                      style={{ width: \`\${Math.min(100, Math.round(result.analysis_details.voice_forensics.speechRatio * 100))}%\` }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Neural Vocoder & Spectral DSP Metrics Card */}
            {result.analysis_details.voice_forensics && (
              <div className="p-4 rounded-xl bg-slate-950/90 border border-indigo-500/30 space-y-3">
                <span className="text-xs font-bold text-white flex items-center gap-2">
                  <Radio className="w-4 h-4 text-indigo-400" />
                  Neural Vocoder & DSP Spectral Harmonics (3.5 kHz - 8.0 kHz)
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[11px]">
                  <div className="p-2 rounded bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">Phase Jitter Score</span>
                    <span
                      className={\`font-bold \${
                        result.analysis_details.voice_forensics.vocoderPhaseMetallicScore > 50
                          ? 'text-rose-400'
                          : 'text-emerald-400'
                      }\`}
                    >
                      {result.analysis_details.voice_forensics.vocoderPhaseMetallicScore}/100
                    </span>
                  </div>
                  <div className="p-2 rounded bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">Spectral Centroid</span>
                    <span className="text-slate-200 font-bold">
                      {Math.round(result.analysis_details.voice_forensics.spectralCentroidHz)} Hz
                    </span>
                  </div>
                  <div className="p-2 rounded bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">Spectral Rolloff</span>
                    <span className="text-slate-200 font-bold">
                      {Math.round(result.analysis_details.voice_forensics.spectralRolloffHz)} Hz
                    </span>
                  </div>
                  <div className="p-2 rounded bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">Pitch F0 Variance</span>
                    <span className="text-indigo-300 font-bold">
                      ±{result.analysis_details.voice_forensics.f0StdDevHz.toFixed(1)} Hz
                    </span>
                  </div>
                </div>
              </div>
            )}`;

const vadNewBlock = `{/* Voice Activity Detection (VAD) & Usable Speech Meter */}
            {result.analysis_details.voice_forensics && (
              <div className="p-4 rounded-xl bg-slate-950/90 border border-cyan-500/30 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-bold text-white flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-cyan-400" />
                    Voice Activity Detection (VAD) & Usable Speech
                  </span>
                  <span
                    className={\`px-2 py-0.5 rounded text-[10px] font-mono font-bold \${
                      result.analysis_details.voice_forensics.isDurationSufficient
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }\`}
                  >
                    {result.analysis_details.voice_forensics.isDurationSufficient
                      ? '✓ Usable Speech >= 1.5s'
                      : '⚠ Insufficient Usable Speech (<1.5s)'}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-[11px]">
                  <div className="p-2 rounded bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">Total Duration</span>
                    <span className="text-white font-bold">
                      {result.analysis_details.voice_forensics.totalDurationSec.toFixed(2)}s
                    </span>
                  </div>
                  <div className="p-2 rounded bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">Usable Speech (VAD)</span>
                    <span className="text-cyan-300 font-bold">
                      {result.analysis_details.voice_forensics.usableSpeechSec.toFixed(2)}s
                    </span>
                  </div>
                  <div className="p-2 rounded bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">Speech Density</span>
                    <span className="text-indigo-300 font-bold">
                      {Math.round(result.analysis_details.voice_forensics.speechRatioPct)}%
                    </span>
                  </div>
                  <div className="p-2 rounded bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">Signal-to-Noise (SNR)</span>
                    <span className="text-emerald-300 font-bold">
                      {result.analysis_details.voice_forensics.snrDb.toFixed(1)} dB
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>Voiced Audio Activity</span>
                    <span>{result.analysis_details.voice_forensics.usableSpeechSec.toFixed(2)}s / {result.analysis_details.voice_forensics.totalDurationSec.toFixed(2)}s</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full"
                      style={{ width: \`\${Math.min(100, Math.round(result.analysis_details.voice_forensics.speechRatioPct))}%\` }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Neural Vocoder & Spectral DSP Metrics Card */}
            {result.analysis_details.voice_forensics && (
              <div className="p-4 rounded-xl bg-slate-950/90 border border-indigo-500/30 space-y-3">
                <span className="text-xs font-bold text-white flex items-center gap-2">
                  <Radio className="w-4 h-4 text-indigo-400" />
                  Neural Vocoder & DSP Spectral Harmonics (3.5 kHz - 8.0 kHz)
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[11px]">
                  <div className="p-2 rounded bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">Phase Jitter Score</span>
                    <span
                      className={\`font-bold \${
                        result.analysis_details.voice_forensics.vocoderPhaseMetallicScore > 50
                          ? 'text-rose-400'
                          : 'text-emerald-400'
                      }\`}
                    >
                      {result.analysis_details.voice_forensics.vocoderPhaseMetallicScore}/100
                    </span>
                  </div>
                  <div className="p-2 rounded bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">Spectral Centroid</span>
                    <span className="text-slate-200 font-bold">
                      {Math.round(result.analysis_details.voice_forensics.spectralCentroidHz)} Hz
                    </span>
                  </div>
                  <div className="p-2 rounded bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">Spectral Rolloff</span>
                    <span className="text-slate-200 font-bold">
                      {Math.round(result.analysis_details.voice_forensics.spectralRolloffHz)} Hz
                    </span>
                  </div>
                  <div className="p-2 rounded bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">Pitch F0 Variance</span>
                    <span className="text-indigo-300 font-bold">
                      ±{result.analysis_details.voice_forensics.pitchF0Variance.toFixed(1)} Hz
                    </span>
                  </div>
                </div>
              </div>
            )}`;

content = content.replace(vadOldBlock, vadNewBlock);

// 2. Fix Voice Forensics Segments in timeline tab
const oldTimelineBlock = `{result.analysis_details.voice_forensics?.segments && result.analysis_details.voice_forensics.segments.length > 0 ? (
                    <div className="space-y-2">
                      {result.analysis_details.voice_forensics.segments.map((seg, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start justify-between gap-3"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950/80 text-indigo-300 border border-indigo-800 font-bold">
                                {seg.startTimeSec.toFixed(1)}s - {seg.endTimeSec.toFixed(1)}s
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">
                                Speech Density: {Math.round(seg.speechRatio * 100)}%
                              </span>
                            </div>
                            <p className="text-xs text-slate-300 leading-normal">{seg.reason}</p>
                          </div>

                          <div className="shrink-0 text-right">
                            <span
                              className={\`text-[10px] font-bold px-2 py-0.5 rounded uppercase \${
                                seg.isSuspicious
                                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              }\`}
                            >
                              {seg.isSuspicious ? \`Phase Risk: \${seg.vocoderArtifactScore}\` : 'Clean Segment'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) :`;

const newTimelineBlock = `{result.analysis_details.voice_forensics?.segments && result.analysis_details.voice_forensics.segments.length > 0 ? (
                    <div className="space-y-2">
                      {result.analysis_details.voice_forensics.segments.map((seg, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start justify-between gap-3"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950/80 text-indigo-300 border border-indigo-800 font-bold">
                                {seg.startTime} - {seg.endTime}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">
                                Usable Speech: {seg.isUsableSpeech ? 'Yes' : 'Silence/Noise'}
                              </span>
                            </div>
                            <p className="text-xs text-slate-300 leading-normal">{seg.finding}</p>
                          </div>

                          <div className="shrink-0 text-right">
                            <span
                              className={\`text-[10px] font-bold px-2 py-0.5 rounded uppercase \${
                                seg.vocoderArtifactsFound || seg.syntheticScore > 50
                                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              }\`}
                            >
                              {seg.vocoderArtifactsFound ? \`Vocoder Alert: \${seg.syntheticScore}\` : 'Clean Speech'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) :`;

content = content.replace(oldTimelineBlock, newTimelineBlock);

// 3. Fix Image Quality & Patch Grid
const oldImgBlock = `{/* Image Quality & Crop Sufficiency Diagnostics */}
          {result.analysis_details.image_quality && (
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 shadow-xl space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-white flex items-center gap-2">
                  <Camera className="w-4 h-4 text-cyan-400" />
                  Resolution, Sharpness & Crop Sufficiency
                </span>
                <span
                  className={\`px-2 py-0.5 rounded text-[10px] font-mono font-bold \${
                    result.analysis_details.image_quality.isResolutionSufficient
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }\`}
                >
                  {result.analysis_details.image_quality.isResolutionSufficient
                    ? '✓ Resolution Usable'
                    : '⚠ Insufficient Resolution (<140px)'}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[11px]">
                <div className="p-2 rounded bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 text-[10px] block">Dimensions</span>
                  <span className="text-white font-bold">
                    {result.analysis_details.image_quality.width} × {result.analysis_details.image_quality.height}
                  </span>
                </div>
                <div className="p-2 rounded bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 text-[10px] block">Megapixels</span>
                  <span className="text-cyan-300 font-bold">
                    {result.analysis_details.image_quality.megapixels} MP
                  </span>
                </div>
                <div className="p-2 rounded bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 text-[10px] block">Laplacian Blur Var</span>
                  <span className="text-indigo-300 font-bold">
                    {Math.round(result.analysis_details.image_quality.laplacianVariance)}
                  </span>
                </div>
                <div className="p-2 rounded bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 text-[10px] block">Sharpness Eval</span>
                  <span className="text-emerald-300 font-bold text-[10px] truncate block">
                    {result.analysis_details.image_quality.sharpnessAssessment}
                  </span>
                </div>
              </div>

              {result.analysis_details.image_quality.isCroppedOrPartial && (
                <div className="p-2.5 rounded-lg bg-amber-950/30 border border-amber-900/40 text-xs text-amber-300/90 flex items-center gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>
                    Crop / Partial image detected. Calibrated patch-level analysis aggregated to prevent false positives from localized framing.
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Overlapping Patch-Level Anomaly Aggregation Matrix */}
          {result.analysis_details.patch_analysis && (
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 shadow-xl space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-400" />
                  Overlapping Patch-Level Forensic Grid ({result.analysis_details.patch_analysis.totalPatches} Patches)
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  Suspicious: {result.analysis_details.patch_analysis.suspiciousPatchCount} / {result.analysis_details.patch_analysis.totalPatches}
                </span>
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-1.5 p-2 bg-slate-950 rounded-xl border border-slate-800">
                {result.analysis_details.patch_analysis.patches.slice(0, 24).map((p, idx) => (
                  <div
                    key={idx}
                    className={\`p-1.5 rounded text-center font-mono text-[9px] border transition-all \${
                      p.isSuspicious
                        ? 'bg-rose-950/80 border-rose-600/80 text-rose-300 shadow-sm'
                        : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:border-slate-700'
                    }\`}
                    title={\`Patch \${p.patchIndex}: Anomaly Score \${p.anomalyScore}/100\`}
                  >
                    <div>#{p.patchIndex}</div>
                    <div className="font-bold">{p.anomalyScore}</div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                <span>Peak Anomaly Score: {result.analysis_details.patch_analysis.maxPatchAnomalyScore}/100</span>
                <span>Mean Anomaly: {result.analysis_details.patch_analysis.meanPatchAnomalyScore}/100</span>
              </div>
            </div>
          )}`;

const newImgBlock = `{/* Image Quality & Crop Sufficiency Diagnostics */}
          {result.analysis_details.image_quality && (
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 shadow-xl space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-white flex items-center gap-2">
                  <Camera className="w-4 h-4 text-cyan-400" />
                  Resolution, Sharpness & Crop Sufficiency
                </span>
                <span
                  className={\`px-2 py-0.5 rounded text-[10px] font-mono font-bold \${
                    result.analysis_details.image_quality.sufficiency === 'sufficient'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : result.analysis_details.image_quality.sufficiency === 'marginal'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  }\`}
                >
                  {result.analysis_details.image_quality.sufficiency === 'sufficient'
                    ? '✓ Resolution Sufficient'
                    : result.analysis_details.image_quality.sufficiency === 'marginal'
                    ? '⚠ Marginal Resolution'
                    : '⚠ Insufficient Resolution (<140px)'}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[11px]">
                <div className="p-2 rounded bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 text-[10px] block">Dimensions</span>
                  <span className="text-white font-bold">
                    {result.analysis_details.image_quality.width} × {result.analysis_details.image_quality.height}
                  </span>
                </div>
                <div className="p-2 rounded bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 text-[10px] block">Megapixels</span>
                  <span className="text-cyan-300 font-bold">
                    {result.analysis_details.image_quality.megapixels.toFixed(2)} MP
                  </span>
                </div>
                <div className="p-2 rounded bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 text-[10px] block">Blur Index</span>
                  <span className="text-indigo-300 font-bold">
                    {Math.round(result.analysis_details.image_quality.blurIndex)} ({result.analysis_details.image_quality.isBlurry ? 'Blurry' : 'Sharp'})
                  </span>
                </div>
                <div className="p-2 rounded bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 text-[10px] block">Quality Factor</span>
                  <span className="text-emerald-300 font-bold text-[10px] truncate block">
                    Q ~ {Math.round(result.analysis_details.image_quality.estimatedQualityFactor)}%
                  </span>
                </div>
              </div>

              {result.analysis_details.image_quality.isPartialOrCrop && (
                <div className="p-2.5 rounded-lg bg-amber-950/30 border border-amber-900/40 text-xs text-amber-300/90 flex items-center gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>
                    Crop / Partial image detected (Risk: {result.analysis_details.image_quality.cropRiskFactor}). Calibrated patch-level analysis aggregated to prevent false positives from localized framing.
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Overlapping Patch-Level Anomaly Aggregation Matrix */}
          {result.analysis_details.patch_analysis && (
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 shadow-xl space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-400" />
                  Overlapping Patch-Level Forensic Grid ({result.analysis_details.patch_analysis.patchesExtracted} Patches)
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  Suspicious: {result.analysis_details.patch_analysis.suspiciousPatchesCount} / {result.analysis_details.patch_analysis.patchesExtracted}
                </span>
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-1.5 p-2 bg-slate-950 rounded-xl border border-slate-800">
                {result.analysis_details.patch_analysis.patchGrid.slice(0, 24).map((p, idx) => (
                  <div
                    key={idx}
                    className={\`p-1.5 rounded text-center font-mono text-[9px] border transition-all \${
                      p.isSuspicious
                        ? 'bg-rose-950/80 border-rose-600/80 text-rose-300 shadow-sm'
                        : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:border-slate-700'
                    }\`}
                    title={\`Patch \${p.patchIndex}: Synthetic Score \${p.syntheticScore}/100\`}
                  >
                    <div>#{p.patchIndex}</div>
                    <div className="font-bold">{p.syntheticScore}</div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                <span>Aggregate Patch Score: {result.analysis_details.patch_analysis.patchAggregationScore}/100</span>
                <span>Suspicious Ratio: {Math.round((result.analysis_details.patch_analysis.suspiciousPatchesCount / Math.max(1, result.analysis_details.patch_analysis.patchesExtracted)) * 100)}%</span>
              </div>
            </div>
          )}`;

content = content.replace(oldImgBlock, newImgBlock);

fs.writeFileSync(targetPath, content, 'utf-8');
console.log('DetectionResultView.tsx properties aligned with detector.ts successfully.');

