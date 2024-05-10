import {
	BankSettings,
	DeviceInfo,
	Footswitch,
	GlobalSettings,
} from '../../src/types';

export const deviceInfo: DeviceInfo = {
	deviceModel: 'Bridge6',
	firmwareVersion: '1.1.0',
	hardwareVersion: '1.0.1',
	uId: '5a00555a00595a005d',
	deviceName: 'Bridge 6',
	profileId: '0',
};

export const globalSettings: GlobalSettings = {
	currentBank: 0,
	midiChannel: 0,
	ledBrightness: 46,
	flexiports: [
		{
			mode: 'unassigned',
			clock: null,
			auxSensitivity: 2,
			auxHoldTime: 1000,
		},
		{
			mode: 'unassigned',
			clock: null,
			auxSensitivity: 2,
			auxHoldTime: 1000,
		},
	],
	uiMode: 'extended',
	zeroIndexBanks: false,
	preserveToggleStates: false,
	preserveScrollingStates: false,
	preserveSequentialStates: false,
	sendStates: false,
	holdTime: 1000,
	bootDelay: 0,
	bankUpTrigger: 'fs2Fs3',
	bankDownTrigger: 'fs1Fs2',
	bankPcMidiOutputs: {
		flexi1: 1,
		flexi2: 1,
		midi0: 1,
		usb: 1,
	},
	deviceName: 'Bridge 6',
	profileId: 0,
	customLedColors: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	midiClocks: [
		{ outputs: { flexi1: false, flexi2: false, midi0: false, usb: false } },
		{ outputs: { flexi1: false, flexi2: false, midi0: false, usb: false } },
	],
	flexi1ThruHandles: { flexi1: false, flexi2: false, midi0: false, usb: false },
	flexi2ThruHandles: { flexi1: false, flexi2: false, midi0: false, usb: false },
	midi0ThruHandles: { flexi1: false, flexi2: false, midi0: false, usb: false },
	usbThruHandles: { flexi1: false, flexi2: false, midi0: false, usb: false },
	expMessages: [
		{ numMessages: 0, messages: [] },
		{ numMessages: 0, messages: [] },
		{ numMessages: 0, messages: [] },
		{ numMessages: 0, messages: [] },
	],
	expLadderMessages: [
		{ numMessages: 0, messages: [] },
		{ numMessages: 0, messages: [] },
	],
	auxMessages: [
		{
			tip: {
				pressMessages: { numMessages: 0, messages: [] },
				holdMessages: { numMessages: 0, messages: [] },
				toggleOnMessages: { numMessages: 0, messages: [] },
				toggleOffMessages: { numMessages: 0, messages: [] },
			},
			ring: {
				pressMessages: { numMessages: 0, messages: [] },
				holdMessages: { numMessages: 0, messages: [] },
				toggleOnMessages: { numMessages: 0, messages: [] },
				toggleOffMessages: { numMessages: 0, messages: [] },
			},
			tipRing: {
				pressMessages: { numMessages: 0, messages: [] },
				holdMessages: { numMessages: 0, messages: [] },
				toggleOnMessages: { numMessages: 0, messages: [] },
				toggleOffMessages: { numMessages: 0, messages: [] },
			},
		},
		{
			tip: {
				pressMessages: { numMessages: 0, messages: [] },
				holdMessages: { numMessages: 0, messages: [] },
				toggleOnMessages: { numMessages: 0, messages: [] },
				toggleOffMessages: { numMessages: 0, messages: [] },
			},
			ring: {
				pressMessages: { numMessages: 0, messages: [] },
				holdMessages: { numMessages: 0, messages: [] },
				toggleOnMessages: { numMessages: 0, messages: [] },
				toggleOffMessages: { numMessages: 0, messages: [] },
			},
			tipRing: {
				pressMessages: { numMessages: 0, messages: [] },
				holdMessages: { numMessages: 0, messages: [] },
				toggleOnMessages: { numMessages: 0, messages: [] },
				toggleOffMessages: { numMessages: 0, messages: [] },
			},
		},
	],
	bootMessages: { numMessages: 0, messages: [] },
	deviceLink: {
		role: 'satellite',
		bankNav: true,
		bankName: true,
		midiStream: false,
		switchGroups: false,
	},
};

