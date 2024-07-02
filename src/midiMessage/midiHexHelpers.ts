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
): number {
	if (!isMidiMessageType(type)) {
		throw new Error(`type "${type}" is not valid`);
	}

	const firstHex: string = typeByteValues[types.indexOf(type)];
	const secondHex: string = (channel - 1).toString(16);

	const statusByte = firstHex + secondHex;

	return parseInt(statusByte, 16);
}

export function convertStatusByteToType(statusByte: number): MidiMessageType {
	const firstHex = statusByte.toString(16).padStart(2, '0')[0];
	return types[typeByteValues.indexOf(firstHex)];
}

export function convertStatusByteToChannel(statusByte: number): number {
	const secondHex: string = statusByte.toString(16).padStart(2, '0')[1];
	return parseInt(secondHex, 16) + 1;
}

export function convertOctaveAndNoteToDataByte(
	octave: number,
	note: string,
): number {
	return 12 * (octave + 2) + notes.indexOf(note);
}

export function convertDataByteToOctave(dataByte: number): number {
	return Math.floor(dataByte / 12 - 2);
}

export function convertDataByteToNote(dataByte: number): string {
	return notes[dataByte % 12];
}

export function convertPitchToDataByte1(pitch: number): number {
	return 127 & convertPitchToDataBytes(pitch);
}

export function convertPitchToDataByte2(pitch: number): number {
	return (convertPitchToDataBytes(pitch) >> 7) & 127;
}

/**
 * Converts from two data bytes to a number in the range of -100 to +100.
 * The idea is that output is used on a slider.
 */
export function convertDataBytesToPitch(
	dataByte1: number,
	dataByte2: number,
): number {
	// Bitshift magic copied from editor :thumbsup:
	let Y = (dataByte2 << 7) | dataByte1;
	const re = (dataByte2 >> 6) & 1;
	Y &= -8193;
	let J = Math.round((Y / 8191) * 100);
	return 0 === re ? -J : J;
}

function convertPitchToDataBytes(pitch: number): number {
	// Bitshift magic copied from editor :thumbsup:
	const B = parseInt('1FFF', 16);
	return ((pitch < 0 ? 0 : 1) << 13) | Math.round((Math.abs(pitch) / 100) * B);
}
