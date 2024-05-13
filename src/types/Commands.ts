export enum Command {
	Check = 'CHCK',
	Control = 'CTRL',
	DataRequest = 'DREQ',
	DataTransmitRequest = 'DTXR',
	Reset = 'RSET',
}

export type CtrlCommand =
	| { toggleFootswitch: number }
	| { goToBank: number }
	| 'bankUp'
	| 'bankDown'
	| 'refreshLeds'
	| 'refreshDisplay'
	| 'deviceRestart'
	| 'enterBootloader'
	| 'factoryReset';

export type CommandOptionsCheck = {
	command: Command.Check;
};

export type CommandOptionsControl = {
	command: Command.Control;
	controlCommands: CtrlCommand[]; // yo dawg
};

export type CommandOptionsDataRequest = {
	command: Command.DataRequest;
	args: string[];
};

export type CommandOptionsDataTransmit = {
	command: Command.DataTransmitRequest;
	args: string[];
	data: string;
};

export type CommandOptionsDataReset = {
	command: Command.Reset;
};

/** Convenience type */
export type CommandOptionsWithArgs =
	| CommandOptionsDataRequest
	| CommandOptionsDataTransmit;

export type CommandOptions =
	| CommandOptionsCheck
	| CommandOptionsControl
	| CommandOptionsDataRequest
	| CommandOptionsDataTransmit
	| CommandOptionsDataReset;
