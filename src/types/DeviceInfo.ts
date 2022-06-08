// Extend Record to help infer the runCommand type
export interface DeviceInfo extends Record<string, unknown> {
  deviceModel: string;
  firmwareVersion: string;
  hardwareVersion: string;
  uId: string;
  deviceName: string;
  profileId: string;
}
