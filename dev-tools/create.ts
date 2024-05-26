import fs from 'fs';
import p from 'path';
import { execSync } from 'child_process';

import { ArgumentParser } from 'argparse';

const parser = new ArgumentParser({ description: 'Creates a basic NextJS Drunk Mode puzzle project.' });

parser.add_argument('name');
parser.add_argument('appId');

const args = parser.parse_args();

const EXAMPLES_DIR = p.resolve('examples');
const TARGET_DIR = p.join(EXAMPLES_DIR, args.name);
const BASE_TEMPLATE = p.resolve('dev-tools/templates/base');

if (fs.existsSync(TARGET_DIR)) {
  console.error(`The directory ${TARGET_DIR} already exists.`);
  process.exit(1);
}

fs.mkdirSync(TARGET_DIR, { recursive: true });
fs.cpSync(BASE_TEMPLATE, TARGET_DIR, {
  filter: (src) => {
    const name = p.basename(src);
    return !/node_modules|\.git|\.next|dist|out/.test(name);
  },
  recursive: true,
});

const puzzleInfo = JSON.parse(fs.readFileSync(p.join(TARGET_DIR, 'puzzle.json')).toString());
puzzleInfo.name = args.appId;
fs.writeFileSync(p.join(TARGET_DIR, 'puzzle.json'), JSON.stringify(puzzleInfo, null, 2));

const packageInfo = JSON.parse(fs.readFileSync(p.join(TARGET_DIR, 'package.json')).toString());
packageInfo.name = args.appId;
fs.writeFileSync(p.join(TARGET_DIR, 'package.json'), JSON.stringify(packageInfo, null, 2));

execSync(`cd ${TARGET_DIR} && yarn && yarn add drunkmode-puzzles@latest`);
