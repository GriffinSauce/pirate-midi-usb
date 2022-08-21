import {
  BaseMessage,
  ExpMessage,
  SmartMessage,
  SmartMessageType,
} from '../types/Messages';
import {
  MidiMessageType,
  ParsedExpMessage,
  ParsedMessage,
  ParsedSmartMessage,
} from './types';
import {
  convertTypeAndChannelToStatusByte,
  convertStatusByteToType,
  convertStatusByteToChannel,
  convertDataByteToNumber,
  convertNumberToDataByte,
  convertOctaveAndNoteToDataByte,
  convertDataByteToOctave,
  convertDataByteToNote,
  convertPitchToDataByte1,
  convertPitchToDataByte2,
  convertDataBytesToPitch,
} from './midiHexHelpers';
import { isExpressionMidiMessage, isSmartMidiMessage } from './guards';

export function decodeMidiMessage(input: BaseMessage): ParsedMessage;
export function decodeMidiMessage(input: ExpMessage): ParsedExpMessage;
export function decodeMidiMessage(input: SmartMessage): ParsedSmartMessage;
export function decodeMidiMessage(
  message: BaseMessage | ExpMessage | SmartMessage
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
  message: BaseMessage | ExpMessage
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
        number: convertDataByteToNumber(dataByte1),
        outputs,
      };
    }
    case MidiMessageType.ControlChange:
      if (!dataByte2) throw new Error('invalid message data');
      return {
        type,
        channel,
        number: convertDataByteToNumber(dataByte1),
        value: convertDataByteToNumber(dataByte2),
        outputs,
      };
    case MidiMessageType.NoteOn:
    case MidiMessageType.NoteOff:
    case MidiMessageType.PolyPressure:
      if (!dataByte2) throw new Error('invalid message data');
      return {
        type,
        channel,
        octave: convertDataByteToOctave(dataByte1),
        note: convertDataByteToNote(dataByte1),
        velocity: convertDataByteToNumber(dataByte2),
        outputs,
      };
    case MidiMessageType.PitchBend:
      if (!dataByte2) throw new Error('invalid message data');
      return {
        type,
        channel,
        octave: convertDataByteToOctave(dataByte1),
        note: convertDataByteToNote(dataByte1),
        pitch: convertDataBytesToPitch(dataByte1, dataByte2),
        outputs,
      };
    default:
      throw new Error(`unhandled message type ${type}`);
  }
};

const decodeSmartMessage = (message: SmartMessage): ParsedSmartMessage => {
  const { dataByte1, dataByte2 } = message;

  // TODO: complete validation
  if (!message.smartType) throw new Error('property smartType is missing');

  switch (message.smartType) {
    case SmartMessageType.SwitchOn:
    case SmartMessageType.SwitchOff:
    case SmartMessageType.SwitchToggle:
      if (!dataByte2) throw new Error('invalid message data');
      return {
        type: MidiMessageType.SmartMessage,
        smartType: message.smartType,
        switchIndex: convertDataByteToNumber(dataByte1),
        side: ['primary', 'secondary'][convertDataByteToNumber(dataByte2)],
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
        type: MidiMessageType.SmartMessage,
        smartType: message.smartType,
        switchIndex: convertDataByteToNumber(dataByte1),
      };
    case SmartMessageType.SequentialGoToStep:
    case SmartMessageType.SequentialQueueStep:
    case SmartMessageType.ScrollingGoToStep:
    case SmartMessageType.ScrollingQueueStep:
      if (!dataByte2) throw new Error('invalid message data');
      return {
        type: MidiMessageType.SmartMessage,
        smartType: message.smartType,
        switchIndex: convertDataByteToNumber(dataByte1),
        stepIndex: convertDataByteToNumber(dataByte2),
      };
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
        bankIndex: convertDataByteToNumber(dataByte1),
      };
    case SmartMessageType.IncrementExpStep:
    case SmartMessageType.DecrementExpStep:
      return {
        type: MidiMessageType.SmartMessage,
        smartType: message.smartType,
        expIndex: convertDataByteToNumber(dataByte1),
      };
    case SmartMessageType.GoToExpStep:
      if (!dataByte2) throw new Error('invalid message data');
      return {
        type: MidiMessageType.SmartMessage,
        smartType: message.smartType,
        expIndex: convertDataByteToNumber(dataByte1),
        stepIndex: convertDataByteToNumber(dataByte2),
      };
    case SmartMessageType.TrsSwitchOut:
    case SmartMessageType.TrsPulseOut:
      if (!dataByte2) throw new Error('invalid message data');
      return {
        type: MidiMessageType.SmartMessage,
        smartType: message.smartType,
        flexiPort: convertDataByteToNumber(dataByte1),
        part: ['None', 'Tip', 'Ring', 'TipRing'][
          convertDataByteToNumber(dataByte2)
        ],
      };
    default:
      throw new Error('unhandled smart type');
  }
};

