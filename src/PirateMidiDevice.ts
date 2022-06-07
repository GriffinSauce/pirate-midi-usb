import { Command, DeviceInfo } from './types';
import { BaseDevice } from './BaseDevice';

export class PirateMidiDevice extends BaseDevice {
  deviceInfo?: DeviceInfo;

  constructor(serialPortPath: string) {
    super(serialPortPath);
  }

  async updateDeviceInfo() {
    this.deviceInfo = (await this.runCommand(Command.Check)) as DeviceInfo;
  }

  getGlobalSettings() {
    return this.runCommand(Command.DataRequest, 'globalSettings');
  }

  getBankSettings(bank: number) {
    // TODO: validate input
    return this.runCommand(Command.DataRequest, 'bankSettings', String(bank));
  }

  bankUp() {
    return this.runCommand(Command.Control, 'bankUp');
  }

  bankDown() {
    return this.runCommand(Command.Control, 'bankDown');
  }

  goToBank(bank: number) {
    // TODO: validate input
    return this.runCommand(Command.Control, 'goToBank', String(bank));
  }

  toggleFootswitch(footswitch: number) {
    // TODO: validate input
    return this.runCommand(
      Command.Control,
      'toggleFootswitch',
      String(footswitch)
    );
  }

  deviceRestart() {
    return this.runCommand(Command.Control, 'deviceRestart');
  }

  enterBootloader() {
    return this.runCommand(Command.Control, 'enterBootloader');
  }

  // Disabled for safety because there might not be a confirmation
  // factoryReset() {
  //   return this.runCommand(Command.Control, 'factoryReset');
  // }
}
