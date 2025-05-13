import { PirateMidiDevice } from '../PirateMidiDevice';

// Common
export * from './Commands';
export * from './EnabledMidiOuts';
export * from './Message';
export * from './MessageStack';
export * from './MidiMessageType';
export * from './RawMessage';
export * from './SmartMessage';
export * from './SmartMessageType';

// Bridge
export * from './BridgeDeviceInfo';
export * from './BridgeGlobalSettings';
export * from './BridgeBankSettings';

// CLiCK
export * from './CLiCKDeviceInfo';
export * from './CLiCKGlobalSettings';
export * from './CLiCKPresetSettings';

/**
 * Default export
 */
export type GetDevices = () => Promise<PirateMidiDevice[]>;
