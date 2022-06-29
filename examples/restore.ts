import path from 'path';
import fs from 'fs';
import { getDevices } from '../src';
import { renderProgressBar } from './utils/progressBar';
import { BankSettings, GlobalSettings } from '../src/types';

/**
 * Restores a backup from file to the device
 * NOTE: this is an example script, it's advised to use the official backup/restore tools
 */
void (async () => {
  const filePath = '../backups/backup-2022-07-08T16:39:13.368Z.json';
  const backupData = fs.readFileSync(path.join(__dirname, filePath));
  let backup: Record<string, unknown>;
  try {
    backup = JSON.parse(backupData.toString());
  } catch (err) {
    console.error('Failed to parse backup JSON');
    throw err;
  }

  // Get all connected PM devices
  const devices = await getDevices();

  // deviceInfo is already populated so you can easily select a target with find, or just select the first
  const device = devices[0];

  if (!device) throw new Error('No device found');

  console.log(`Restoring ${device.deviceInfo?.deviceName || 'Unknown'}`);

  // Super basic input validation
  if (!backup.globalSettings)
    throw new Error('Unexpected format - globalSettings is missing');

  if (!backup.bankSettings)
    throw new Error('Unexpected format - bankSettings is missing');

  await device.setGlobalSettings(backup.globalSettings as GlobalSettings);

  const { numberBanks } = device.getDeviceDescription();

  for (let i = 0; i < numberBanks; i++) {
    await device.setBankSettings(i, (backup.bankSettings as BankSettings[])[i]);
    renderProgressBar(i, numberBanks);
  }

  console.log(`Backup restored from ${filePath}`);

  process.exit(0); // eslint-disable-line no-process-exit
})();
