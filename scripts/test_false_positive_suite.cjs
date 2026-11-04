/**
 * KRYPTX Automated False-Positive Regression Suite
 * Verifies that authentic photographs (portraits, event photos, WhatsApp compressed photos)
 * achieve False Positive Rate (FPR) = 0.0%, while AI-generated media is reliably caught.
 */

const fs = require('fs');
const path = require('path');

const TEST_CASES = [
  {
    name: 'WhatsApp Portrait (Real Photo)',
    path: 'C:/Users/Fet Event Tech/Downloads/WhatsApp Image 2026-11-03 at 9.16.07 PM.jpeg',
    expectedClass: 'Likely Real Photograph',
    maxAiScore: 20,
    minHumanScore: 80,
    expectUndeterminedEngine: true,
  },
  {
    name: 'Cropped Portrait Reference (Real Photo)',
    path: 'C:/Users/Fet Event Tech/Downloads/testing image.jpeg',
    expectedClass: 'Likely Real Photograph',
    maxAiScore: 20,
    minHumanScore: 80,
    expectUndeterminedEngine: true,
  },
  {
    name: 'Synthetic Space Explorer (DALL-E 3 / AI Generation)',
    path: 'C:/Users/Fet Event Tech/Downloads/Space Explorer Birthday Wonderland-1.png',
    expectedClass: 'Likely AI-Generated',
    maxAiScore: 100,
    minHumanScore: 0,
    expectUndeterminedEngine: false,
  },
];

async function runRegressionSuite() {
  console.log('========================================================================');
  console.log('           KRYPTX FORENSIC FALSE-POSITIVE REGRESSION SUITE              ');
  console.log('========================================================================\n');

  let passed = 0;
  let failed = 0;
  let realPhotoCount = 0;
  let falsePositiveCount = 0;

  for (const tc of TEST_CASES) {
    if (!fs.existsSync(tc.path)) {
      console.log(`[SKIP] File not found: ${tc.path}`);
      continue;
    }

    const isReal = tc.expectedClass === 'Likely Real Photograph';
    if (isReal) realPhotoCount++;

    console.log(`Running: "${tc.name}"...`);
    const fileBuffer = fs.readFileSync(tc.path);
    const mime = tc.path.endsWith('.png') ? 'image/png' : 'image/jpeg';
    const blob = new Blob([fileBuffer], { type: mime });
    const formData = new FormData();
    formData.append('file', blob, path.basename(tc.path));

    try {
      const res = await fetch('http://localhost:3000/api/analyze', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      const verdict = data.detection_result;
      const aiScore = data.analysis_details.ai_probability;
      const humanScore = data.analysis_details.human_probability;
      const topEngine = data.analysis_details.generation_sources?.[0]?.engine || 'none';
      const topProb = data.analysis_details.generation_sources?.[0]?.probability ?? 0;

      let testPassed = true;
      let errorReason = '';

      if (isReal) {
        if (verdict !== 'Likely Real Photograph') {
          testPassed = false;
          falsePositiveCount++;
          errorReason += `Verdict mismatch: got "${verdict}", expected "${tc.expectedClass}". `;
        }
        if (aiScore > tc.maxAiScore) {
          testPassed = false;
          errorReason += `AI score too high: ${aiScore}% > ${tc.maxAiScore}%. `;
        }
        if (topEngine !== 'source_undetermined' && topProb > 25) {
          testPassed = false;
          errorReason += `Generator attribution hallucinated: ${topEngine} (${topProb}%). `;
        }
      } else {
        if (verdict !== 'Likely AI-Generated') {
          testPassed = false;
          errorReason += `Verdict mismatch: got "${verdict}", expected "${tc.expectedClass}". `;
        }
        if (aiScore < 70) {
          testPassed = false;
          errorReason += `AI score too low for synthetic media: ${aiScore}%. `;
        }
      }

      if (testPassed) {
        passed++;
        console.log(`  [PASS] Verdict: ${verdict} (${data.confidence_score}% confidence)`);
        console.log(`         AI: ${aiScore}% | Human: ${humanScore}% | Engine: ${topEngine} (${topProb}%)\n`);
      } else {
        failed++;
        console.log(`  [FAIL] ${errorReason}`);
        console.log(`         Got: ${verdict} | AI: ${aiScore}% | Engine: ${topEngine} (${topProb}%)\n`);
      }
    } catch (err) {
      failed++;
      console.log(`  [ERROR] Network / server request failed: ${err.message}\n`);
    }
  }

  const fpr = realPhotoCount > 0 ? ((falsePositiveCount / realPhotoCount) * 100).toFixed(1) : 0;
  console.log('------------------------------------------------------------------------');
  console.log(`SUMMARY: ${passed} Passed, ${failed} Failed`);
  console.log(`False Positive Rate (FPR) on Real Photographs: ${fpr}%`);
  console.log('========================================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runRegressionSuite().catch((err) => {
  console.error('Test suite failed:', err);
  process.exit(1);
});

