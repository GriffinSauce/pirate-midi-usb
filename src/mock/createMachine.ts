import type {
	BridgeBankSettings,
	BridgeDeviceInfo,
	BridgeGlobalSettings,
	Command,
	CLiCKDeviceInfo,
	CLiCKGlobalSettings,
	CLiCKPresetSettings,
} from '../types';

export interface DeviceState {
	deviceInfo: BridgeDeviceInfo | CLiCKDeviceInfo;
	globalSettings: BridgeGlobalSettings | CLiCKGlobalSettings;
	banks: BridgeBankSettings[] | CLiCKPresetSettings[];
}

type Event = { type: Command } | { type: string }; // Could be narrowed to accepted args

export interface Context {
	deviceState: DeviceState;
	command?: Command;
	args?: string;
	data?: string;
	response?: string;
}

type Condition = (context: Context, event: Event) => boolean;

interface Transition {
	cond?: Condition;
	target: string;
}

export type Action = (
	context: Context,
	event: Event,
	initialContext: Context,
) => Context;

interface StateDefinition {
	entry?: Action[];
	exit?: Action[];
	on?: Record<string, Transition | Transition[]>;
	always?: Transition; // Not yet handled
}

export interface Definition {
	initial: Event['type'];
	context: Context;
	states: Record<string, StateDefinition>;
}

export interface State {
	value: string;
	context: Context;
}

interface Machine {
	state: State;
	dispatch: (event: Event) => void;
}

/**
 * Simplistic xstate-like state machine
 * Inspired by https://kentcdodds.com/blog/implementing-a-simple-state-machine-library-in-javascript
 * And Xstate
 */
export const createMachine = (definition: Definition): Machine => {
	const machine: Machine = {
		state: {
			value: definition.initial,
			context: definition.context,
		},

		dispatch(event) {
			const currentStateDefinition = definition.states[machine.state.value];

			let transition =
				currentStateDefinition.on?.[event.type] ||
				currentStateDefinition.on?.['*'];

			if (Array.isArray(transition)) {
				transition = transition.find(({ cond }) =>
					cond ? cond(machine.state.context, event) : true,
				);
			}

			if (!transition) {
				return;
			}

			const destinationState = transition.target;
			const destinationStateDefinition = definition.states[destinationState];

			const executeAction = (action: Action) => {
				machine.state.context = action(
					machine.state.context,
					event,
					definition.context,
				);
			};

			// Execute side effects
			currentStateDefinition.exit?.forEach(executeAction);
			destinationStateDefinition.entry?.forEach(executeAction);

			machine.state.value = destinationState;
		},
	};
	return machine;
};
