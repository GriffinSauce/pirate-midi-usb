import path from 'path';
import fs from 'fs';
import { getDevices, type BridgeBankSettings } from '../src';
import { renderProgressBar } from './utils/progressBar';

/**
 * Writes a full backup of the device to file
 * NOTE: this is an example script for Bridge family devices, it's advised to use the official backup/restore tools
 */
void (async () => {
	// Get all connected PM devices
	const devices = await getDevices();

	// deviceInfo is already populated so you can easily select a target with find, or just select the first
	const device = devices[0];

	if (!device) {
		throw new Error('No device found');
	}

	const deviceSettings = device.deviceInfo!;

	console.log(`Backing up ${deviceSettings.deviceName || 'Unknown'}`);

	const globalSettings = await device.getGlobalSettings();

	const { numberBanks } = device.getDeviceDescription();

	// Use a loop to iterate through banks because we need to run commands sequentially and wait for each to finish
	// Promise.all cannot be used here for this reason.
	const bankSettings: BridgeBankSettings[] = [];
	for (let i = 0; i < numberBanks; i++) {
		bankSettings.push(await device.getBankSettings(i));
		renderProgressBar(i, numberBanks);
	}

	const config = {
		deviceSettings,
		globalSettings,
		bankSettings,
	};

	const outDir = path.join(__dirname, '../backups');
	const fileName = `backup-${new Date().toISOString()}.json`;
	const filePath = path.join(outDir, fileName);

	if (!fs.existsSync(outDir)) {
		fs.mkdirSync(outDir);
	}
	fs.writeFileSync(filePath, JSON.stringify(config, null, 2));

	console.log(`Backup written to ${filePath}`);

	process.exit(0); // eslint-disable-line no-process-exit
})();
