const fs = require('fs');

async function testApiAnalyze() {
  const filePath = 'C:/Users/Fet Event Tech/Downloads/testing image.jpeg';
  if (!fs.existsSync(filePath)) {
    console.error('File not found:', filePath);
    process.exit(1);
  }

  const fileBuffer = fs.readFileSync(filePath);
  const blob = new Blob([fileBuffer], { type: 'image/jpeg' });
  const formData = new FormData();
  formData.append('file', blob, 'testing image.jpeg');
  formData.append('diagnostic', 'true');

  console.log('Sending testing image.jpeg to http://localhost:3000/api/analyze...');

  try {
    const res = await fetch('http://localhost:3000/api/analyze?diagnostic=true', {
      method: 'POST',
      body: formData,
    });

    console.log('Status Code:', res.status);
    const json = await res.json();
    const record = json.record || json;

    console.log('\n======================================================');
    console.log('  KRYPTX FORENSIC ANALYSIS REPORT');
    console.log('======================================================');
    console.log('Target Image:', record.image_name);
    console.log('Detection Verdict:', record.detection_result);
    console.log('Calibrated Confidence:', record.confidence_score + '%');
    console.log('Local Manipulation Likelihood:', record.analysis_details.local_manipulation_likelihood + '%');
    console.log('Camera Sensor Evidence:', record.analysis_details.authentic_camera_evidence + '%');
    console.log('Whole-Image AI Likelihood:', record.analysis_details.whole_image_ai_likelihood + '%');
    console.log('AI Probability:', record.analysis_details.ai_probability + '%');
    console.log('Human Probability:', record.analysis_details.human_probability + '%');
    console.log('\n--- Regional Forensic Breakdown ---');
    if (record.analysis_details.regional_analysis) {
      console.log('1. Background Assessment:', record.analysis_details.regional_analysis.backgroundAssessment);
      console.log('2. Face Assessment:', record.analysis_details.regional_analysis.faceAssessment);
      console.log('3. Clothing Assessment:', record.analysis_details.regional_analysis.clothingAssessment);
      console.log('4. Enhancement Assessment:', record.analysis_details.regional_analysis.enhancementAssessment);
      console.log('Heatmap Data URI length:', record.analysis_details.regional_analysis.manipulationHeatmapUrl?.length || 0);
    }
    console.log('\n--- Visual Artifacts Flagged ---');
    console.log('Total Artifacts:', record.analysis_details.visual_artifacts?.length || 0);
    for (const art of record.analysis_details.visual_artifacts || []) {
      console.log(`- [${art.severity.toUpperCase()}] ${art.area}: ${art.finding} (Coords: ${JSON.stringify(art.coordinates || {})})`);
    }
    console.log('\n--- Explainable Summary ---');
    console.log(record.analysis_details.explainable_summary);
    console.log('======================================================\n');
  } catch (err) {
    console.error('Request failed:', err);
  }
}

testApiAnalyze();
