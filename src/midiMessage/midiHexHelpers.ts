/**
 * Massive thanks to Pirate MIDI and Kurtis Simpson for sharing their conversion methods
 */

import { MidiMessageType } from '../types';
import { isMidiMessageType } from './guards';

// Two arrays allow us to map key<->value in either direction
const types = [
	MidiMessageType.ControlChange,
	MidiMessageType.ProgramChange,
	MidiMessageType.ChannelPressure,
	MidiMessageType.PitchBend,
	MidiMessageType.SmartMessage,
	MidiMessageType.NoteOff,
	MidiMessageType.NoteOn,
	MidiMessageType.PolyPressure,
];
const typeByteValues = ['b', 'c', 'd', 'e', '7', '8', '9', 'a'];

const notes = [
	'C',
	'C#/Db',
	'D',
	'D#/Eb',
	'E',
	'F',
	'F#/Gb',
	'G',
	'G#/Ab',
	'A',
	'A#/Bb',
	'B',
];

export function convertTypeAndChannelToStatusByte(
	type: string,
	channel: number,
): string {
	if (!isMidiMessageType(type)) {
		throw new Error(`type "${type}" is not valid`);
	}

	const firstHex: string = typeByteValues[types.indexOf(type)];
	const secondHex: string = (channel - 1).toString(16);

	const statusByte = firstHex + secondHex;

	return statusByte;
}

export function convertStatusByteToType(statusByte: string): MidiMessageType {
	const firstHex: string = statusByte[0].toLowerCase();
	const type = types[typeByteValues.indexOf(firstHex)];

	return type;
}

export function convertStatusByteToChannel(statusByte: string): number {
	const secondHex: string = statusByte[1];
	const channel: number = parseInt(secondHex, 16) + 1;

	return channel;
}

export function convertDataByteToNumber(dataByte: string): number {
	const number: number = parseInt(dataByte, 16);

	return number;
}

export function convertNumberToDataByte(value: number): string {
	let dataByte: string = value.toString(16);
	if (dataByte.length === 1) {
		dataByte = `0${dataByte}`;
	}

	return dataByte;
}

export function convertOctaveAndNoteToDataByte(
	octave: number,
	note: string,
): string {
	const dataByte: string = ((octave + 1) * 12 + notes.indexOf(note)).toString(
		16,
	);

	return dataByte;
}

export function convertDataByteToOctave(dataByte: string): number {
	const octave: number = Math.floor(parseInt(dataByte, 16) / 12 - 1);

	return octave;
}

export function convertDataByteToNote(dataByte: string): string {
	const note: string = notes[parseInt(dataByte, 16) % 12];

	return note;
}

export function convertPitchToDataByte1(pitch: number): string {
	const maxPitchInt: number = parseInt('1FFF', 16);
	let signBit: string;

	if (pitch < 0) {
		signBit = '0';
	} else {
		signBit = '1';
	}

	const dataByte1Bin = (
		signBit +
		Math.round((Math.abs(pitch) / 100) * maxPitchInt)
			.toString(2)
			.padStart(13, '0')
	).substring(7);

	const dataByte1 = parseInt(dataByte1Bin, 2).toString(16);

	return dataByte1;
}

export function convertPitchToDataByte2(pitch: number): string {
	const maxPitchInt: number = parseInt('1FFF', 16);
	const signBit = pitch < 0 ? '0' : '1';
	const dataByte2Bin = (
		signBit +
		Math.round((Math.abs(pitch) / 100) * maxPitchInt)
			.toString(2)
			.padStart(13, '0')
	).substring(0, 7);

	const dataByte2: string = parseInt(dataByte2Bin, 2).toString(16);

	return dataByte2;
}

/**
 * Converts from two data bytes to a number in the range of -100 to +100.
 * The idea is that output is used on a slider.
 */
export function convertDataBytesToPitch(
	dataByte1: string,
	dataByte2: string,
): number {
	const dataByte1Bin: string = hexToSevenBit(dataByte1);
	const dataByte2Bin: string = hexToSevenBit(dataByte2);

	const totalPitchBinWithSign: string = dataByte2Bin.concat(dataByte1Bin);
	const totalPitchBinWithoutSign: string = totalPitchBinWithSign.substring(1);

	const totalPitchInt: number = parseInt(totalPitchBinWithoutSign, 2);
	const maxPitchInt: number = parseInt('1FFF', 16);

	const signBit: string = totalPitchBinWithSign.charAt(0);

	let pitch: number = Math.round((totalPitchInt / maxPitchInt) * 100);

	if (signBit === '0') {
		pitch = pitch * -1;
	}

	return pitch;
}

function hexToSevenBit(hex: string): string {
	return parseInt(hex, 16).toString(2).padStart(7, '0');
}
