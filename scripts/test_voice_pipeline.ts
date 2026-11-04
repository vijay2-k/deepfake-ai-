import fs from 'fs';
import { runVoiceForensicPipeline, probeAudioMetadata } from '../src/utils/audioForensics';

async function main() {
  const oggPath = 'C:/Users/Fet Event Tech/Downloads/test real voice.ogg';
  const buffer = fs.readFileSync(oggPath);
  console.log('Testing file:', oggPath, 'Size:', buffer.length);
  
  const meta = await probeAudioMetadata(oggPath);
  console.log('Probe metadata:', meta);
  
  const result = await runVoiceForensicPipeline(oggPath, buffer);
  console.log('\n--- PIPELINE RESULT ---');
  console.log('Verdict:', result.verdict);
  console.log('Confidence:', result.calibratedConfidence);
  console.log('AI Probability:', result.aiProbability);
  console.log('Human Probability:', result.humanProbability);
  console.log('Quality:', result.quality);
  console.log('Spectral Metrics:', result.spectralMetrics);
  console.log('Segments:', result.segments);
  console.log('Evidence:', result.evidenceSummary);
}

main().catch(console.error);

