const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, '../src/components/DetectionResultView.tsx');
let content = fs.readFileSync(targetPath, 'utf-8');

// 1. AudioForensicsView enhancements
// Add VAD & DSP cards to AudioForensicsView right after the Frequency Spectrum Card
const audioFreqTarget = `<p className="text-xs text-slate-400 leading-relaxed">
                {result.analysis_details.spectral_and_prosody_notes ||
                  'High-frequency harmonics evaluated. Neural vocoders (e.g. WaveNet, HiFi-GAN) exhibit unnatural acoustic roll-off above 8kHz-12kHz compared to physical acoustic recordings.'}
              </p>
            </div>`;

const audioFreqReplacement = `<p className="text-xs text-slate-400 leading-relaxed">
                {result.analysis_details.spectral_and_prosody_notes ||
                  'High-frequency harmonics evaluated. Neural vocoders (e.g. WaveNet, HiFi-GAN) exhibit unnatural acoustic roll-off above 8kHz-12kHz compared to physical acoustic recordings.'}
              </p>
            </div>

            {/* Voice Activity Detection (VAD) & Usable Speech Meter */}
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

// 2. Fix Audio Artifacts tab and timeline tab
const audioTabsTarget = `              {/* Tab 2: Voice Artifacts */}
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
                              className={\`text-[10px] font-bold px-2 py-0.5 rounded uppercase \${
                                seg.syntheticLikelihood > 50
                                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              }\`}
                            >`;

const audioTabsReplacement = `              {/* Tab 2: Voice Artifacts */}
              {activeTab === 'artifacts' && (
                <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-indigo-400 flex items-center gap-1">
                      <Radio className="w-3 h-3" />
                      Vocoder Phase & Neural Synthesis Artifacts
                    </span>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {result.analysis_details.voice_cloning_assessment ||
                        'Neural vocoder reconstruction exhibits characteristic metallic phase buzz and high-frequency energy discontinuity in the 3.5kHz–8kHz frequency range.'}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-indigo-400 flex items-center gap-1">
                      <Activity className="w-3 h-3" />
                      Prosody & Pitch Dynamics
                    </span>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {result.analysis_details.spectral_and_prosody_notes ||
                        'Natural human micro-tremors, sub-harmonic pitch inflections, and formant transitions evaluated across sustained vocalizations.'}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-indigo-400 flex items-center gap-1">
                      <Mic className="w-3 h-3" />
                      Glottal Airflow & Breath Dynamics
                    </span>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Pre-phonation inhalation cadence, vocal fold closure turbulence, and aerodynamic breath pauses verified against authentic physiological models.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-indigo-400 flex items-center gap-1">
                      <Volume2 className="w-3 h-3" />
                      Acoustic Reverberation & Room Impulse Response
                    </span>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Spatial room impulse response decay, microphone proximity effect, and background environmental noise floor continuity analyzed.
                    </p>
                  </div>
                </div>
              )}

              {/* Tab 3: Suspicious Audio Segments Timeline */}
              {activeTab === 'timeline' && (
                <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
                  <span className="text-xs text-slate-400 font-semibold block">
                    VAD Timestamped Speech Segment Audit
                  </span>
                  {result.analysis_details.voice_forensics?.segments && result.analysis_details.voice_forensics.segments.length > 0 ? (
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
                  ) : (result.analysis_details.audio_segments || []).length === 0 ? (
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
                              className={\`text-[10px] font-bold px-2 py-0.5 rounded uppercase \${
                                seg.syntheticLikelihood > 50
                                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              }\`}
                            >`;

// 3. ImageForensicsView enhancements
// Add Resolution, Quality, and Patch Analysis card right below the Cryptographic Hash Bar in ImageForensicsView
const imageHashTarget = `            {/* Cryptographic Hash Bar */}
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
        </div>`;

const imageHashReplacement = `            {/* Cryptographic Hash Bar */}
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

          {/* Image Quality & Crop Sufficiency Diagnostics */}
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
          )}
        </div>`;

// Apply replacements
function replaceChunk(str, target, replacement, label) {
  // Normalize line breaks
  const normStr = str.replace(/\r\n/g, '\n');
  const normTarget = target.replace(/\r\n/g, '\n');
  const normRep = replacement.replace(/\r\n/g, '\n');

  if (normStr.includes(normTarget)) {
    console.log(`[Success] Replaced: ${label}`);
    return normStr.replace(normTarget, normRep);
  } else {
    console.warn(`[Warning] Could not match target for: ${label}`);
    return normStr;
  }
}

content = replaceChunk(content, audioFreqTarget, audioFreqReplacement, 'Audio VAD & DSP Cards');
content = replaceChunk(content, audioTabsTarget, audioTabsReplacement, 'Audio Tabs Clean Separation');
content = replaceChunk(content, imageHashTarget, imageHashReplacement, 'Image Quality & Patch Grid');

fs.writeFileSync(targetPath, content, 'utf-8');
console.log('DetectionResultView.tsx update completed.');
