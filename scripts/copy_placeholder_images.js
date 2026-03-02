const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, '..', 'public');

const mapping = [
  { src: 'placeholderFemale.webp', dest: 'placeholder-category-1.webp' },
  { src: 'placeholderMale.jpg', dest: 'placeholder-category-2.jpg' },
  { src: 'placeholderFemale.webp', dest: 'placeholder-category-3.webp' },
  { src: 'placeholderMale.jpg', dest: 'placeholder-product-1.jpg' },
  { src: 'placeholderFemale.webp', dest: 'placeholder-product-2.webp' },
  { src: 'placeholderMale.jpg', dest: 'placeholder-product-3.jpg' },
  { src: 'placeholderFemale.webp', dest: 'placeholder-product-4.webp' },
  { src: 'placeholderMale.jpg', dest: 'placeholder-product-5.jpg' },
];

mapping.forEach(({ src, dest }) => {
  const srcPath = path.join(publicDir, src);
  const destPath = path.join(publicDir, dest);
  try {
    fs.copyFileSync(srcPath, destPath);
    console.log(`Copied ${src} to ${dest}`);
  } catch (e) {
    console.error(`Failed to copy ${src} -> ${dest}:`, e.message);
  }
});

console.log('Placeholder copy complete.');
