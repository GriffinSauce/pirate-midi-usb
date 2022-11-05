import { MINIMUM_FIRMWARE_VERSION, PirateMidiDevice } from './PirateMidiDevice';
import { WebSerialPort } from './serial/WebSerialPort';
import { GetDevices } from './types';

export * from './types';
export { PirateMidiDevice } from './PirateMidiDevice';
export { ValidationError } from './ValidationError';
export * from './midiMessage';
export { getMockDevice } from './mock';

/**
 * Requests access to a Pirate Midi device and return an instance with device info set
 * This always returns a single device wrapped in an array to match the Node API.
 */
export const getDevices: GetDevices = async () => {
  // TODO: error handling

  const port = new WebSerialPort();

  // Triggers request for user to select a device & opens the port
  await port.connect();

  const device = new PirateMidiDevice(port);

  // Populate deviceInfo immediately to reduce friction
  await device.updateDeviceInfo();

  if (!device.getIsSupported())
    throw new Error(
      `Minimum firmware version ${MINIMUM_FIRMWARE_VERSION} is required`
    );

  return [device];
};
