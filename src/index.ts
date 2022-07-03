import { SerialPort } from 'serialport';
import { PirateMidiDevice } from './PirateMidiDevice';

// Consider WebSerial binding to make this portable
// https://github.com/nathanjel/serialport-binding-web-serial-api

/**
 * Device manufacturer key, use to filter USB devices
 */
const MANUFACTURER = 'Pirate MIDI';

/**
 * Get any available Pirate Midi devices with device info set
 * @returns { PirateMidiDevice[] }
 */
export const getDevices = async (): Promise<PirateMidiDevice[]> => {
  // TODO: error handling
  const portsInfo = await SerialPort.list();

  return Promise.all(
    portsInfo
      .filter(({ manufacturer }) => manufacturer === MANUFACTURER)
      .map(async portInfo => {
        const port = new SerialPort({
          path: portInfo.path,
          baudRate: 9600,
          autoOpen: false,
        });

        // Auto open doesn't wait
        const error = await new Promise(resolve => {
          port.open(resolve);
        });
        if (error) throw error;

        const device = new PirateMidiDevice(port);

        // Populate deviceInfo immediately to reduce friction
        // TODO: error handling
        await device.updateDeviceInfo();

        return device;
      })
  );
};
