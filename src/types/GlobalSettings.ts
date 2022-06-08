import { EnabledMidiOuts } from './EnabledMidiOuts';
import { AuxMessages, ExpMessage, MessageStack } from './Messages';

// Extend Record to help infer the runCommand type
export interface GlobalSettings extends Record<string, unknown> {
  currentBank: number;
  midiChannel: MidiChannel;
  uiMode: 'simple' | 'standard';
  ledBrightness: 0 | 1 | 2 | 3;
  preserveStates: boolean;
  sendStates: boolean;
  deviceName: string; // 12 characters
  profileId: string; // 24-bit hex
  customLedColours: string[]; // 24-bit hex
  bankTemplateIndex: number;
  bankPcMidiOutputs: BankPcMidiOutputChannels;
  midiClocks: MidiClock[];
  flexi1Mode: FlexiMode;
  flexi2Mode: FlexiMode;
  flexi1ThruHandles: EnabledMidiOuts;
  flexi2ThruHandles: EnabledMidiOuts;
  midi0ThruHandles: EnabledMidiOuts;
  usbThruHandles: EnabledMidiOuts;
  expMessages: MessageStack<ExpMessage>[];
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

type FlexiMode =
  | 'unassigned'
  | 'midiOutA'
  | 'midiOutB'
  | 'deviceLink'
  | 'expSingle'
  | 'expDual'
  | 'switchIn'
  | 'switchOut'
  | 'tapTempo';

interface MidiClock {
  outputs: EnabledMidiOuts;
}
