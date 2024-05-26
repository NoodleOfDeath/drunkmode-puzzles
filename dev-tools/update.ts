import fs from 'fs';
import p from 'path';
import { execSync } from 'child_process';

const EXAMPLES_DIR = p.resolve('examples');

const examples = fs.readdirSync(EXAMPLES_DIR);

for (const example of examples) {
  const cmd = `(cd ${p.resolve(EXAMPLES_DIR, example)} && yarn add drunkmode-puzzles@latest)`;
  execSync(cmd);
}