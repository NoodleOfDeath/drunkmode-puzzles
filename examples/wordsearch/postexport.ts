import fs from 'fs';
import p from 'path';

const OUT_DIR = 'out';

// replace base url
const text = fs.readFileSync(p.join(OUT_DIR, 'index.html'), 'utf8');
fs.writeFileSync(
  p.join(OUT_DIR, 'index.html'),
  text
    .replace(/src="\//g, 'src="./')
    .replace(/ crossorigin=""/g, ''),
  'utf8'
);

// bundle assets
fs.cpSync('puzzle.json', p.join(OUT_DIR, 'puzzle.json'));