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

export interface AuxMessages {
  tip: AuxMessageStacks;
  ring: AuxMessageStacks;
  tipRing: AuxMessageStacks;
}

export interface AuxMessageStacks {
  pressMessages: MessageStack;
  holdMessages: MessageStack;
}
