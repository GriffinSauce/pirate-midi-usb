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
    return this.runCommand(Command.DataRequest, { args: ['globalSettings'] });
  }

  getBankSettings(bank: number) {
    // TODO: validate input
    return this.runCommand(Command.DataRequest, {
      args: ['bankSettings', String(bank)],
    });
  }

  /**
   * @param profileId - 32-bit hex configuration profile ID
   */
  setProfileId(profileId: string) {
    // TODO: validate input
    return this.runCommand(Command.DataTransmitRequest, {
      args: ['profileId', profileId],
    });
  }

  setGlobalSettings(globalSettings: Record<string, unknown>) {
    // TODO: validate input
    return this.runCommand(Command.DataTransmitRequest, {
      args: ['globalSettings'],
      data: JSON.stringify(globalSettings),
    });
  }

  setBankSettings(bank: number, bankSettings: Record<string, unknown>) {
    // TODO: validate input
    return this.runCommand(Command.DataTransmitRequest, {
      args: ['bankSettings', String(bank)],
      data: JSON.stringify(bankSettings),
    });
  }

  bankUp() {
    return this.runCommand(Command.Control, { args: ['bankUp'] });
  }

  bankDown() {
    return this.runCommand(Command.Control, { args: ['bankDown'] });
  }

  goToBank(bank: number) {
    // TODO: validate input
    return this.runCommand(Command.Control, {
      args: ['goToBank', String(bank)],
    });
  }

  toggleFootswitch(footswitch: number) {
    // TODO: validate input
    return this.runCommand(Command.Control, {
      args: ['toggleFootswitch', String(footswitch)],
    });
  }

  deviceRestart() {
    return this.runCommand(Command.Control, { args: ['deviceRestart'] });
  }

  enterBootloader() {
    return this.runCommand(Command.Control, { args: ['enterBootloader'] });
  }

  // Disabled for safety because there might not be a confirmation
  // factoryReset() {
  //   return this.runCommand(Command.Control, { args: ['factoryReset'] });
  // }
}
