import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const bridgeUrl =
	'https://raw.githubusercontent.com/Pirate-MIDI/device-descriptors-api/main/device-descriptors/bridge-descriptors.json';
const clickUrl =
	'https://raw.githubusercontent.com/Pirate-MIDI/device-descriptors-api/main/device-descriptors/click-descriptors.json';

const outDir = path.join(__dirname, '../src/data');
const bridgeOutputPath = path.join(outDir, 'bridgeDescriptors.ts');
const clickOutputPath = path.join(outDir, 'clickDescriptors.ts');

const banner = `
/**
 * NOTE: this is downloaded and built from source on install, DO NOT modify.
 * https://github.com/Pirate-MIDI/device-descriptors-api/blob/main/device-descriptors/bridge-descriptors.json
 * https://github.com/Pirate-MIDI/device-descriptors-api/blob/main/device-descriptors/click-descriptors.json
 */
`.trim();

void (async () => {
	const bridgeResponse = await fetch(bridgeUrl);
	const bridgeData = await bridgeResponse.text();
	const clickResponse = await fetch(clickUrl);
	const clickData = await clickResponse.text();

	const bridgeContent = `${banner}\n     export const bridgeDescriptors = ${bridgeData}`;
	const clickContent = `${banner}\n     export const clickDescriptors = ${clickData}`;

	if (!fs.existsSync(outDir)) {
		fs.mkdirSync(outDir);
	}
	fs.writeFileSync(bridgeOutputPath, bridgeContent);
	fs.writeFileSync(clickOutputPath, clickContent);

	execSync('npm run format');

	console.info(`Bridge descriptors downloaded to ${bridgeOutputPath}`);
	console.info(`Click descriptors downloaded to ${clickOutputPath}`);
})();
