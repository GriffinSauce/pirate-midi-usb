import type {
	BridgeBankSettings,
	BridgeDeviceInfo,
	BridgeGlobalSettings,
	CLiCKDeviceInfo,
	CLiCKGlobalSettings,
	CLiCKPresetSettings,
} from '../types';
import { Command } from '../types';
import { parseMessage } from '../utils/parseMessage';
import { Context, createMachine, Definition, State } from './createMachine';
import {
	isControl,
	isDataRequest,
	isDataTransmitRequest,
} from '../utils/guards';
import {
	reset,
	setArgs,
	setArgsResponse,
	setCommand,
	setData,
	setDataResponse,
	setError,
	setInitialResponse,
} from './actions';

export interface DeviceState {
	deviceInfo: BridgeDeviceInfo | CLiCKDeviceInfo;
	globalSettings: BridgeGlobalSettings | CLiCKGlobalSettings;
	banks: BridgeBankSettings[] | CLiCKPresetSettings[];
}

interface Options {
	initialState?: Partial<DeviceState>;
	onResponse?: (response: string) => void;
}

export interface Device {
	state: State;
	send: (message: string) => void;
}

const defaultInitialState: DeviceState = {
	deviceInfo: {
		deviceName: 'Bridge 6',
	} as BridgeDeviceInfo | CLiCKDeviceInfo,
	globalSettings: {
		currentBank: 0,
	} as BridgeGlobalSettings | CLiCKGlobalSettings,
	banks: [],
};

/**
 * A service that emulates device behaviour
 * @param options
 * @returns
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const createDevice = ({
	initialState = {},
	onResponse,
}: Options = {}) => {
	const initialContext: Context = {
		deviceState: {
			...defaultInitialState,
			...initialState,
		},
		command: undefined,
		args: undefined,
		data: undefined,
		response: undefined,
	};

	const definition: Definition = {
		initial: 'Initial',
		context: initialContext,
		states: {
			Initial: {
				entry: [reset],
				exit: [setCommand, setInitialResponse],
				on: {
					[Command.Check]: {
						target: 'Final',
					},
					[Command.Control]: {
						target: 'AwaitingArgs',
					},
					[Command.DataRequest]: {
						target: 'AwaitingArgs',
					},
					[Command.DataTransmitRequest]: {
						target: 'AwaitingArgs',
					},
				},
			},
			AwaitingArgs: {
				exit: [setArgs, setArgsResponse],
				on: {
					'*': [
						{
							cond: () => false, // TODO: implement check,
							target: 'ReturningError',
						},
						{
							cond: (context) => isDataTransmitRequest(context.command),
							target: 'AwaitingData',
						},
						{
							cond: (context) => isDataRequest(context.command),
							target: 'Final',
						},
						{
							cond: (context) => isControl(context.command),
							target: 'Final',
						},
					],
					[Command.Reset]: {
						target: 'Final',
					},
				},
			},
			AwaitingData: {
				exit: [setData, setDataResponse],
				on: {
					'*': {
						target: 'Final',
					},
				},
			},
			ReturningError: {
				exit: [setError],
				always: {
					target: 'Final',
				},
			},
			Final: {
				on: {
					'*': {
						target: 'Initial',
					},
				},
			},
		},
	};

	const deviceMachine = createMachine(definition);

	const send = (rawMessage: string): void => {
		const data = parseMessage(rawMessage);
		const event = {
			type: data,
		};

		// Transition to new state
		deviceMachine.dispatch(event);

		const {
			value,
			context: { response },
		} = deviceMachine.state;

		// Return response
		const responseStates = new Set(['AwaitingArgs', 'AwaitingData', 'Final']);
		if (response && responseStates.has(value)) {
			onResponse?.(`${response}~`);
		}

		// Manually restart
		if (value === 'Final') {
			deviceMachine.dispatch({ type: 'restart' });
		}
	};

	return {
		state: deviceMachine.state,
		send,
	};
};
