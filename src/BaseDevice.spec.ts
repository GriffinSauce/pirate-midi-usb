import { BaseDevice } from './BaseDevice';
import { deviceInfo, globalSettings } from '../test/fixtures';
import { DevicePortMock } from './mock/DevicePortMock';
import { Command } from './types';

describe('BaseDevice', () => {
	let port: DevicePortMock;
	let baseDevice: BaseDevice;

	beforeEach(() => {
		port = new DevicePortMock({
			deviceInfo,
			globalSettings,
			banks: [],
		});
		baseDevice = new BaseDevice(port);
	});

	describe('command composition', () => {
		it('should send correct messages for a Check command', async () => {
			// @ts-expect-error - using protected method
			await baseDevice.runCommand(Command.Check);
			expect(port.sentMessages).toEqual(['CHCK~']);
		});

		it('should send correct messages for a Control command', async () => {
			// @ts-expect-error - using protected method
			await baseDevice.runCommand(Command.Control, { args: ['bankUp'] });
			expect(port.sentMessages).toEqual(['CTRL~', 'bankUp~']);
		});

		it('should send correct messages for a DataRequest command', async () => {
			// @ts-expect-error - using protected method
			await baseDevice.runCommand(Command.DataRequest, {
				args: ['globalSettings'],
			});
			expect(port.sentMessages).toEqual(['DREQ~', 'globalSettings~']);
		});

		it('should send correct messages for a DataTransmit command', async () => {
			// @ts-expect-error - using protected method
			await baseDevice.runCommand(Command.DataTransmitRequest, {
				args: ['globalSettings'],
				data: '{"midiChannel":1}',
			});
			expect(port.sentMessages).toEqual([
				'DTXR~',
				'globalSettings~',
				'{"midiChannel":1}~',
			]);
		});

		it('should send correct messages for a Reset command', async () => {
			port.device.send('CTRL~'); // Put device in waiting state

			// @ts-expect-error - using protected method
			await baseDevice.runCommand(Command.Reset);
			expect(port.sentMessages).toEqual(['RSET~']);
		});
	});

	describe('command queueing', () => {
		it('should queue commands and execute them in order', async () => {
			// Promise.all will execute all immediately, this causes sequencing issues without queueing
			await Promise.all([
				// @ts-expect-error - using protected method
				baseDevice.queueCommand(Command.Control, {
					args: ['bankUp'],
				}),
				// @ts-expect-error - using protected method
				baseDevice.queueCommand(Command.Check),
			]);

			expect(port.sentMessages).toEqual(['CTRL~', 'bankUp~', 'CHCK~']);
		});
	});
});
