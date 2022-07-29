import { PirateMidiDevice } from '../PirateMidiDevice';
import { DevicePortMock } from './DevicePortMock';
import { DeviceState } from './device';

/**
 * Get a mock Pirate Midi device for testing, demo interfaces etc.
 */
export const getMockDevice = async ({
  deviceInfo,
  globalSettings,
  banks,
}: DeviceState): Promise<PirateMidiDevice> => {
  const port = new DevicePortMock({
    deviceInfo,
    globalSettings,
    banks,
  });

  const device = new PirateMidiDevice(port);

  // Populate deviceInfo immediately to reduce friction
  await device.updateDeviceInfo();

  return device;
};
