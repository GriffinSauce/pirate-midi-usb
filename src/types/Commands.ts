export enum Command {
	Check = 'CHCK',
	Control = 'CTRL',
	DataRequest = 'DREQ',
	DataTransmitRequest = 'DTXR',
	Reset = 'RSET',
}

type CtrlCommand =
	| 'bankUp'
	| 'bankDown'
	| { goToBank: number }
	| { toggleFootswitch: number }
	| 'refreshLeds'
	| 'refreshDisplay'
	| 'deviceRestart'
	| 'enterBootloader'
	| 'factoryReset';

// TODO: we can probably unwrap `command` into a CommandOptions property
type CtrlArgs = { command: CtrlCommand[] };

// TODO: this is hella clunky, should be a union of different commands and their data/arguments
export type CommandOptions = { args?: string[] | [CtrlArgs]; data?: string };
