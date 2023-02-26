import { Command } from '../types';

export const isCommand = (value: any): value is Command =>
	Object.values(Command).includes(value as Command);

export const isControl = (value: any): value is Command.Control =>
	(value as Command) === Command.Control;

export const isDataRequest = (value: any): value is Command.DataRequest =>
	(value as Command) === Command.DataRequest;

export const isDataTransmitRequest = (
	value: any,
): value is Command.DataTransmitRequest =>
	(value as Command) === Command.DataTransmitRequest;
