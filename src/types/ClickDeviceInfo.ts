// Extend Record to help infer the runCommand type
export interface ClickDeviceInfo extends Record<string, unknown> {
	deviceModel: 'CLiCK';
	firmwareVersion: string;
	hardwareVersion: string;
	uId: string;
	deviceName: string;
	profileId: string;
	rssi: number;
	ssid: string;
	ip: string;
	macAddress: string;
}
