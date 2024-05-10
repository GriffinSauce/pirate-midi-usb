import {
	RawMessage,
	RawExpMessage,
	RawSmartMessage,
	SmartMessageType,
	MidiMessageType,
	ParsedExpMessage,
	ParsedMessage,
	ParsedSmartMessage,
	SwitchSide,
	FlexiPart,
} from '../types';
import {
	convertTypeAndChannelToStatusByte,
	convertStatusByteToType,
	convertStatusByteToChannel,
	convertOctaveAndNoteToDataByte,
	convertDataByteToOctave,
	convertDataByteToNote,
	convertPitchToDataByte1,
	convertPitchToDataByte2,
	convertDataBytesToPitch,
} from './midiHexHelpers';
import { isExpressionMidiMessage, isSmartMidiMessage } from './guards';
import { SMART_MESSAGE_STATUS_BYTE } from '../constants';

/**
 * Decodes a raw message from the device into a more usable format with human/device readable properties
 */
export function decodeMidiMessage(input: RawMessage): ParsedMessage;
export function decodeMidiMessage(input: RawExpMessage): ParsedExpMessage;
export function decodeMidiMessage(input: RawSmartMessage): ParsedSmartMessage;
export function decodeMidiMessage(
	message: RawMessage | RawExpMessage | RawSmartMessage,
): ParsedMessage | ParsedExpMessage | ParsedSmartMessage;
export function decodeMidiMessage(
	message: RawMessage | RawExpMessage | RawSmartMessage,
): ParsedMessage | ParsedExpMessage | ParsedSmartMessage {
	if (isSmartMidiMessage(message)) {
		return decodeSmartMessage(message);
	}

	const baseMessage = decodeBaseMessage(message);

	if (isExpressionMidiMessage(message)) {
		const { sweep, minLimit, maxLimit } = message;
		return { ...baseMessage, sweep, minLimit, maxLimit };
	}
	return baseMessage;
}

const decodeBaseMessage = (
	message: RawMessage | RawExpMessage,
): ParsedMessage => {
	const type = convertStatusByteToType(message.statusByte);
	const channel = convertStatusByteToChannel(message.statusByte);
	const { dataByte1, dataByte2, outputs } = message;

	switch (type) {
		case MidiMessageType.ProgramChange:
		case MidiMessageType.ChannelPressure: {
			return {
				type,
				channel,
				number: dataByte1,
				outputs,
			};
		}
		case MidiMessageType.ControlChange: {
			if (typeof dataByte2 !== 'number') {
				throw new Error('invalid message data');
			}
			return {
				type,
				channel,
				number: dataByte1,
				value: dataByte2,
				outputs,
			};
		}
		case MidiMessageType.NoteOn:
		case MidiMessageType.NoteOff:
		case MidiMessageType.PolyPressure: {
			if (typeof dataByte2 !== 'number') {
				throw new Error('invalid message data');
			}
			return {
				type,
				channel,
				octave: convertDataByteToOctave(dataByte1),
				note: convertDataByteToNote(dataByte1),
				velocity: dataByte2,
				outputs,
			};
		}
		case MidiMessageType.PitchBend: {
			if (typeof dataByte2 !== 'number') {
				throw new Error('invalid message data');
			}
			return {
				type,
				channel,
				octave: convertDataByteToOctave(dataByte1),
				note: convertDataByteToNote(dataByte1),
				pitch: convertDataBytesToPitch(dataByte1, dataByte2),
				outputs,
			};
		}
		default:
			throw new Error(`unhandled message type ${type}`);
	}
};

const decodeSmartMessage = (message: RawSmartMessage): ParsedSmartMessage => {
	const { dataByte1, dataByte2 } = message;

	// TODO: complete validation
	if (!message.smartType) {
		throw new Error('property smartType is missing');
	}

	switch (message.smartType) {
		case SmartMessageType.SwitchOn:
		case SmartMessageType.SwitchOff:
		case SmartMessageType.SwitchToggle: {
			if (typeof dataByte2 !== 'number') {
				throw new Error('invalid message data');
			}
			return {
				type: MidiMessageType.SmartMessage,
				smartType: message.smartType,
				switchIndex: dataByte1,
				side: [SwitchSide.Primary, SwitchSide.Secondary][dataByte2],
			};
		}
		case SmartMessageType.SequentialResetStep:
		case SmartMessageType.SequentialIncrementStep:
		case SmartMessageType.SequentialDecrementStep:
		case SmartMessageType.SequentialQueueNextStep:
		case SmartMessageType.ScrollingResetStep:
		case SmartMessageType.ScrollingIncrementStep:
		case SmartMessageType.ScrollingDecrementStep:
		case SmartMessageType.ScrollingQueueNextStep:
			return {
				type: MidiMessageType.SmartMessage,
				smartType: message.smartType,
				switchIndex: dataByte1,
			};
		case SmartMessageType.SequentialGoToStep:
		case SmartMessageType.SequentialQueueStep:
		case SmartMessageType.ScrollingGoToStep:
		case SmartMessageType.ScrollingQueueStep: {
			if (typeof dataByte2 !== 'number') {
				throw new Error('invalid message data');
			}
			return {
				type: MidiMessageType.SmartMessage,
				smartType: message.smartType,
				switchIndex: dataByte1,
				stepIndex: dataByte2,
			};
		}
		case SmartMessageType.BankUp:
		case SmartMessageType.BankDown:
			return {
				type: MidiMessageType.SmartMessage,
				smartType: message.smartType,
			};
		case SmartMessageType.GoToBank:
			return {
				type: MidiMessageType.SmartMessage,
				smartType: message.smartType,
				bankIndex: dataByte1,
			};
		case SmartMessageType.IncrementExpStep:
		case SmartMessageType.DecrementExpStep:
			return {
				type: MidiMessageType.SmartMessage,
				smartType: message.smartType,
				expIndex: dataByte1,
			};
		case SmartMessageType.GoToExpStep: {
			if (typeof dataByte2 !== 'number') {
				throw new Error('invalid message data');
			}
			return {
				type: MidiMessageType.SmartMessage,
				smartType: message.smartType,
				expIndex: dataByte1,
				stepIndex: dataByte2,
			};
		}
		case SmartMessageType.TrsSwitchOut:
		case SmartMessageType.TrsPulseOut: {
			if (typeof dataByte2 !== 'number') {
				throw new Error('invalid message data');
			}
			return {
				type: MidiMessageType.SmartMessage,
				smartType: message.smartType,
				flexiPort: dataByte1,
				part: [
					FlexiPart.None,
					FlexiPart.Tip,
					FlexiPart.Ring,
					FlexiPart.TipRing,
				][dataByte2],
			};
		}
		default:
			throw new Error('unhandled smart type');
	}
};

