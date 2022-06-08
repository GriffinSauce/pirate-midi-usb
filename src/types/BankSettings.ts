import { AuxMessages, ExpMessage, MessageStack } from './Messages';

// Extend Record to help infer the runCommand type
export interface BankSettings extends Record<string, unknown> {
  bankName: string;
  bankId: string; // 32-bit
  bankMessages: MessageStack;
  expMessages: MessageStack<ExpMessage>[];
  switchGroups: Array<SwitchGroup[]>;
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
  primaryColor: string;
  secondaryColor: string;
  primaryLedMode: string;
  secondaryLedMode: string;
  stepInterval: number;
  minScrollLimit: number;
  maxScrollLimit: number;
  sequentialPattern: string;
  sequentialRepeat: string;
  sequentialSendMode: string;
  linkedSwitch: number;
  numSteps: number;
  numSequentialMessages: number[];
  sequentialLabels: string[];
  sequentialColors: string[];
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
