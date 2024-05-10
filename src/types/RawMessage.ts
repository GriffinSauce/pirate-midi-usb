import { EnabledMidiOuts } from './EnabledMidiOuts';
import { SmartMessageType } from './SmartMessageType';

export interface ExpressionParameters {
	minLimit: number;
	maxLimit: number;
	sweep: 'linear' | 'log' | 'reverseLog';
}

export interface RawMessage {
	statusByte: number;
	dataByte1: number;
	dataByte2?: number;
	outputs: EnabledMidiOuts;
}

export interface RawSmartMessage {
	statusByte: number;
	dataByte1: number;
	dataByte2?: number;
	smartType: SmartMessageType;
}

export interface RawExpMessage extends RawMessage, ExpressionParameters {}
