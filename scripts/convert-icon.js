const fs = require('fs');
const { exec } = require('child_process');

// Ensure imagemagick is installed
exec('brew install imagemagick', (error) => {
  if (error) {
    console.error('Error installing ImageMagick:', error);
    return;
  }

  // Convert SVG to PNG
  exec(`convert -background none -size 512x512 ../src/assets/icons/shortform-logo.svg ../src/assets/icons/shortform-logo.png`, (error) => {
    if (error) {
      console.error('Error converting SVG to PNG:', error);
      return;
    }
    console.log('Successfully converted SVG to PNG');
  });
});
