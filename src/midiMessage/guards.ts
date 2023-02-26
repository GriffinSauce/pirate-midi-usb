import {
	RawMessage,
	RawExpMessage,
	RawSmartMessage,
	MidiMessageType,
} from '../types';

export const isMidiMessageType = (type: string): type is MidiMessageType =>
	Object.values(MidiMessageType).includes(type as MidiMessageType);

export const isExpressionMidiMessage = (
	message: RawMessage | RawExpMessage | RawSmartMessage,
): message is RawExpMessage => !!(message as RawExpMessage).sweep;

export const isSmartMidiMessage = (
	message: RawMessage | RawExpMessage | RawSmartMessage,
): message is RawSmartMessage => message.statusByte === '70';
