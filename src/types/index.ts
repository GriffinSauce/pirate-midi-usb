import { PirateMidiDevice } from '../PirateMidiDevice';

export * from './Commands';
export * from './DeviceInfo';
export * from './GlobalSettings';
export * from './BankSettings';

/**
 * Default export
 */
export type GetDevices = () => Promise<Array<PirateMidiDevice>>;
