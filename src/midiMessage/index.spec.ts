import { decodeMidiMessage, encodeMidiMessage } from '.';
import { SMART_MESSAGE_STATUS_BYTE } from '../constants';
import {
	MidiMessageType,
	RawMessage,
	SmartMessageType,
	SmartSwitchMessage,
} from '../types';

const encodedMessages = {
	programChange: {
		statusByte: 192,
		dataByte1: 0,
		dataByte2: 0,
		outputs: {
			midi0: true,
			flexi1: true,
			flexi2: true,
			usb: true,
		},
	},
	controlChange: {
		statusByte: 176,
		dataByte1: 0,
		dataByte2: 127,
		outputs: {
			midi0: true,
			flexi1: false,
			flexi2: true,
			usb: false,
		},
	},
	noteOn: {
		statusByte: 144,
		dataByte1: 76,
		dataByte2: 64,
		outputs: {
			midi0: true,
			flexi1: true,
			flexi2: true,
			usb: true,
		},
	},
	noteOff: {
		statusByte: 128,
		dataByte1: 79,
		dataByte2: 64,
		outputs: {
			midi0: true,
			flexi1: true,
			flexi2: true,
			usb: true,
		},
	},
	pitchBend: {
		statusByte: 224,
		dataByte1: 0,
		dataByte2: 96,
		outputs: {
			midi0: false,
			flexi1: false,
			flexi2: true,
			usb: true,
		},
	},
	smartSwitchToggle: {
		statusByte: 112,
		smartType: 'switchToggle' as SmartMessageType.SwitchToggle,
		dataByte1: 4,
		dataByte2: 0,
	},
};

const decodedMessages = {
	programChange: {
		type: 'ProgramChange' as MidiMessageType.ProgramChange,
		channel: 1,
		number: 0,
		outputs: {
			midi0: true,
			flexi1: true,
			flexi2: true,
			usb: true,
		},
	},
	controlChange: {
		type: 'ControlChange' as MidiMessageType.ControlChange,
		channel: 1,
		number: 0,
		value: 127,
		outputs: {
			midi0: true,
			flexi1: false,
			flexi2: true,
			usb: false,
		},
	},
	noteOn: {
		type: 'NoteOn' as MidiMessageType.NoteOn,
		channel: 1,
		note: 'E',
		octave: 4,
		velocity: 64,
		outputs: {
			midi0: true,
			flexi1: true,
			flexi2: true,
			usb: true,
		},
	},
	noteOff: {
		type: 'NoteOff' as MidiMessageType.NoteOff,
		channel: 1,
		note: 'G',
		octave: 4,
		velocity: 64,
		outputs: {
			midi0: true,
			flexi1: true,
			flexi2: true,
			usb: true,
		},
	},
	pitchBend: {
		type: 'PitchBend' as MidiMessageType.PitchBend,
		channel: 1,
		note: 'C',
		octave: -2,
		pitch: 50,
		outputs: {
			midi0: false,
			flexi1: false,
			flexi2: true,
			usb: true,
		},
	},
	smartSwitchToggle: {
		type: 'SmartMessage',
		smartType: 'switchToggle',
		side: 'Primary',
		switchIndex: 4,
	},
};

describe('MidiMessage', () => {
	describe('decodeMidiMessage', () => {
		it('should decode a program change message', () => {
			expect(decodeMidiMessage(encodedMessages.programChange)).toEqual(
				decodedMessages.programChange,
			);
		});
		it('should decode a control change message', () => {
			expect(decodeMidiMessage(encodedMessages.controlChange)).toEqual(
				decodedMessages.controlChange,
			);
		});
		it('should decode a note on message', () => {
			expect(decodeMidiMessage(encodedMessages.noteOn)).toEqual(
				decodedMessages.noteOn,
			);
		});
		it('should decode a note off message', () => {
			expect(decodeMidiMessage(encodedMessages.noteOff)).toEqual(
				decodedMessages.noteOff,
			);
		});
		it('should decode a pitch bend message', () => {
			expect(decodeMidiMessage(encodedMessages.pitchBend)).toEqual(
				decodedMessages.pitchBend,
			);
		});
		describe('smart messages', () => {
			it('should throw for invalid data', () => {
				expect(() =>
					decodeMidiMessage({
						statusByte: SMART_MESSAGE_STATUS_BYTE,
					} as RawMessage),
				).toThrow();
			});
			it('should decode a switch toggle message', () => {
				expect(decodeMidiMessage(encodedMessages.smartSwitchToggle)).toEqual(
					decodedMessages.smartSwitchToggle,
				);
			});
		});
	});

	describe('encodeMidiMessage', () => {
		it('should encode a program change message', () => {
			expect(encodeMidiMessage(decodedMessages.programChange)).toEqual(
				encodedMessages.programChange,
			);
		});
		it('should encode a control change message', () => {
			expect(encodeMidiMessage(decodedMessages.controlChange)).toEqual(
				encodedMessages.controlChange,
			);
		});
		it('should encode a note on message', () => {
			expect(encodeMidiMessage(decodedMessages.noteOn)).toEqual(
				encodedMessages.noteOn,
			);
		});
		it('should encode a note off message', () => {
			expect(encodeMidiMessage(decodedMessages.noteOff)).toEqual(
				encodedMessages.noteOff,
			);
		});
		it('should encode a pitch bend message', () => {
			expect(encodeMidiMessage(decodedMessages.pitchBend)).toEqual(
				encodedMessages.pitchBend,
			);
		});
		describe('smart messages', () => {
			it('should encode a switch toggle message', () => {
				expect(
					encodeMidiMessage(
						decodedMessages.smartSwitchToggle as SmartSwitchMessage,
					),
				).toEqual(encodedMessages.smartSwitchToggle);
			});
		});
	});
});
