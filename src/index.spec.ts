import { getDevices } from '.';
import * as SerialPortModule from 'serialport';
import { PirateMidiDevice } from './PirateMidiDevice';
import { MockBinding } from '@serialport/binding-mock';

jest.mock('serialport', () => {
	const actual = jest.requireActual('serialport');
	const { SerialPortMock } = actual;
	return {
		...actual,
		SerialPort: SerialPortMock,
	} as typeof SerialPortModule;
});

jest.mock('./PirateMidiDevice');

describe('index', () => {
	describe('getDevices', () => {
		describe('no devices available', () => {
			it('should return nothing', async () => {
				const devices = await getDevices();

				expect(devices).toEqual([]);
			});
		});

		describe.skip('device available', () => {
			it('should return device', async () => {
				MockBinding.createPort('/dev/test', {
					manufacturer: 'Pirate MIDI',
					vendorId: '0483',
					productId: '5740',
				});

				const devices = await getDevices();

				expect(devices).toHaveLength(1);
				expect(devices[0]).toBeInstanceOf(PirateMidiDevice);
			});
		});
	});
});
