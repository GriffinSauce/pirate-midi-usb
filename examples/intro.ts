import { getDevices } from '../src';

/**
 * This is a nice test pad for development that shows how to use a few commands
 */
void (async () => {
  // Get all connected PM devices
  const devices = await getDevices();

  // deviceInfo is already populated so you can easily select a target with find, or just select the first
  const device = devices[0];

  if (!device) {
    console.log('No device found');
    return;
  }

  console.log('device', device.deviceInfo);

  // Commands are bound to simple functions and return a promise
  // The returned promise _should_ reject when there is malformed input or an error with the device.
  const bankSettings = await device.getBankSettings(0);
  console.log('bankSettings.bankName', bankSettings.bankName);

  // Some commands might take arguments & don't return any data
  await device.goToBank(0);

  // Send data to the device
  await device.setGlobalSettings({ midiChannel: 0 });

  // And read it
  const globalSettings = await device.getGlobalSettings();
  console.log('globalSettings.midiChannel', globalSettings.midiChannel);

  // Commands are queued so you can fire off multiple promises without waiting for them
  void device.goToBank(4);
  void device.goToBank(3);
  void device.goToBank(2);

  process.exit(0); // eslint-disable-line no-process-exit
})();
