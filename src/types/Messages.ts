import { EnabledMidiOuts } from './EnabledMidiOuts';

export interface MessageStack<Message = BaseMessage> {
  numMessages: number;
  messages: Message[];
}

export interface BaseMessage {
  statusByte: string; // 8-bit hex
  dataByte1: string; // 8-bit hex
  dataByte2?: string; // 8-bit hex
  outputs: EnabledMidiOuts;
}

export interface ExpressionParameters {
  minLimit: number;
  maxLimit: number;
  sweep: 'linear' | 'log' | 'reverseLog';
}

export interface ExpMessage extends BaseMessage, ExpressionParameters {}

export enum SmartMessageType {
  SwitchOn = 'switchOn',
  SwitchOff = 'switchOff',
  SwitchToggle = 'switchToggle',
  SequentialResetStep = 'sequentialResetStep',
  SequentialIncrementStep = 'sequentialIncrementStep',
  SequentialDecrementStep = 'sequentialDecrementStep',
  SequentialGoToStep = 'sequentialGoToStep',
  SequentialQueueNextStep = 'sequentialQueueNextStep',
  SequentialQueueStep = 'sequentialQueueStep',
  ScrollingResetStep = 'scrollingResetStep',
  ScrollingIncrementStep = 'scrollingIncrementStep',
  ScrollingDecrementStep = 'scrollingDecrementStep',
  ScrollingGoToStep = 'scrollingGoToStep',
  ScrollingQueueNextStep = 'scrollingQueueNextStep',
  ScrollingQueueStep = 'scrollingQueueStep',
  BankUp = 'bankUp',
  BankDown = 'bankDown		',
  GoToBank = 'goToBank',
  IncrementExpStep = 'incrementExpStep',
  DecrementExpStep = 'decrementExpStep',
  GoToExpStep = 'goToExpStep',
  TrsSwitchOut = 'trsSwitchOut',
  TrsPulseOut = 'trsPulseOut',
}

export interface SmartMessage {
  statusByte: string; // 8-bit hex
  dataByte1: string; // 8-bit hex
  dataByte2?: string; // 8-bit hex
  smartType: SmartMessageType;
}

export interface AuxMessages {
  tip: AuxMessageStacks;
  ring: AuxMessageStacks;
  tipRing: AuxMessageStacks;
}

export interface AuxMessageStacks {
  pressMessages: MessageStack;
  holdMessages: MessageStack;
}
