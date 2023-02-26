export enum Command {
	Check = 'CHCK',
	Control = 'CTRL',
	DataRequest = 'DREQ',
	DataTransmitRequest = 'DTXR',
	Reset = 'RSET',
}

export type CommandOptions = { args?: string[]; data?: string };