export function encodeMidiMessage(input: ParsedMessage): BaseMessage;
export function encodeMidiMessage(input: ParsedExpMessage): ExpMessage;
export function encodeMidiMessage(input: ParsedSmartMessage): SmartMessage;
export function encodeMidiMessage(
  message: ParsedMessage | ParsedExpMessage | ParsedSmartMessage
): BaseMessage | ExpMessage | SmartMessage {
  switch (message.type) {
    case MidiMessageType.ProgramChange:
    case MidiMessageType.ChannelPressure: {
      const { type, channel, number, ...rest } = message;
      return {
        statusByte: convertTypeAndChannelToStatusByte(type, channel),
        dataByte1: convertNumberToDataByte(number),
        dataByte2: convertNumberToDataByte(0),
        ...rest,
      };
    }
    case MidiMessageType.ControlChange: {
      const { type, channel, number, value, ...rest } = message;
      return {
        statusByte: convertTypeAndChannelToStatusByte(type, channel),
        dataByte1: convertNumberToDataByte(number),
        dataByte2: convertNumberToDataByte(value),
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
        dataByte2: convertNumberToDataByte(velocity),
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

const encodeSmartMessage = (message: ParsedSmartMessage): SmartMessage => {
  const common = { smartType: message.smartType, statusByte: '70' };

  switch (message.smartType) {
    case SmartMessageType.SwitchOn:
    case SmartMessageType.SwitchOff:
    case SmartMessageType.SwitchToggle:
      return {
        ...common,
        dataByte1: convertNumberToDataByte(message.switchIndex),
        dataByte2: convertNumberToDataByte(
          { primary: 0, secondary: 1 }[message.side]
        ),
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
        dataByte1: convertNumberToDataByte(message.switchIndex),
      };
    case SmartMessageType.SequentialGoToStep:
    case SmartMessageType.SequentialQueueStep:
    case SmartMessageType.ScrollingGoToStep:
    case SmartMessageType.ScrollingQueueStep:
      return {
        ...common,
        dataByte1: convertNumberToDataByte(message.switchIndex),
        dataByte2: convertNumberToDataByte(message.stepIndex),
      };
    case SmartMessageType.BankUp:
    case SmartMessageType.BankDown:
      return {
        ...common,
        dataByte1: convertNumberToDataByte(0),
        dataByte2: convertNumberToDataByte(0),
      };
    case SmartMessageType.GoToBank:
      return {
        ...common,
        dataByte1: convertNumberToDataByte(message.bankIndex),
        dataByte2: convertNumberToDataByte(0),
      };
    case SmartMessageType.IncrementExpStep:
    case SmartMessageType.DecrementExpStep:
      return {
        ...common,
        dataByte1: convertNumberToDataByte(message.expIndex),
        dataByte2: convertNumberToDataByte(0),
      };
    case SmartMessageType.GoToExpStep:
      return {
        ...common,
        dataByte1: convertNumberToDataByte(message.expIndex),
        dataByte2: convertNumberToDataByte(message.stepIndex),
      };
    case SmartMessageType.TrsSwitchOut:
    case SmartMessageType.TrsPulseOut:
      return {
        ...common,
        dataByte1: convertNumberToDataByte(message.flexiPort),
        dataByte2: convertNumberToDataByte(
          { None: 0, Tip: 1, Ring: 2, TipRing: 3 }[message.part]
        ),
      };
  }
};
