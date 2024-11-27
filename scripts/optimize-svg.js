import sharp from 'sharp';
import { readFileSync } from 'fs';

const svgBuffer = readFileSync('../src/assets/icons/shortform-logo-1024.svg');

sharp(svgBuffer)
  .resize(1024, 1024)
  .png({ quality: 90, compressionLevel: 9 })
  .toFile('../src/assets/icons/shortform-logo-1024.png')
  .then(() => console.log('PNG created successfully'))
  .catch(err => console.error('Error creating PNG:', err));
