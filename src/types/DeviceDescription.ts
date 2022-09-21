export type DeviceDescription = Aero | Bridge;

export type DeviceDescriptions = Record<string, DeviceDescription>;

export interface Aero {
  hardware: AeroHardware;
  messageStacks: { [key: string]: number };
  numberMidiClocks: number;
  numberBanks: number;
}

export interface AeroHardware {
  footswitches: number;
  flexiports: number;
  flexiportModes: string[];
}

export interface Bridge {
  hardware: Bridge1Hardware;
  messageStacks: { [key: string]: number };
  numberMidiClocks: number;
  bankNameLength: number;
  switchNameLength: number;
  numberBanks: number;
}

export interface Bridge1Hardware {
  footswitches: number;
  flexiports: number;
  flexiportModes: string[];
  midiOutPorts: number;
  midiInPorts: number;
  displayH: number;
  displayV: number;
}
