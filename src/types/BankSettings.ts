import { RawExpMessage, RawMessage } from './RawMessage';
import { AuxMessages, MessageStack } from './MessageStack';

// Extend Record to help infer the runCommand type
export interface BankSettings extends Record<string, unknown> {
	bankName: string;
	bankId: number; // 32-bit
	bankMessages: MessageStack;
	expMessages: MessageStack<RawExpMessage>[];
	switchGroups: SwitchGroup[][];
	auxMessages: AuxMessages[];
	footswitches: Footswitch[];
}

interface SwitchGroup {
	switch: number;
	isPrimary: boolean;
	broadcastMode: string;
	respondTo: string;
	responseType: string;
}

export interface Footswitch {
	name: string;
	primaryState: boolean;
	secondaryState: boolean;
	primaryMode: string;
	secondaryMode: string;
	primaryColor: number;
	secondaryColor: number;
	primaryLedMode: string;
	secondaryLedMode: string;
	sequentialPattern: string;
	sequentialRepeat: string;
	sequentialSendMode: string;
	linkedSwitch: number;
	currentStep: number;
	midiClock: number | null;
	toggleOnMessages: MessageStack;
	toggleOffMessages: MessageStack;
	secondaryToggleOnMessages: MessageStack;
	secondaryToggleOffMessages: MessageStack;
	pressMessages: MessageStack;
	releaseMessages: MessageStack;
	doublePressMessages: MessageStack;
	holdMessages: MessageStack;
	holdReleaseMessages: MessageStack;
	sequentialMessages: SequentialMessages;
	scrollingMessages: ScrollingMessages;
	lfo: Lfo;
}

interface Lfo {
	state: boolean | null;
	frequency: string;
	minLimit: number;
	maxLimit: number;
	trigger: string;
	messages: null | string;
	waveform: string;
	resolution: number;
	resetOnStop: boolean;
	clock: number | null;
}

interface Step {
	numMessages: number;
	label: string;
	color: string; // 24-bit hex
	messages: RawMessage[];
}

interface SequentialMessages {
	numSteps: number;
	steps: Step[];
}
interface ScrollingMessages {
	stepInterval: number; // 1-32
	minScrollLimit: number; // 0-126
	maxScrollLimit: number; // 1-127
	numMessages: number;
	messages: RawMessage[];
}
