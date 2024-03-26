import fs from 'fs';

const text = fs.readFileSync('out/index.html', 'utf8');
fs.writeFileSync('out/index.html', text.replace(/src="\//g, 'src="').replace(/ crossorigin=""/g, ''), 'utf8');