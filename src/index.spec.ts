import { getDevices } from '.';
import { deviceInfo, globalSettings } from '../test/fixtures';
import { getDevicePortMock } from '../test/mocks/devicePort';
import * as SerialPortModule from 'serialport';
import { PirateMidiDevice } from './PirateMidiDevice';

jest.mock('serialport', () => {
  const actual = jest.requireActual('serialport');
  const { DevicePortMock } = jest.requireActual('../test/mocks/devicePort');
  return {
    ...actual,
    SerialPort: DevicePortMock,
  } as typeof SerialPortModule;
});

describe('index', () => {
  describe('getDevices', () => {
    describe('no devices available', () => {
      it('should return nothing', async () => {
        const devices = await getDevices();

        expect(devices).toEqual([]);
      });
    });

    describe('device available', () => {
      it('should return device', async () => {
        await getDevicePortMock({
          deviceInfo,
          globalSettings,
          banks: [],
        });

        const devices = await getDevices();

        expect(devices).toHaveLength(1);
        expect(devices[0]).toBeInstanceOf(PirateMidiDevice);
      });
    });
  });
});
