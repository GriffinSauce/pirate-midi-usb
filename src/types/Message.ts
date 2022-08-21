import { EnabledMidiOuts } from './EnabledMidiOuts';
import { ExpressionParameters } from './RawMessage';
import { MidiMessageType } from './MidiMessageType';

interface Base {
  channel: number;
  outputs: EnabledMidiOuts;
}
interface ControlChange extends Base {
  type: MidiMessageType.ControlChange;
  number: number;
  value: number;
}
interface ProgramChange extends Base {
  type: MidiMessageType.ProgramChange;
  number: number;
}
interface ChannelPressure extends Base {
  type: MidiMessageType.ChannelPressure;
  number: number;
}
interface NoteOn extends Base {
  type: MidiMessageType.NoteOn;
  octave: number;
  note: string;
  velocity: number;
}
interface NoteOff extends Base {
  type: MidiMessageType.NoteOff;
  octave: number;
  note: string;
  velocity: number;
}
interface PitchBend extends Base {
  type: MidiMessageType.PitchBend;
  octave: number;
  note: string;
  pitch: number;
}
interface PolyPressure extends Base {
  type: MidiMessageType.PolyPressure;
  octave: number;
  note: string;
  velocity: number;
}

export type ParsedMessage =
  | ControlChange
  | ProgramChange
  | ChannelPressure
  | PitchBend
  | NoteOff
  | NoteOn
  | PolyPressure;

interface ControlChangeExp extends ControlChange, ExpressionParameters {}
interface ProgramChangeExp extends ProgramChange, ExpressionParameters {}
interface ChannelPressureExp extends ChannelPressure, ExpressionParameters {}
interface PitchBendExp extends PitchBend, ExpressionParameters {}
interface NoteOffExp extends NoteOff, ExpressionParameters {}
interface NoteOnExp extends NoteOn, ExpressionParameters {}
interface PolyPressureExp extends PolyPressure, ExpressionParameters {}

export type ParsedExpMessage =
  | ControlChangeExp
  | ProgramChangeExp
  | ChannelPressureExp
  | PitchBendExp
  | NoteOffExp
  | NoteOnExp
  | PolyPressureExp;
