import { MidiMessage } from 'midi-message-parser';
import { EnabledMidiOuts } from '../types/EnabledMidiOuts';
import {
  BaseMessage,
  ExpMessage,
  ExpressionParameters,
} from '../types/Messages';

type MidiMessageType =
  | 'noteon'
  | 'noteoff'
  | 'keypressure'
  | 'controlchange'
  | 'programchange'
  | 'channelpressure'
  | 'pitchbend'
  | 'unknown';

interface ParsedMessage {
  type: MidiMessageType;
  channel: number;
  number: number;
  value: number;
  outputs: EnabledMidiOuts;
}

interface ParsedExpMessage extends ParsedMessage, ExpressionParameters {}

export function decodeMidiMessage(input: BaseMessage): ParsedMessage;
export function decodeMidiMessage(input: ExpMessage): ParsedExpMessage;
export function decodeMidiMessage(
  message: BaseMessage | ExpMessage
): ParsedMessage | ParsedExpMessage {
  const { statusByte, dataByte1, dataByte2, ...rest } = message;

  const { type, channel, number, value } = new MidiMessage([
    parseInt(statusByte, 16),
    parseInt(dataByte1, 16),
    dataByte2 ? parseInt(dataByte2, 16) : undefined,
  ]);

  return {
    type,
    channel,
    number,
    value,
    ...rest,
  };
}

export function encodeMidiMessage(input: ParsedMessage): BaseMessage;
export function encodeMidiMessage(input: ParsedExpMessage): ExpMessage;
export function encodeMidiMessage(
  messageData: ParsedMessage | ParsedExpMessage
): BaseMessage | ExpMessage {
  const { type, channel, number, value, ...rest } = messageData;

  const [statusByte, dataByte1, dataByte2] = new MidiMessage({
    type,
    channel,
    number,
    value,
  })
    .toMidiArray()
    .map(String);

  return {
    statusByte,
    dataByte1,
    dataByte2,
    ...rest,
  };
}