/**
 * Encodes the easy-to-use format back into a raw device message
 */
export function encodeMidiMessage(input: ParsedMessage): RawMessage;
export function encodeMidiMessage(input: ParsedExpMessage): RawExpMessage;
export function encodeMidiMessage(input: ParsedSmartMessage): RawSmartMessage;
export function encodeMidiMessage(
	message: ParsedMessage | ParsedExpMessage | ParsedSmartMessage,
): RawMessage | RawExpMessage | RawSmartMessage;
export function encodeMidiMessage(
	message: ParsedMessage | ParsedExpMessage | ParsedSmartMessage,
): RawMessage | RawExpMessage | RawSmartMessage {
	switch (message.type) {
		case MidiMessageType.ProgramChange:
		case MidiMessageType.ChannelPressure: {
			const { type, channel, number, ...rest } = message;
			return {
				statusByte: convertTypeAndChannelToStatusByte(type, channel),
				dataByte1: number,
				dataByte2: 0,
				...rest,
			};
		}
		case MidiMessageType.ControlChange: {
			const { type, channel, number, value, ...rest } = message;
			return {
				statusByte: convertTypeAndChannelToStatusByte(type, channel),
				dataByte1: number,
				dataByte2: value,
				...rest,
			};
		}
		case MidiMessageType.NoteOn:
		case MidiMessageType.NoteOff:
		case MidiMessageType.PolyPressure: {
			const { type, channel, octave, note, velocity, ...rest } = message;
			return {
				statusByte: convertTypeAndChannelToStatusByte(type, channel),
				dataByte1: convertOctaveAndNoteToDataByte(octave, note),
				dataByte2: velocity,
				...rest,
			};
		}
		case MidiMessageType.PitchBend: {
			const { type, channel, octave, note, pitch, ...rest } = message; // eslint-disable-line @typescript-eslint/no-unused-vars
			return {
				statusByte: convertTypeAndChannelToStatusByte(type, channel),
				dataByte1: convertPitchToDataByte1(pitch),
				dataByte2: convertPitchToDataByte2(pitch),
				...rest,
			};
		}
		case MidiMessageType.SmartMessage:
			return encodeSmartMessage(message);
		default:
			throw new Error('unhandled message type');
	}
}

const encodeSmartMessage = (message: ParsedSmartMessage): RawSmartMessage => {
	// As of writing there is a bug when smartType is placed first in the properties
	const common = {
		statusByte: SMART_MESSAGE_STATUS_BYTE,
		smartType: message.smartType,
	};

	switch (message.smartType) {
		case SmartMessageType.SwitchOn:
		case SmartMessageType.SwitchOff:
		case SmartMessageType.SwitchToggle:
			return {
				...common,
				dataByte1: message.switchIndex,
				dataByte2: { [SwitchSide.Primary]: 0, [SwitchSide.Secondary]: 1 }[
					message.side
				],
			};
		case SmartMessageType.SequentialResetStep:
		case SmartMessageType.SequentialIncrementStep:
		case SmartMessageType.SequentialDecrementStep:
		case SmartMessageType.SequentialQueueNextStep:
		case SmartMessageType.ScrollingResetStep:
		case SmartMessageType.ScrollingIncrementStep:
		case SmartMessageType.ScrollingDecrementStep:
		case SmartMessageType.ScrollingQueueNextStep:
			return {
				...common,
				dataByte1: message.switchIndex,
			};
		case SmartMessageType.SequentialGoToStep:
		case SmartMessageType.SequentialQueueStep:
		case SmartMessageType.ScrollingGoToStep:
		case SmartMessageType.ScrollingQueueStep:
			return {
				...common,
				dataByte1: message.switchIndex,
				dataByte2: message.stepIndex,
			};
		case SmartMessageType.BankUp:
		case SmartMessageType.BankDown:
			return {
				...common,
				dataByte1: 0,
				dataByte2: 0,
			};
		case SmartMessageType.GoToBank:
			return {
				...common,
				dataByte1: message.bankIndex,
				dataByte2: 0,
			};
		case SmartMessageType.IncrementExpStep:
		case SmartMessageType.DecrementExpStep:
			return {
				...common,
				dataByte1: message.expIndex,
				dataByte2: 0,
			};
		case SmartMessageType.GoToExpStep:
			return {
				...common,
				dataByte1: message.expIndex,
				dataByte2: message.stepIndex,
			};
		case SmartMessageType.TrsSwitchOut:
		case SmartMessageType.TrsPulseOut:
			return {
				...common,
				dataByte1: message.flexiPort,
				dataByte2: {
					[FlexiPart.None]: 0,
					[FlexiPart.Tip]: 1,
					[FlexiPart.Ring]: 2,
					[FlexiPart.TipRing]: 3,
				}[message.part],
			};
	}
};
