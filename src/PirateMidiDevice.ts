import { BankSettings, Command, DeviceInfo, GlobalSettings } from './types';
import { BaseDevice } from './BaseDevice';

export class PirateMidiDevice extends BaseDevice {
  deviceInfo?: DeviceInfo;

  constructor(serialPortPath: string) {
    super(serialPortPath);
  }

  /**
   * Retrieve device information from the device, save it on the instance AND return it.
   * @returns {DeviceInfo} - device information like the model and firmware version
   */
  async updateDeviceInfo(): Promise<DeviceInfo> {
    this.deviceInfo = await this.runCommand<DeviceInfo>(Command.Check);
    return this.deviceInfo;
  }

  getGlobalSettings(): Promise<GlobalSettings> {
    return this.runCommand<GlobalSettings>(Command.DataRequest, {
      args: ['globalSettings'],
    });
  }

  getBankSettings(bank: number): Promise<BankSettings> {
    // TODO: validate input
    return this.runCommand<BankSettings>(Command.DataRequest, {
      args: ['bankSettings', String(bank)],
    });
  }

  /**
   * @param profileId - 32-bit hex configuration profile ID
   */
  setProfileId(profileId: string): Promise<string> {
    // TODO: validate input
    return this.runCommand(Command.DataTransmitRequest, {
      args: ['profileId', profileId],
    });
  }

  setGlobalSettings(globalSettings: Record<string, unknown>): Promise<string> {
    // TODO: validate input
    return this.runCommand(Command.DataTransmitRequest, {
      args: ['globalSettings'],
      data: JSON.stringify(globalSettings),
    });
  }

  setBankSettings(
    bank: number,
    bankSettings: Record<string, unknown>
  ): Promise<string> {
    // TODO: validate input
    return this.runCommand(Command.DataTransmitRequest, {
      args: ['bankSettings', String(bank)],
      data: JSON.stringify(bankSettings),
    });
  }

  bankUp(): Promise<string> {
    return this.runCommand(Command.Control, { args: ['bankUp'] });
  }

  bankDown(): Promise<string> {
    return this.runCommand(Command.Control, { args: ['bankDown'] });
  }

  goToBank(bank: number): Promise<string> {
    // TODO: validate input
    return this.runCommand(Command.Control, {
      args: ['goToBank', String(bank)],
    });
  }

  toggleFootswitch(footswitch: number): Promise<string> {
    // TODO: validate input
    return this.runCommand(Command.Control, {
      args: ['toggleFootswitch', String(footswitch)],
    });
  }

  deviceRestart(): Promise<string> {
    return this.runCommand(Command.Control, { args: ['deviceRestart'] });
  }

  enterBootloader(): Promise<string> {
    return this.runCommand(Command.Control, { args: ['enterBootloader'] });
  }

  // Disabled for safety because there might not be a confirmation
  // factoryReset(): Promise<string> {
  //   return this.runCommand(Command.Control, { args: ['factoryReset'] });
  // }
}
