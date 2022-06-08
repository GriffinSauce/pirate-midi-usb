export enum Command {
  Check = 'CHCK',
  Control = 'CTRL',
  DataRequest = 'DREQ',
  DataTransmitRequest = 'DTXR',
  Reset = 'RSET',
}

export interface DeviceInfo extends Record<string, unknown> {
  deviceModel: string;
  firmwareVersion: string;
  hardwareVersion: string;
  uId: string;
  deviceName: string;
  profileId: string;
}

// TODO
export type GlobalSettings = Record<string, unknown>;

// TODO
export type BankSettings = Record<string, unknown>;
