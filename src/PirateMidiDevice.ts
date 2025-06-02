import semver from 'semver';
import {
	Command,
	CtrlCommand,
	BridgeDeviceInfo,
	ClickDeviceInfo,
	BridgeGlobalSettings,
	type BridgeBankSettings,
} from './types';
import { BaseDevice } from './BaseDevice';
import { bridgeDescriptors } from './data/bridgeDescriptors';
import { clickDescriptors } from './data/clickDescriptors';
import { ValidationError } from './ValidationError';
import type { NodeSerialPort } from './serial/NodeSerialPort';
import type { WebSerialPort } from './serial/WebSerialPort';
import { EventEmitter } from 'events';
import { DevicePortMock } from './mock/DevicePortMock';
import type { ClickGlobalSettings } from './types/ClickGlobalSettings';
import type { ClickPresetSettings } from './types/ClickPresetSettings';

export const BRIDGE_FAMILY_DEVICES = ['Bridge6', 'Bridge4', 'Aero'] as const;
export const CLICK_FAMILY_DEVICES = ['CLiCK'] as const;

export const MINIMUM_BRIDGE_FIRMWARE_VERSION = '2.0.0';
export const MINIMUM_CLICK_FIRMWARE_VERSION = '2.0.0-beta.7';

export class PirateMidiDevice extends EventEmitter {
	deviceInfo?: BridgeDeviceInfo | ClickDeviceInfo;
	family?: 'Bridge' | 'Click';
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
		if (this.family === 'Bridge') {
			return bridgeDescriptors[
				this.deviceInfo.deviceModel as keyof typeof bridgeDescriptors
			];
		}
		if (this.family === 'Click') {
			return clickDescriptors[
				this.deviceInfo.deviceModel as keyof typeof clickDescriptors
			];
		}
	}

	getIsSupported(): boolean {
		if (!this.deviceInfo) {
			throw new Error('No device info available');
		}
		if (this.family === 'Bridge') {
			return semver.gte(
				this.deviceInfo.firmwareVersion,
				MINIMUM_BRIDGE_FIRMWARE_VERSION,
			);
		}
		if (this.family === 'Click') {
			return semver.gte(
				this.deviceInfo.firmwareVersion,
				MINIMUM_CLICK_FIRMWARE_VERSION,
			);
		}
		return false;
	}

	validateBankNumber(bank: number): void {
		if (this.family !== 'Bridge') {
			throw new ValidationError(
				'Bank number validation is not supported for this device family',
			);
		}
		const { numberBanks } =
			this.getDeviceDescription() as typeof bridgeDescriptors[keyof typeof bridgeDescriptors];
		if (typeof bank !== 'number') {
			throw new ValidationError('Not a valid bank number');
		}
		if (bank < 0 || bank > numberBanks) {
			throw new ValidationError('Bank number out of range');
		}
	}

	validatePresetNumber(preset: number): void {
		if (this.family !== 'Click') {
			throw new ValidationError(
				'Preset number validation is not supported for this device family',
			);
		}
		const { numberPresets } =
			this.getDeviceDescription() as typeof clickDescriptors[keyof typeof clickDescriptors];
		if (typeof preset !== 'number') {
			throw new ValidationError('Not a valid preset number');
		}
		if (preset < 0 || preset > numberPresets) {
			throw new ValidationError('Preset number out of range');
		}
	}

	validateFootswitchNumber(footswitch: number): void {
		const {
			hardware: { footswitches },
		} =
			this.getDeviceDescription() as typeof bridgeDescriptors[keyof typeof bridgeDescriptors];
		if (typeof footswitch !== 'number') {
			throw new ValidationError('Not a valid footswitch number');
		}
		if (footswitch < 0 || footswitch > footswitches) {
			throw new ValidationError('Footswitch number out of range');
		}
	}

	/**
	 * Retrieve device information from the device, save it on the instance AND return it.
	 * @returns {BridgeDeviceInfo | ClickDeviceInfo} - device information like the model and firmware version
	 */
	async updateDeviceInfo(): Promise<BridgeDeviceInfo | ClickDeviceInfo> {
		this.deviceInfo = await this.baseDevice.queueCommand<
			BridgeDeviceInfo | ClickDeviceInfo
		>({
			command: Command.Check,
		});

		this.family = (BRIDGE_FAMILY_DEVICES as ReadonlyArray<string>).includes(
			this.deviceInfo.deviceModel,
		)
			? 'Bridge'
			: (CLICK_FAMILY_DEVICES as ReadonlyArray<string>).includes(
					this.deviceInfo.deviceModel,
			  )
			? 'Click'
			: undefined;

		if (!this.family) {
			throw new Error('Unknown/Unsupported device family');
		}

		return this.deviceInfo;
	}

	getGlobalSettings(): Promise<BridgeGlobalSettings | ClickGlobalSettings> {
		return this.baseDevice.queueCommand<
			BridgeGlobalSettings | ClickGlobalSettings
		>({
			command: Command.DataRequest,
			args: ['globalSettings'],
		});
	}

	getBankSettings(bank: number): Promise<BridgeBankSettings> {
		this.validateBankNumber(bank);

		return this.baseDevice.queueCommand<BridgeBankSettings>({
			command: Command.DataRequest,
			args: ['bankSettings', String(bank)],
		});
	}

	getPresetSettings(preset: number): Promise<ClickPresetSettings> {
		this.validatePresetNumber(preset);

		return this.baseDevice.queueCommand<ClickPresetSettings>({
			command: Command.DataRequest,
			// NOTE: This is not a typo, Click uses the bankSettings command to retrieve presets
			args: ['bankSettings', String(preset)],
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

	setGlobalSettings(
		globalSettings: Partial<BridgeGlobalSettings | ClickGlobalSettings>,
	): Promise<string> {
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
		bankSettings: Partial<BridgeBankSettings>,
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

	setPresetSettings(
		preset: number,
		presetSettings: Partial<ClickPresetSettings>,
	): Promise<string> {
		if (preset < 0 || preset > 127) {
			throw new ValidationError('Preset number out of range');
		}

		if (!presetSettings) {
			throw new ValidationError('Value is required for presetSettings');
		}

		// TODO: validate data input

		return this.baseDevice.queueCommand({
			command: Command.DataTransmitRequest,
			args: ['bankSettings', String(preset)],
			data: JSON.stringify(presetSettings),
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

	// NOTE: Click uses the bankUp/bankDown/goToBank commands to navigate presets
	presetUp(): Promise<string> {
		return this.control(['bankUp']);
	}

	presetDown(): Promise<string> {
		return this.control(['bankDown']);
	}

	goToPreset(preset: number): Promise<string> {
		if (preset < 0 || preset > 127) {
			throw new ValidationError('Preset number out of range');
		}
		return this.control([{ goToBank: preset }]);
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
