// Extend Record to help infer the runCommand type
export interface ClickGlobalSettings extends Record<string, unknown> {
	deviceName: string;
	currentBank: number;
	ledBrightness: number;
	led1Function: string;
	led2Function: string;
	midi1ThruHandles: ThruHandles;
	usbdThruHandles: ThruHandles;
	usbhThruHandles: ThruHandles;
	wifiThruHandles: ThruHandles;
	bleThruHandles: ThruHandles;
	midiChannel: MidiChannel;
	tonexMidiChannel: number;
	midiOutPortMode: string;
	expMinLimit: number;
	expMaxLimit: number;
	wirelessType: string;
	wifiMode: string;
	bleMode: string;
}

export interface ThruHandles {
	midi1: boolean;
	usbd: boolean;
	usbh: boolean;
	wifi: boolean;
	ble: boolean;
}

// 0 is omni
type MidiChannel =
	| 0
	| 1
	| 2
	| 3
	| 4
	| 5
	| 6
	| 7
	| 8
	| 9
	| 10
	| 11
	| 12
	| 13
	| 14
	| 15
	| 16;