const footSwitch: Footswitch = {
	name: 'FS',
	primaryState: false,
	secondaryState: false,
	primaryMode: 'toggle',
	secondaryMode: 'holdToggle',
	primaryColor: 15761536,
	secondaryColor: 65535,
	primaryLedMode: 'onOff',
	secondaryLedMode: 'onOff',
	sequentialPattern: 'forward',
	sequentialRepeat: 'all',
	sequentialSendMode: 'always',
	linkedSwitch: 0,
	currentStep: 0,
	midiClock: null,
	lfo: {
		state: null,
		frequency: '0.1',
		minLimit: 0,
		maxLimit: 127,
		trigger: 'primary',
		messages: null,
		waveform: 'sine',
		resolution: 1,
		resetOnStop: true,
		clock: null,
	},
	toggleOnMessages: {
		numMessages: 1,
		messages: [
			{
				statusByte: 176,
				dataByte1: 0,
				dataByte2: 127,
				outputs: { flexi1: true, flexi2: true, midi0: true, usb: true },
			},
		],
	},
	toggleOffMessages: {
		numMessages: 1,
		messages: [
			{
				statusByte: 176,
				dataByte1: 0,
				dataByte2: 0,
				outputs: { flexi1: true, flexi2: true, midi0: true, usb: true },
			},
		],
	},
	pressMessages: { numMessages: 0, messages: [] },
	releaseMessages: { numMessages: 0, messages: [] },
	doublePressMessages: { numMessages: 0, messages: [] },
	holdMessages: { numMessages: 0, messages: [] },
	holdReleaseMessages: { numMessages: 0, messages: [] },
	secondaryToggleOnMessages: { numMessages: 0, messages: [] },
	secondaryToggleOffMessages: { numMessages: 0, messages: [] },
	sequentialMessages: { numSteps: 0, steps: [] },
	scrollingMessages: {
		stepInterval: 1,
		minScrollLimit: 0,
		maxScrollLimit: 127,
		numMessages: 0,
		messages: [],
	},
};

export const bankSettings: BankSettings = {
	bankName: 'Bank 0',
	bankId: 0,
	midiClocks: [{ tempo: 0 }, { tempo: 0 }],
	bankMessages: { numMessages: 0, messages: [] },
	expMessages: [
		{ numMessages: 0, messages: [] },
		{ numMessages: 0, messages: [] },
		{ numMessages: 0, messages: [] },
		{ numMessages: 0, messages: [] },
	],
	expLadderMessages: [
		{ numMessages: 0, messages: [] },
		{ numMessages: 0, messages: [] },
	],
	auxMessages: [
		{
			tip: {
				pressMessages: { numMessages: 0, messages: [] },
				holdMessages: { numMessages: 0, messages: [] },
				toggleOnMessages: { numMessages: 0, messages: [] },
				toggleOffMessages: { numMessages: 0, messages: [] },
			},
			ring: {
				pressMessages: { numMessages: 0, messages: [] },
				holdMessages: { numMessages: 0, messages: [] },
				toggleOnMessages: { numMessages: 0, messages: [] },
				toggleOffMessages: { numMessages: 0, messages: [] },
			},
			tipRing: {
				pressMessages: { numMessages: 0, messages: [] },
				holdMessages: { numMessages: 0, messages: [] },
				toggleOnMessages: { numMessages: 0, messages: [] },
				toggleOffMessages: { numMessages: 0, messages: [] },
			},
		},
		{
			tip: {
				pressMessages: { numMessages: 0, messages: [] },
				holdMessages: { numMessages: 0, messages: [] },
				toggleOnMessages: { numMessages: 0, messages: [] },
				toggleOffMessages: { numMessages: 0, messages: [] },
			},
			ring: {
				pressMessages: { numMessages: 0, messages: [] },
				holdMessages: { numMessages: 0, messages: [] },
				toggleOnMessages: { numMessages: 0, messages: [] },
				toggleOffMessages: { numMessages: 0, messages: [] },
			},
			tipRing: {
				pressMessages: { numMessages: 0, messages: [] },
				holdMessages: { numMessages: 0, messages: [] },
				toggleOnMessages: { numMessages: 0, messages: [] },
				toggleOffMessages: { numMessages: 0, messages: [] },
			},
		},
	],
	switchGroups: [[], [], [], [], [], [], [], []],
	footswitches: [
		footSwitch,
		footSwitch,
		footSwitch,
		footSwitch,
		footSwitch,
		footSwitch,
	],
};
