import { SerialPortMock, SerialPortMockOpenOptions } from 'serialport';
import { MockBinding } from '@serialport/binding-mock';
import { parseMessage } from '../../src/utils/parseMessage';
import { deviceInfo } from '../fixtures';

class DevicePortMock extends SerialPortMock {
  constructor(opts: SerialPortMockOpenOptions) {
    super(opts);
  }

  write(buffer: any): boolean {
    // Use this method to detect the supported commands and emulate a response
    const rawData = Buffer.from(buffer).toString();

    const { id, data } = parseMessage(rawData);

    let response = 'ok';

    // Add logic here to determine the proper response
    if (data === 'CHCK') {
      response = JSON.stringify(deviceInfo.bridge6);
    }

    this.port!.emitData(`${id},${response}~`); // eslint-disable-line @typescript-eslint/no-non-null-assertion
    return true;
  }
}

/**
 * @returns {DevicePortMock} - a mocked serial port for a device
 */
export const getDevicePortMock = async (): Promise<DevicePortMock> => {
  const path = '/dev/test';

  MockBinding.createPort(path);

  const port = new DevicePortMock({
    path,
    baudRate: 9600,
    autoOpen: false,
  });

  // Port needs to be opened before using it
  return new Promise<DevicePortMock>((resolve, reject) => {
    port.open((error?: Error | null) => {
      if (error) reject(error);
      resolve(port);
    });
  });
};
