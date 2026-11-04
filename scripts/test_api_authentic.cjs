const fs = require('fs');

async function testAuthenticImage() {
  const filePath = 'public/reference.jpg';
  const fileBuffer = fs.readFileSync(filePath);
  const blob = new Blob([fileBuffer], { type: 'image/jpeg' });
  const formData = new FormData();
  formData.append('file', blob, 'reference.jpg');

  console.log('Sending reference.jpg to http://localhost:3000/api/analyze...');

  try {
    const res = await fetch('http://localhost:3000/api/analyze', {
      method: 'POST',
      body: formData,
    });

    const record = await res.json();
    console.log('\n--- Authentic Image Test ---');
    console.log('Detection Verdict:', record.detection_result);
    console.log('Confidence Score:', record.confidence_score + '%');
    console.log('Local Manipulation:', record.analysis_details.local_manipulation_likelihood + '%');
    console.log('Camera Evidence:', record.analysis_details.authentic_camera_evidence + '%');
    console.log('Background Status:', record.analysis_details.regional_analysis?.backgroundAssessment.status);
    console.log('Face Status:', record.analysis_details.regional_analysis?.faceAssessment.status);
    console.log('Clothing Status:', record.analysis_details.regional_analysis?.clothingAssessment.status);
  } catch (err) {
    console.error('Request failed:', err);
  }
}

testAuthenticImage();

