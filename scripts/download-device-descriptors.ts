import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import prettier from 'prettier';

const url =
  'https://raw.githubusercontent.com/Pirate-MIDI/device-descriptors-api/main/device-descriptors/bridge-descriptors.json';

const outDir = path.join(__dirname, '../src/data');
const outputPath = path.join(outDir, 'deviceDescriptors.ts');

const banner = `
import { DeviceDescriptions } from '../types/DeviceDescription';

/**
 * NOTE: this is downloaded and built from source on install, DO NOT modify. 
 * https://github.com/Pirate-MIDI/device-descriptors-api/blob/main/device-descriptors/bridge-descriptors.json
 */
`.trim();

void (async () => {
  const response = await fetch(url);
  const data = await response.text();

  const content = `${banner}\nexport const deviceDescriptors: DeviceDescriptions = ${data}`;

  const prettierOptions =
    (await prettier.resolveConfig(outputPath)) || undefined;
  const formattedContent = prettier.format(content, prettierOptions);

  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);
  fs.writeFileSync(outputPath, formattedContent);

  console.info(`Device descriptors downloaded to ${outputPath}`);
})();
