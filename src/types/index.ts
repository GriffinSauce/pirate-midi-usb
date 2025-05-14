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

// Click
export * from './ClickDeviceInfo';
export * from './ClickGlobalSettings';
export * from './ClickPresetSettings';

/**
 * Default export
 */
export type GetDevices = () => Promise<PirateMidiDevice[]>;
