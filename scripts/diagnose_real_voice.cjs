const fs = require('fs');
const path = require('path');

function readWavSamples(wavPath) {
  const buf = fs.readFileSync(wavPath);
  const dataIndex = buf.indexOf('data');
  if (dataIndex === -1) throw new Error('data chunk not found');
  const dataSize = buf.readUInt32LE(dataIndex + 4);
  const pcmBytes = buf.subarray(dataIndex + 8, dataIndex + 8 + dataSize);
  const numSamples = Math.floor(pcmBytes.length / 2);
  const floatSamples = new Float32Array(numSamples);
  for (let i = 0; i < numSamples; i++) {
    floatSamples[i] = pcmBytes.readInt16LE(i * 2) / 32768.0;
  }
  return floatSamples;
}

function analyzeAudio(samples, sampleRate = 16000) {
  const frameLength = Math.floor(sampleRate * 0.025); // 25ms
  const hopSize = Math.floor(sampleRate * 0.010); // 10ms
  const numFrames = Math.floor((samples.length - frameLength) / hopSize);

  let energies = [];
  let zcrs = [];

  for (let f = 0; f < numFrames; f++) {
    const start = f * hopSize;
    let energy = 0;
    let zcr = 0;
    for (let i = 0; i < frameLength; i++) {
      const s = samples[start + i];
      energy += s * s;
      if (i > 0 && ((samples[start + i] >= 0 && samples[start + i - 1] < 0) || (samples[start + i] < 0 && samples[start + i - 1] >= 0))) {
        zcr++;
      }
    }
    energies.push(energy / frameLength);
    zcrs.push(zcr / frameLength);
  }

  // Sort energies to find noise floor
  const sortedE = [...energies].sort((a, b) => a - b);
  const noiseFloor = sortedE[Math.floor(sortedE.length * 0.1)] || 0.00001;
  const peakEnergy = sortedE[Math.floor(sortedE.length * 0.95)] || 0.001;
  const snr = 10 * Math.log10(Math.max(1, peakEnergy / Math.max(0.000001, noiseFloor)));

  const speechThreshold = Math.max(0.0005, noiseFloor * 4);
  let activeSpeechFrames = 0;

  for (let e of energies) {
    if (e > speechThreshold) {
      activeSpeechFrames++;
    }
  }

  const usableSpeechSec = (activeSpeechFrames * hopSize) / sampleRate;
  const totalDurationSec = samples.length / sampleRate;

  console.log('--- SIGNAL METRICS ---');
  console.log('Total Duration:', totalDurationSec.toFixed(2), 's');
  console.log('Usable Speech Duration:', usableSpeechSec.toFixed(2), 's');
  console.log('Active Speech Ratio:', Math.round((usableSpeechSec / totalDurationSec) * 100), '%');
  console.log('Noise Floor Energy:', noiseFloor.toExponential(4));
  console.log('Peak Speech Energy:', peakEnergy.toExponential(4));
  console.log('Estimated SNR:', snr.toFixed(1), 'dB');

  // Let's check pitch and high frequency energy
  // High frequency band (3.5kHz to 8kHz)
  let highFreqEnergy = 0;
  let totalEnergy = 0;
  for (let i = 1; i < samples.length; i++) {
    const diff = samples[i] - samples[i - 1]; // High pass approximation
    highFreqEnergy += diff * diff;
    totalEnergy += samples[i] * samples[i];
  }
  const hfRatio = totalEnergy > 0 ? highFreqEnergy / totalEnergy : 0;
  console.log('HF Energy Ratio (approx >3.5kHz):', hfRatio.toFixed(4));
}

const wavPath = 'C:/Users/Fet Event Tech/Downloads/test_real_voice_16k.wav';
const samples = readWavSamples(wavPath);
analyzeAudio(samples, 16000);

