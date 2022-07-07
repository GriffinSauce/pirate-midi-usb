import {
  SerialPortMock,
  SerialPortMockOpenOptions,
} from 'serialport/dist/serialport-mock'; // Avoid circular dep when extending serialport dependency
import { MockBinding } from '@serialport/binding-mock';
import { createDevice, Device, DeviceState } from './device';

const path = '/dev/test';

export class DevicePortMock extends SerialPortMock {
  /**
   * The emulated hardware device
   */
  device: Device;

  /**
   * All messages sent to the device
   */
  sentMessages: string[] = [];

  /**
   * All messages received from the device
   */
  receivedMessages: string[] = [];

  constructor(opts: SerialPortMockOpenOptions, initialState: DeviceState) {
    super({
      ...opts,
      path,
    });

    MockBinding.createPort(path, {
      manufacturer: 'Pirate MIDI',
      vendorId: '0483',
      productId: '5740',
    });

    this.device = createDevice({
      initialState,
      onResponse: this.sendResponse,
    });
  }

  resetRecording(): void {
    this.receivedMessages = [];
    this.sentMessages = [];
  }

  sendResponse = (response: string) => {
    this.receivedMessages.push(response);

    this.port!.emitData(response); // eslint-disable-line @typescript-eslint/no-non-null-assertion
  };

  write(buffer: Buffer): boolean {
    const rawData = Buffer.from(buffer).toString();

    this.sentMessages.push(rawData);

    this.device.send(rawData);

    return true;
  }
}

/**
 * @returns {DevicePortMock} - a mocked serial port for a device
 */
export const getDevicePortMock = async (
  initialState: DeviceState
): Promise<DevicePortMock> => {
  const port = new DevicePortMock(
    {
      path,
      baudRate: 9600,
      autoOpen: false,
      lock: false,
    },
    initialState
  );

  // Port needs to be opened before using it
  return new Promise<DevicePortMock>((resolve, reject) => {
    port.open((error?: Error | null) => {
      if (error) reject(error);
      resolve(port);
    });
  });
};
