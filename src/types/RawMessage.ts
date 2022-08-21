import { EnabledMidiOuts } from './EnabledMidiOuts';
import { SmartMessageType } from './SmartMessageType';

export interface ExpressionParameters {
  minLimit: number;
  maxLimit: number;
  sweep: 'linear' | 'log' | 'reverseLog';
}

export interface RawMessage {
  statusByte: string; // 8-bit hex
  dataByte1: string; // 8-bit hex
  dataByte2?: string; // 8-bit hex
  outputs: EnabledMidiOuts;
}

export interface RawSmartMessage {
  statusByte: string; // 8-bit hex
  dataByte1: string; // 8-bit hex
  dataByte2?: string; // 8-bit hex
  smartType: SmartMessageType;
}

export interface RawExpMessage extends RawMessage, ExpressionParameters {}
