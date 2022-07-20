import { getDevices } from '.';
import { PirateMidiDevice } from './PirateMidiDevice';
import * as DevicePortMockModule from '../test/mocks/DevicePortMock';
import { MockBinding } from '@serialport/binding-mock';
import { vi } from 'vitest';

vi.mock('./serial/NodeSerialPort', async () => {
  const { DevicePortMock } = await vi.importActual<typeof DevicePortMockModule>(
    '../test/mocks/DevicePortMock'
  );
  return {
    NodeSerialPort: DevicePortMock,
  };
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
        MockBinding.createPort('/dev/test', {
          manufacturer: 'Pirate MIDI',
          vendorId: '0483',
          productId: '5740',
        });

        const devices = await getDevices({ binding: MockBinding });

        expect(devices).toHaveLength(1);
        expect(devices[0]).toBeInstanceOf(PirateMidiDevice);
      });
    });
  });
});
