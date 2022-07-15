import { PirateMidiDevice } from './PirateMidiDevice';
import { NodeSerialPort } from './serial/NodeSerialPort';
import { GetDevices } from './types';

import { SerialPortStream } from '@serialport/stream';
import { autoDetect } from '@serialport/bindings-cpp';
import { BindingInterface } from '@serialport/bindings-interface';

export * from './types';
export { PirateMidiDevice } from './PirateMidiDevice';
export { ValidationError } from './ValidationError';

type Binding = BindingInterface;

/**
 * Device manufacturer key, use to filter USB devices
 */
const MANUFACTURER = 'Pirate MIDI';

const getPorts = async (
  binding: Binding = autoDetect()
): Promise<Array<NodeSerialPort>> => {
  // TODO: error handling
  const portsInfo = await binding.list();
  return Promise.all(
    portsInfo
      .filter(({ manufacturer }) => manufacturer === MANUFACTURER)
      .map(portInfo => {
        const port = new SerialPortStream({
          binding,
          path: portInfo.path,
          baudRate: 9600,
          autoOpen: false,
        });
        return new NodeSerialPort(port);
      })
  );
};

/**
 * Get any available Pirate Midi devices with device info set
 * @param options.binding - On NodeJS optionally provide an OS binding for serialport (mostly useful for testing)
 */
export const getDevices: GetDevices = async ({ binding } = {}) => {
  // TODO: error handling

  const ports = await getPorts(binding);

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
