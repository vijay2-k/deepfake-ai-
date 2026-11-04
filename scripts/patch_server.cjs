const fs = require('fs');
const path = require('path');

const serverFile = path.join(__dirname, '..', 'server.ts');
let content = fs.readFileSync(serverFile, 'utf8');

// 1. Add imports if missing
if (!content.includes('runImageForensicPipeline')) {
  content = content.replace(
    "import multer from 'multer';",
    `import {
  runImageForensicPipeline,
  validateImageMagicBytes,
} from './src/utils/imageForensics';
import {
  runVoiceForensicPipeline,
  validateAudioMagicBytes,
} from './src/utils/audioForensics';
import multer from 'multer';`
  );
}

fs.writeFileSync(serverFile, content, 'utf8');
console.log('Imports added successfully');
