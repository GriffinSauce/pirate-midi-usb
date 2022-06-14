import { SerialPort } from 'serialport';
import { PirateMidiDevice } from '../src/PirateMidiDevice';
import { deviceInfo } from './fixtures';
import { getDevicePortMock } from './mocks/device';

describe('PirateMidiDevice', () => {
  describe('constructor', () => {
    it('should initialize without errors', async () => {
      const port = await getDevicePortMock();
      const device = new PirateMidiDevice(port as unknown as SerialPort);
      expect(device).toBeInstanceOf(PirateMidiDevice);
    });
  });

  describe('updateDeviceInfo', () => {
    it('should request device info, store and return it', async () => {
      const port = await getDevicePortMock();
      const device = new PirateMidiDevice(port as unknown as SerialPort);

      expect(device.deviceInfo).toEqual(undefined);

      const response = await device.updateDeviceInfo();

      expect(device.deviceInfo).toEqual(deviceInfo.bridge6);
      expect(response).toEqual(deviceInfo.bridge6);
    });
  });
});
