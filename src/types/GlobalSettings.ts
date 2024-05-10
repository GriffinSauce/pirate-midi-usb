import { EnabledMidiOuts } from './EnabledMidiOuts';
import { RawExpMessage } from './RawMessage';
import { MessageStack, AuxMessages } from './MessageStack';

// Extend Record to help infer the runCommand type
export interface GlobalSettings extends Record<string, unknown> {
	currentBank: number;
	midiChannel: MidiChannel;
	uiMode: 'simple' | 'extended';
	ledBrightness: number; // 0 - 100 %
	zeroIndexBanks: boolean;
	preserveToggleStates: boolean;
	preserveScrollingStates: boolean;
	preserveSequentialStates: boolean;
	sendStates: boolean;
	deviceName: string; // 12 characters
	profileId: number;
	customLedColors: number[]; // Que?
	holdTime: number; // 200-2500 ms
	bootDelay: number; // 0-60000 ms
	bankUpTrigger: BankTrigger;
	bankDownTrigger: BankTrigger;
	bankPcMidiOutputs: BankPcMidiOutputChannels;
	midiClocks: MidiClock[];
	flexiports: Array<FlexiPortConfig>;
	flexi1ThruHandles: EnabledMidiOuts;
	flexi2ThruHandles: EnabledMidiOuts;
	midi0ThruHandles: EnabledMidiOuts;
	usbThruHandles: EnabledMidiOuts;
	expMessages: MessageStack<RawExpMessage>[];
	auxMessages: AuxMessages[];
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

interface BankPcMidiOutputChannels {
	midi0: MidiChannel;
	flexi1: MidiChannel;
	flexi2: MidiChannel;
	usb: MidiChannel;
}

// TODO: doument that these are the actual combo's but all props are maintained for better UX
// type FlexiPortConfig =
// 	| {
// 			mode:
// 				| 'unassigned'
// 				| 'midiOutA'
// 				| 'midiOutB'
// 				| 'deviceLink'
// 				| 'expSingle'
// 				| 'expDual'
// 				| 'switchOut';
// 	  }
// 	| {
// 			mode: 'switchIn';
// 			auxSensitivity: 1 | 2 | 3;
// 			auxHoldTime: number; // 200-2500ms
// 	  }
// 	| {
// 			mode: 'tapTempo' | 'pulseOut';
// 			clock: null | 0 | 1;
// 	  };
type FlexiPortConfig = {
	mode:
		| 'unassigned'
		| 'midiOutA'
		| 'midiOutB'
		| 'deviceLink'
		| 'expSingle'
		| 'expDual'
		| 'switchOut'
		| 'switchIn'
		| 'tapTempo'
		| 'pulseOut';
	auxSensitivity: 1 | 2 | 3;
	auxHoldTime: number; // 200-2500ms
	clock: null | 0 | 1;
};

interface MidiClock {
	outputs: EnabledMidiOuts;
}

type BankTrigger =
	| 'fs1'
	| 'fs2'
	| 'fs3'
	| 'fs4'
	| 'fs5'
	| 'fs6'
	| 'fs1Fs2'
	| 'fs2Fs3'
	| 'fs2Fs5'
	| 'fs4Fs5'
	| 'fs5Fs6'
	| 'none';
