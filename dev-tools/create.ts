import fs from 'fs';
import p from 'path';

import { ArgumentParser } from 'argparse';

const parser = new ArgumentParser({ description: 'Creates a basic NextJS Drunk Mode puzzle project.' });

parser.add_argument('name');
parser.add_argument('appId');

const args = parser.parse_args();

console.log(args);

