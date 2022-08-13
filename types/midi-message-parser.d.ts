declare module 'midi-message-parser' {
  export type MidiMessageType =
    | 'noteon'
    | 'noteoff'
    | 'keypressure'
    | 'controlchange'
    | 'programchange'
    | 'channelpressure'
    | 'pitchbend'
    | 'unknown';

  type MidiRawData = [number, number, number?];

  type MidiMessageLike = {
    type: MidiMessageType;
    channel: number;
    number: number;
    value: number;
  };

  export class MidiMessage {
    constructor(input: MidiRawData | MidiMessageLike);
    type: MidiMessageType;
    channel: number;
    number: number;
    value: number;

    toMidiArray(): [number, number, number];
  }
}
