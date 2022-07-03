import { createMachine, assign } from 'xstate';
import {
  BankSettings,
  Command,
  DeviceInfo,
  GlobalSettings,
} from '../../src/types';
import { parseMessage } from '../../src/utils/parseMessage';

export interface DeviceState {
  deviceInfo: DeviceInfo;
  globalSettings: GlobalSettings;
  banks: BankSettings[];
}

interface Options {
  initialState?: Partial<DeviceState>;
  onResponse?: (response: string) => void;
}

type Event = { type: Command; id: number } | { type: string; id: number }; // Could be narrowed to accepted args

interface Context {
  deviceState: DeviceState;
  lastMessageId?: number;
  command?: Command;
  args?: string;
  data?: string;
  response?: string;
}

export type Device = ReturnType<typeof createDevice>;

const defaultInitialState: DeviceState = {
  deviceInfo: {
    deviceName: 'Bridge 6',
  },
  globalSettings: {
    currentBank: 0,
  },
  banks: [],
};

const isCommand = (value: any): value is Command =>
  Object.values(Command).includes(value as Command);

const isControl = (value: any): value is Command.Control =>
  (value as Command) === Command.Control;

const isDataRequest = (value: any): value is Command.DataRequest =>
  (value as Command) === Command.DataRequest;

const isDataTransmitRequest = (
  value: any
): value is Command.DataTransmitRequest =>
  (value as Command) === Command.DataTransmitRequest;

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
    lastMessageId: undefined,
    command: undefined,
    args: undefined,
    data: undefined,
    response: undefined,
  };
  const deviceMachine = createMachine(
    {
      id: 'Pirate Midi Device',
      initial: 'Initial',
      context: initialContext,
      states: {
        Initial: {
          entry: ['reset'],
          exit: ['setCommand', 'setInitialResponse'],
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
          exit: ['setArgs', 'setArgsResponse'],
          on: {
            '*': [
              {
                cond: 'isInvalidArgs',
                target: 'ReturningError',
              },
              {
                cond: 'isDataTransmitRequest',
                target: 'AwaitingData',
              },
              {
                cond: 'isDataRequest',
                target: 'Final',
              },
              {
                cond: 'isControl',
                target: 'Final',
              },
            ],
            [Command.Reset]: {
              target: 'Final',
            },
          },
        },
        AwaitingData: {
          exit: ['setData', 'setDataResponse'],
          on: {
            '*': {
              target: 'Final',
            },
          },
        },
        ReturningError: {
          exit: ['setError'],
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
      schema: {
        context: {} as Context,
        events: {} as Event,
      },
    },
    {
      actions: {
        reset: assign(() => initialContext),
        setCommand: assign({
          lastMessageId: (_context, event): number => event.id,
          command: (_context, event) => {
            if (isCommand(event.type)) return event.type;
            throw new Error(`unhandled command ${event.type}`);
          },
        }),
        setArgs: assign({
          lastMessageId: (_context, event): number => event.id,
          args: (_context, event) => event.type,
        }),
        setData: assign({
          lastMessageId: (_context, event): number => event.id,
          data: (_context, event) => event.type,
        }),
        setInitialResponse: assign({
          response: context => {
            // Received a command
            if (context.command === Command.Check) {
              return JSON.stringify(context.deviceState.deviceInfo);
            }
            return 'ok';
          },
        }),
        setArgsResponse: assign({
          response: (context, event) => {
            if (event.type === Command.Reset) {
              return 'ok';
            }

            // Received arguments
            if (context.command === Command.Control) {
              // Ignoring arguments because the mock is static
              return 'ok';
            }

            if (context.command === Command.DataTransmitRequest) {
              return 'ok';
            }

            if (context.command === Command.DataRequest) {
              if (context.args === 'globalSettings') {
                return JSON.stringify(context.deviceState.globalSettings);
              }
              if (context.args?.startsWith('bankSettings')) {
                const [, bank] = context.args.split(',');
                const bankIndex = parseInt(bank, 10);
                return JSON.stringify(context.deviceState.banks[bankIndex]);
              }
              // TODO: handle all arguments
              throw new Error(`Unhandled argument ${context.args!}`);
            }
          },
        }),
        setDataResponse: assign({
          response: (context, event) => {
            if (event.type === Command.Reset) {
              return 'ok';
            }

            // Received data to transmit
            // Not actually changing device state (yet), mock is static
            return 'ok';
          },
        }),
      },
      guards: {
        isDataRequest: context => isDataRequest(context.command),
        isDataTransmitRequest: context =>
          isDataTransmitRequest(context.command),
        isControl: context => isControl(context.command),
        isInvalidArgs: () => false, // TODO: implement check
      },
    }
  );

  let state = deviceMachine.initialState;
  const send = (rawMessage: string): void => {
    const { id, data } = parseMessage(rawMessage);

    // Transition to new state
    state = deviceMachine.transition(state, {
      type: data,
      id,
    });

    // Execute side effects
    const { actions } = state;
    actions.forEach(action => {
      typeof action.exec === 'function' && action.exec();
    });

    // Return response
    const responseStates = ['AwaitingArgs', 'AwaitingData', 'Final'];
    if (
      typeof state.context.lastMessageId === 'number' &&
      state.context.response &&
      responseStates.find(value => state.matches(value))
    )
      onResponse?.(`${state.context.lastMessageId},${state.context.response}~`);

    // Manually restart
    if (state.matches('Final'))
      state = deviceMachine.transition(state, 'restart');
  };

  return {
    state,
    send,
  };
};
