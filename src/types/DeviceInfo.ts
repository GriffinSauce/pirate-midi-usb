// Extend Record to help infer the runCommand type
export interface DeviceInfo extends Record<string, unknown> {
	deviceModel: 'Bridge6' | 'Bridge4' | 'Bridge1';
	firmwareVersion: string;
	hardwareVersion: string;
	uId: string;
	deviceName: string;
	profileId: string;
}
