import {
	MINIMUM_BRIDGE_FIRMWARE_VERSION,
	MINIMUM_CLICK_FIRMWARE_VERSION,
	PirateMidiDevice,
} from './PirateMidiDevice';
import { NodeSerialPort } from './serial/NodeSerialPort';
import { GetDevices } from './types';

export * from './types';
export { PirateMidiDevice } from './PirateMidiDevice';
export { ValidationError } from './ValidationError';
export * from './midiMessage';
export * from './utils/colorHelpers';
export { getMockDevice } from './mock';

/**
 * Get any available Pirate Midi devices with device info set
 */
export const getDevices: GetDevices = async () => {
	// TODO: error handling

	const ports = await NodeSerialPort.list();
	return Promise.all(
		ports.map(async (port) => {
			await port.connect();

			const device = new PirateMidiDevice(port);

			// Populate deviceInfo and family immediately to reduce friction
			await device.updateDeviceInfo();

			if (!device.getIsSupported()) {
				if (device.family === 'Bridge') {
					throw new Error(
						`Minimum firmware version ${MINIMUM_BRIDGE_FIRMWARE_VERSION} is required`,
					);
				}
				if (device.family === 'CLiCK') {
					throw new Error(
						`Minimum firmware version ${MINIMUM_CLICK_FIRMWARE_VERSION} is required`,
					);
				}
			}

			return device;
		}),
	);
};
