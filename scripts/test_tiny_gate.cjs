const sharp = require('sharp');

async function testTinyImage() {
  const tinyBuffer = await sharp({
    create: {
      width: 100,
      height: 100,
      channels: 3,
      background: { r: 120, g: 120, b: 120 },
    },
  })
    .jpeg()
    .toBuffer();

  const blob = new Blob([tinyBuffer], { type: 'image/jpeg' });
  const formData = new FormData();
  formData.append('file', blob, 'tiny.jpg');

  const res = await fetch('http://localhost:3000/api/analyze', {
    method: 'POST',
    body: formData,
  });

  const record = await res.json();
  console.log('\n--- Tiny Image Gate Test ---');
  console.log('Detection Verdict:', record.detection_result);
  console.log('Sufficiency:', record.analysis_details.image_quality?.sufficiency);
  console.log('Reason:', record.analysis_details.image_quality?.reason);
}

testTinyImage();

