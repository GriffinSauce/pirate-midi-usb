import semver from 'semver';
import {
	BankSettings,
	Command,
	CtrlCommand,
	DeviceInfo,
	GlobalSettings,
} from './types';
import { BaseDevice } from './BaseDevice';
import { deviceDescriptors } from './data/deviceDescriptors';
import { ValidationError } from './ValidationError';
import { NodeSerialPort } from './serial/NodeSerialPort';
import { WebSerialPort } from './serial/WebSerialPort';
import { EventEmitter } from 'events';
import { DevicePortMock } from './mock/DevicePortMock';

export const MINIMUM_FIRMWARE_VERSION = '2.0.0';

export class PirateMidiDevice extends EventEmitter {
	deviceInfo?: DeviceInfo;
	baseDevice: BaseDevice;

	constructor(port: NodeSerialPort | WebSerialPort | DevicePortMock) {
		super();

		this.baseDevice = new BaseDevice(port);

		port.on('connect', () => {
			this.emit('connect');
		});

		port.on('disconnect', () => {
			this.emit('disconnect');
		});
	}

	getDeviceDescription() {
		if (!this.deviceInfo) {
			throw new Error('No device info available');
		}
		return deviceDescriptors[this.deviceInfo.deviceModel];
	}

	getIsSupported(): boolean {
		if (!this.deviceInfo) {
			throw new Error('No device info available');
		}
		return semver.gte(
			this.deviceInfo.firmwareVersion,
			MINIMUM_FIRMWARE_VERSION,
		);
	}

	validateBankNumber(bank: number): void {
		const { numberBanks } = this.getDeviceDescription();
		if (typeof bank !== 'number') {
			throw new ValidationError('Not a valid bank number');
		}
		if (bank < 0 || bank > numberBanks) {
			throw new ValidationError('Bank number out of range');
		}
	}

	validateFootswitchNumber(footswitch: number): void {
		const {
			hardware: { footswitches },
		} = this.getDeviceDescription();
		if (typeof footswitch !== 'number') {
			throw new ValidationError('Not a valid footswitch number');
		}
		if (footswitch < 0 || footswitch > footswitches) {
			throw new ValidationError('Footswitch number out of range');
		}
	}

	/**
	 * Retrieve device information from the device, save it on the instance AND return it.
	 * @returns {DeviceInfo} - device information like the model and firmware version
	 */
	async updateDeviceInfo(): Promise<DeviceInfo> {
		this.deviceInfo = await this.baseDevice.queueCommand<DeviceInfo>({
			command: Command.Check,
		});
		return this.deviceInfo;
	}

	getGlobalSettings(): Promise<GlobalSettings> {
		return this.baseDevice.queueCommand<GlobalSettings>({
			command: Command.DataRequest,
			args: ['globalSettings'],
		});
	}

	getBankSettings(bank: number): Promise<BankSettings> {
		this.validateBankNumber(bank);

		return this.baseDevice.queueCommand<BankSettings>({
			command: Command.DataRequest,
			args: ['bankSettings', String(bank)],
		});
	}

	// TODO: this doesn't adhere to the same structure, also .. who needs it really?
	/**
	 * @param profileId - 32-bit hex configuration profile ID
	 */
	// setProfileId(profileId: string): Promise<string> {
	// 	if (!profileId) {
	// 		throw new ValidationError('Value is required for profileId');
	// 	}

	// 	// TODO: validate input
	// 	return this.baseDevice.queueCommand({
	// 		command: Command.DataTransmitRequest,
	// 		args: ['profileId', profileId],
	// 	});
	// }

	setGlobalSettings(globalSettings: Partial<GlobalSettings>): Promise<string> {
		if (!globalSettings) {
			throw new ValidationError('Value is required for globalSettings');
		}

		// TODO: validate input
		return this.baseDevice.queueCommand({
			command: Command.DataTransmitRequest,
			args: ['globalSettings'],
			data: JSON.stringify(globalSettings),
		});
	}

	async setBankSettings(
		bank: number,
		bankSettings: Partial<BankSettings>,
	): Promise<string> {
		this.validateBankNumber(bank);

		if (!bankSettings) {
			throw new ValidationError('Value is required for bankSettings');
		}

		// TODO: validate data input

		const { footswitches, ...rest } = bankSettings;

		/**
		 * API overflows when we send the entire bank at once
		 * Send footswitches each in a separate API call to avoid this
		 */
		if (footswitches) {
			await Promise.all(
				footswitches.map((footswitch, index) => {
					const data = Array(6).fill({});
					data[index] = footswitch;
					return this.baseDevice.queueCommand({
						command: Command.DataTransmitRequest,
						args: ['bankSettings', String(bank)],
						data: JSON.stringify({
							footswitches: data,
						}),
					});
				}),
			);
		}

		return this.baseDevice.queueCommand({
			command: Command.DataTransmitRequest,
			args: ['bankSettings', String(bank)],
			data: JSON.stringify(rest),
		});
	}

	/** Send multiple commands, see CtrlCommand */
	control(controlCommands: CtrlCommand[]): Promise<string> {
		return this.baseDevice.queueCommand({
			command: Command.Control,
			controlCommands,
		});
	}

	bankUp(): Promise<string> {
		return this.control(['bankUp']);
	}

	bankDown(): Promise<string> {
		return this.control(['bankDown']);
	}

	goToBank(bank: number): Promise<string> {
		this.validateBankNumber(bank);
		return this.control([{ goToBank: bank }]);
	}

	toggleFootswitch(footswitch: number): Promise<string> {
		this.validateFootswitchNumber(footswitch);
		return this.control([{ toggleFootswitch: footswitch }]);
	}

	refreshLeds(): Promise<string> {
		return this.control(['refreshLeds']);
	}

	refreshDisplay(): Promise<string> {
		return this.control(['refreshDisplay']);
	}

	deviceRestart(): Promise<string> {
		return this.control(['deviceRestart']);
	}

	enterBootloader(): Promise<string> {
		return this.control(['enterBootloader']);
	}

	// Named prop should prevent any accidental fires
	factoryReset({ sure }: { sure?: boolean } = {}): Promise<string> {
		if (!sure) {
			throw new ValidationError(
				'Must be sure about a factory reset, please pass {sure:true}',
			);
		}

		return this.control(['factoryReset']);
	}

	reset(): Promise<string> {
		return this.baseDevice.queueCommand({ command: Command.Reset });
	}

	disconnect(): Promise<void> {
		return this.baseDevice.disconnect();
	}
}
