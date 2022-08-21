import { BaseMessage, ExpMessage, SmartMessage } from '../types/Messages';
import { convertStatusByteToType } from './midiHexHelpers';
import { MidiMessageType } from './types';

export const isExpressionMidiMessage = (
  message: BaseMessage | ExpMessage | SmartMessage
): message is ExpMessage => !!(message as ExpMessage).sweep;

export const isSmartMidiMessage = (
  message: BaseMessage | ExpMessage | SmartMessage
): message is SmartMessage => {
  const type = convertStatusByteToType(message.statusByte);
  return type === MidiMessageType.SmartMessage;
};
