const fs = require('fs');
const p = require('path');

const OUT_DIR = 'out';

// replace base url
try {
  const indexPath = p.join(OUT_DIR, 'index.html');
  if (fs.existsSync(indexPath)) {
    const text = fs.readFileSync(indexPath, 'utf8');
    fs.writeFileSync(
      indexPath,
      text
        .replace(/src="\//g, 'src="./')
        .replace(/ crossorigin=""/g, ''),
      'utf8'
    );
    console.log('Fixed index.html paths');
  } else {
    console.warn('index.html not found in out directory');
  }

  // bundle assets
  fs.copyFileSync('puzzle.json', p.join(OUT_DIR, 'puzzle.json'));
  console.log('Copied puzzle.json');
} catch (e) {
  console.error('Error in postexport:', e);
  process.exit(1);
}
