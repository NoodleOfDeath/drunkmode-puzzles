import fs from 'fs';
import p from 'path';
import { execSync } from 'child_process';

const EXAMPLES_DIR = 'examples';

const examples = fs.readdirSync(EXAMPLES_DIR);

for (const example of examples) {
  const cmd = `(cd ${p.join(EXAMPLES_DIR, example)} && yarn export)`;
  console.log(cmd);
  execSync(cmd);
}