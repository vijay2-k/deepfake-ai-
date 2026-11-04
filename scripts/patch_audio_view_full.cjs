const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, '../src/components/DetectionResultView.tsx');
let content = fs.readFileSync(targetPath, 'utf-8');
content = content.replace(/\r\n/g, '\n');

// Find where Neural Vocoder & Spectral DSP Metrics Card ends
const targetMarker = `{/* Cryptographic Hash Bar */}`;

const addition = `{/* PERCEIVED VOICE AGE ESTIMATION CARD */}
            {result.analysis_details.voice_forensics?.perceivedAgeEstimate && (
              <div className="p-4 rounded-xl bg-slate-950/90 border border-purple-500/30 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
                  <span className="text-xs font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    Perceived Voice Age Estimation (Acoustic Resonance Biometrics)
                  </span>
                  <span
                    className={\`px-2 py-0.5 rounded text-[10px] font-mono font-bold \${
                      result.analysis_details.voice_forensics.perceivedAgeEstimate.isAvailable
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }\`}
                  >
                    {result.analysis_details.voice_forensics.perceivedAgeEstimate.isAvailable
                      ? \`Estimated: \${result.analysis_details.voice_forensics.perceivedAgeEstimate.confidenceRating} Confidence\`
                      : 'Unavailable'}
                  </span>
                </div>

                {result.analysis_details.voice_forensics.perceivedAgeEstimate.isAvailable ? (
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between p-3 rounded-lg bg-purple-950/30 border border-purple-900/40">
                      <div>
                        <span className="text-[10px] text-purple-300 font-mono uppercase tracking-wider block">
                          Perceived Vocal Age Bracket
                        </span>
                        <span className="text-base sm:text-lg font-bold text-white">
                          {result.analysis_details.voice_forensics.perceivedAgeEstimate.estimatedAgeRange}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 font-mono block">Resonance Category</span>
                        <span className="text-xs font-semibold text-purple-200">
                          {result.analysis_details.voice_forensics.perceivedAgeEstimate.vocalResonanceCategory}
                        </span>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-400 leading-relaxed italic bg-slate-900/50 p-2.5 rounded-lg border border-slate-800">
                      <strong>Scientific Disclaimer:</strong> {result.analysis_details.voice_forensics.perceivedAgeEstimate.uncertaintyDisclaimer}
                    </p>
                  </div>
                ) : (
                  <div className="p-3 rounded-lg bg-slate-900/40 border border-slate-800 text-xs text-slate-400">
                    <strong>Age Estimation Inactive:</strong> {result.analysis_details.voice_forensics.perceivedAgeEstimate.uncertaintyDisclaimer}
                  </div>
                )}
              </div>
            )}

            {/* VOICE ACOUSTIC CHARACTERISTICS CARD */}
            {result.analysis_details.voice_forensics?.voiceCharacteristics && (
              <div className="p-4 rounded-xl bg-slate-950/90 border border-cyan-500/30 space-y-3">
                <span className="text-xs font-bold text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  Voice Biometric Characteristics & Cadence
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded bg-slate-900 border border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-400 block font-mono">Fundamental Pitch (F0) & Dynamics</span>
                    <span className="text-white font-bold block">
                      {result.analysis_details.voice_forensics.voiceCharacteristics.speakingPitchHz} Hz (σ = ±{result.analysis_details.voice_forensics.voiceCharacteristics.pitchStdDevHz} Hz)
                    </span>
                    <span className="text-[11px] text-cyan-300">
                      {result.analysis_details.voice_forensics.voiceCharacteristics.pitchDynamicsSummary}
                    </span>
                  </div>

                  <div className="p-2.5 rounded bg-slate-900 border border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-400 block font-mono">Speech Rhythm & Density</span>
                    <span className="text-white font-bold block">
                      {result.analysis_details.voice_forensics.voiceCharacteristics.speechRhythm}
                    </span>
                    <span className="text-[11px] text-slate-300">
                      {result.analysis_details.voice_forensics.voiceCharacteristics.pauseCadence}
                    </span>
                  </div>

                  <div className="p-2.5 rounded bg-slate-900 border border-slate-800 space-y-1 sm:col-span-2">
                    <span className="text-[10px] text-slate-400 block font-mono">Acoustic Clarity & Noise Floor</span>
                    <span className="text-emerald-300 font-semibold">
                      {result.analysis_details.voice_forensics.voiceCharacteristics.voiceClarity}
                    </span>
                  </div>
                </div>
              </div>
            )}

            `;

if (content.includes(targetMarker)) {
  content = content.replace(targetMarker, addition + targetMarker);
  fs.writeFileSync(targetPath, content, 'utf-8');
  console.log('Successfully updated AudioForensicsView with Perceived Age & Voice Characteristics.');
} else {
  console.error('Target marker not found in DetectionResultView.tsx');
}

