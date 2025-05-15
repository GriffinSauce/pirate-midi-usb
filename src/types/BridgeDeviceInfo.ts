// Extend Record to help infer the runCommand type
export interface BridgeDeviceInfo extends Record<string, unknown> {
	deviceModel: 'Bridge6' | 'Bridge4' | 'Bridge1' | 'Aero';
	firmwareVersion: string;
	hardwareVersion: string;
	uId: string;
	deviceName: string;
	profileId: string;
}
