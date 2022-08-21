import { PirateMidiDevice } from './PirateMidiDevice';
import { NodeSerialPort } from './serial/NodeSerialPort';
import { GetDevices } from './types';

export * from './types';
export { PirateMidiDevice } from './PirateMidiDevice';
export { ValidationError } from './ValidationError';
export * from './midiMessage';
export { getMockDevice } from './mock';

/**
 * Get any available Pirate Midi devices with device info set
 */
export const getDevices: GetDevices = async () => {
  // TODO: error handling

  const ports = await NodeSerialPort.list();
  return Promise.all(
    ports.map(async port => {
      await port.connect();

      const device = new PirateMidiDevice(port);

      // Populate deviceInfo immediately to reduce friction
      await device.updateDeviceInfo();

      return device;
    })
  );
};
