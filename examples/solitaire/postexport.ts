import fs from 'fs';
import p from 'path';

import archiver from 'archiver';

const OUT_DIR = 'out';
const ARTIFACTS_DIR = p.resolve('../../out');

if (!fs.existsSync(ARTIFACTS_DIR)) {
  fs.mkdirSync(ARTIFACTS_DIR);
}

// replace base url
const text = fs.readFileSync(p.join(OUT_DIR, 'index.html'), 'utf8');
fs.writeFileSync(
  p.join(OUT_DIR, 'index.html'),
  text
    .replace(/src="\//g, 'src="./')
    .replace(/href="\//g, 'href="./')
    .replace(/loading="lazy" /g, '')
    .replace(/ crossorigin=""/g, ''),
  'utf8'
);

// bundle assets
fs.cpSync('puzzle.json', p.join(OUT_DIR, 'puzzle.json'));

const output = fs.createWriteStream(p.join(ARTIFACTS_DIR, p.basename(__dirname) + '.zip'));
const archive = archiver('zip', { zlib: { level: 9 } });

output.on('end', function () {
  console.log('Data has been drained');
});

// good practice to catch warnings (ie stat failures and other non-blocking errors)
archive.on('warning', function (err) {
  if (err.code === 'ENOENT') {
    // log warning
  } else {
    // throw error
    throw err;
  }
});

// good practice to catch this error explicitly
archive.on('error', function (err) {
  throw err;
});

// pipe archive data to the file
archive.pipe(output);

// append files from a glob pattern
archive.directory(OUT_DIR, false);

// finalize the archive (ie we are done appending files but streams have to finish yet)
// 'close', 'end' or 'finish' may be fired right after calling this method so register to them beforehand
archive.finalize();