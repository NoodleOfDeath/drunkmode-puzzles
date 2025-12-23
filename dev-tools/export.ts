import { execSync } from 'child_process';
import fs from 'fs';
import p from 'path';

const EXAMPLES_DIR = 'examples';
const OUT_DIR = p.resolve(p.join(__dirname, '../out'));

const examples = fs.readdirSync(EXAMPLES_DIR);

for (const example of examples) {
  const cmd = `(cd ${p.join(EXAMPLES_DIR, example)} && yarn export && cd out && zip -r ${p.join(OUT_DIR, `${example}.zip`)} .)`;
  console.log(cmd);
  execSync(cmd);
}