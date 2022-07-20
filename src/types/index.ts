import { PirateMidiDevice } from '../PirateMidiDevice';
import { BindingInterface } from '@serialport/bindings-interface';

export * from './Commands';
export * from './DeviceInfo';
export * from './GlobalSettings';
export * from './BankSettings';

interface Options {
  binding?: BindingInterface;
}

/**
 * Default export
 */
export type GetDevices = (
  options?: Options
) => Promise<Array<PirateMidiDevice>>;
