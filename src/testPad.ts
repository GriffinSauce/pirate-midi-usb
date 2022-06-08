import { getDevices } from '.';

/**
 * TEST PAD FOR DEVELOPMENT
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
  const globalSettings = await device.getGlobalSettings();

  // Some commands might take arguments & don't return any data
  // Disabled because these commands have issues
  // await device.goToBank(1);

  // Send data to the device
  await device.setGlobalSettings({ midiChannel: 4 });

  // And read it
  // @ts-expect-error - return type is not implemented yet
  console.log('globalSettings.midiChannel', globalSettings.midiChannel);
})();
