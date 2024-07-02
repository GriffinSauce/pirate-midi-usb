import { Command } from '../types';
import { isCommand } from '../utils/guards';
import { Action, Context } from './createMachine';

export const reset: Action = (_, __, initialContext) => initialContext;

export const setCommand: Action = (context, event) => {
	if (!isCommand(event.type)) {
		throw new Error(`unhandled command ${event.type}`);
	}

	return {
		...context,
		command: event.type,
	};
};

export const setArgs: Action = (context, event) => ({
	...context,
	args: event.type,
});

export const setData: Action = (context, event) => ({
	...context,
	data: event.type,
});

export const setInitialResponse: Action = (context) => {
	// Received a command
	if (context.command === Command.Check) {
		return {
			...context,
			response: JSON.stringify(context.deviceState.deviceInfo),
		};
	}
	return {
		...context,
		response: 'ok',
	};
};

export const setArgsResponse: Action = (context, event) => {
	const merge = (response: Context['response']) => ({
		...context,
		response,
	});

	if (event.type === Command.Reset) {
		return merge('ok');
	}

	// Received arguments
	// Ignoring arguments because the mock is static
	if (context.command === Command.Control) {
		return merge('ok');
	}

	if (context.command === Command.DataTransmitRequest) {
		return merge('ok');
	}

	if (context.command === Command.DataRequest) {
		if (context.args === 'globalSettings') {
			return merge(JSON.stringify(context.deviceState.globalSettings));
		}
		if (context.args?.startsWith('bankSettings')) {
			const [, bank] = context.args.split(',');
			const bankIndex = parseInt(bank, 10);
			return merge(JSON.stringify(context.deviceState.banks[bankIndex]));
		}
		// TODO: handle all arguments
		throw new Error(`Unhandled argument ${context.args!}`);
	}

	throw new Error(`Unhandled command ${context.command!}`);
};

export const setDataResponse: Action = (context, event) => {
	if (event.type === Command.Reset) {
		return {
			...context,
			response: 'ok',
		};
	}

	// Received data to transmit
	// Not actually changing device state (yet), mock is static
	return {
		...context,
		response: 'ok',
	};
};

// No-op
export const setError: Action = (context) => context;
