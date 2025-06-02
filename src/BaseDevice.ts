import {
	Command,
	CommandOptions,
	CommandOptionsControl,
	CommandOptionsDataTransmit,
	CommandOptionsWithArgs,
} from './types';
import Queue from './Queue';
import { parseMessage } from './utils/parseMessage';
import { NodeSerialPort } from './serial/NodeSerialPort';
import { WebSerialPort } from './serial/WebSerialPort';
import { DevicePortMock } from './mock/DevicePortMock';
import { createDebug } from './utils/debug';

type PortImplementation = NodeSerialPort | WebSerialPort | DevicePortMock;

const debugVerbose = createDebug('pmu-verbose');

const isControlCommand = (
	options: CommandOptions,
): options is CommandOptionsControl => options.command === Command.Control;

const hasArguments = (
	options: CommandOptions,
): options is CommandOptionsWithArgs =>
	!!(options as CommandOptionsWithArgs).args;

const hasData = (
	options: CommandOptions,
): options is CommandOptionsDataTransmit =>
	!!(options as CommandOptionsDataTransmit).data;

/**
 * Command timeout
 */
const TIMEOUT_MS = 1000;

/**
 * Commands receiving JSON structured data
 */
const COMMANDS_RECEIVING_DATA = [Command.Check, Command.DataRequest];

/**
 * Encapsulates the serial protocol, exposing only simple runCommand and queueCommand methods
 */
export class BaseDevice {
	/**
	 * We can only run one multi-part command at one time.
	 * Consumers should queue commands externally or use queueCommand
	 */
	#busy = false;

	port: PortImplementation;

	#queue: Queue;

	constructor(port: PortImplementation) {
		this.port = port;
		this.#queue = new Queue();
	}

	/**
	 * Sends data to the device and returns a promise with returned data
	 * @param {String} data - data to send
	 * @returns
	 */
	#sendReceive(data: string): Promise<string> {
		const debug = createDebug('pmu:sendReceive');
		const formattedCommand = `${data}~`;

		return new Promise((_resolve, _reject) => {
			const timeout = setTimeout(() => {
				debug(`Timeout executing "${formattedCommand}"`);
				this.port.off('data', handleResponse);
				_reject('command timed out');
			}, TIMEOUT_MS);

			const cleanup = () => {
				clearTimeout(timeout);
				this.port.off('data', handleResponse);
			};

			// Wrap resolve with cleanup
			const resolve = (returnValue: string) => {
				cleanup();
				_resolve(returnValue);
			};

			// Wrap reject with cleanup and error debug
			const reject = (errorMessage: string) => {
				debug(`Error executing "${formattedCommand}" - ${errorMessage}`);
				cleanup();
				_reject(errorMessage);
			};

			const handleResponse = (rawData: string) => {
				debug('in', rawData);
				try {
					return resolve(parseMessage(rawData));
				} catch (error: unknown) {
					if (error instanceof Error) {
						return reject(error.message);
					}
					debug('unhandled error', error);
					reject('unhandled error');
				}
			};

			this.port.on('data', handleResponse);

			debug('out', formattedCommand);
			void this.port.write(formattedCommand as string & Buffer);
		});
	}

	/**
	 * Send a command, optionally with arguments and return response data (if any)
	 * @param  {CommandOptions} commandOptions - command and options
	 * @returns
	 */

	// TODO: union overloads for the correct commands
	// Overload without response data
	protected async runCommand(
		commandOptions: CommandOptions | undefined,
	): Promise<string>;

	// Overload with response data
	// protected async runCommand<ResponseData extends Record<string, unknown>>(
	// 	commandOptions: CommandOptions | undefined,
	// ): Promise<ResponseData>;

	protected async runCommand<ResponseData extends Record<string, unknown>>(
		commandOptions: CommandOptions,
	): Promise<string | ResponseData> {
		if (this.#busy) {
			throw new Error(
				'Busy running a command, please queue commands externally to run them in serial',
			);
		}
		this.#busy = true;

		const debug = createDebug('pmu:runCommand');

		const { command } = commandOptions;

		debug(`Send command: ${command}`);

		let response;
		try {
			response = await this.#sendReceive(command);
		} catch (error) {
			this.#busy = false;
			throw error;
		}
		debugVerbose(response);

		// Command control arguments are sent as a second message
		if (isControlCommand(commandOptions)) {
			const { controlCommands } = commandOptions;

			const argsSerialized = JSON.stringify({ command: controlCommands });
			debug(`Send args: ${argsSerialized.slice(0, 30)}`);

			try {
				response = await this.#sendReceive(argsSerialized);
			} catch (error) {
				this.#busy = false;
				throw error;
			}
			debugVerbose(response);
		}

		// Arguments are sent as a second message
		if (hasArguments(commandOptions)) {
			const { args } = commandOptions;

			const argsSerialized = args.join(',');
			debug(`Send args: ${argsSerialized.slice(0, 30)}`);

			try {
				response = await this.#sendReceive(argsSerialized);
			} catch (error) {
				this.#busy = false;
				throw error;
			}
			debugVerbose(response);
		}

		// Data is sent in another subsequent message
		if (hasData(commandOptions)) {
			const { data } = commandOptions;
			debug(`Send data: ${data.slice(0, 30)}`);

			if (command !== Command.DataTransmitRequest) {
				throw new Error(`sending data not supported for command ${command}`);
			}

			try {
				response = await this.#sendReceive(data);
			} catch (error) {
				this.#busy = false;
				throw error;
			}
			debugVerbose(response);
		}

		// Help TS pick the right response type
		if (typeof response !== 'string') {
			throw new Error(`Unexpected data ${typeof response}`);
		}

		// Some commands receive JSON either directly or in response to the second data message
		const parseResponse = COMMANDS_RECEIVING_DATA.includes(command);
		if (parseResponse) {
			debug(`Parse response: ${response.slice(0, 30)}...truncated`);

			// if (response === 'ok') throw new Error('no data received');
			try {
				// TODO: add generic to type output
				const parsed: ResponseData = JSON.parse(response);
				this.#busy = false;
				return parsed;
			} catch (error) {
				if (response.startsWith('{')) {
					throw new Error(
						'error parsing response data - run with DEBUG=pmu:*,verbose:pmu* to log response',
					);
				}
				throw new Error(response); // Could be malformed JSON but most likely an error
			}
		}

		debug(`Return response: ${response}`);
		this.#busy = false;

		// We don't know all error codes (yet) so this is rough detection
		if (/(buffer|overflow|timeout|invalid)/gi.test(response)) {
			throw new Error(response);
		}
		return response;
	}

	/**
	 * Queue a command to be sent when previous commands are finished, optionally with arguments and return response data (if any)
	 * @param  {CommandOptions} commandOptions - command and options
	 * @returns
	 */

	// TODO: union overloads for the correct commands
	// Overload without response data
	async queueCommand(commandOptions: CommandOptions): Promise<string>;

	// Overload with response data
	async queueCommand<ResponseData extends Record<string, unknown>>(
		commandOptions: CommandOptions,
	): Promise<ResponseData>;

	queueCommand<ResponseData extends Record<string, unknown>>(
		commandOptions: CommandOptions,
	): Promise<string | ResponseData> {
		const debug = createDebug('pmu:queueCommand');
		const { command } = commandOptions;
		const allowRetry = command !== Command.Control; // Most are not idempotent

		return this.#queue.enqueue(async () => {
			// The API has issues with rapid-fire commands, a single retry appears to be enough to be reliable
			try {
				const response = await this.runCommand(commandOptions); // DO NOT "simplify" this, we need to await in try
				return response;
			} catch (error) {
				if (
					allowRetry &&
					typeof error === 'string' &&
					error.includes('timed out')
				) {
					debug('Command timed out, retrying');
					await this.runCommand({ command: Command.Reset });
					return this.runCommand(commandOptions);
				}
				throw error;
			}
		}) as Promise<string | ResponseData>;
	}

	disconnect(): Promise<void> {
		return this.port.close();
	}
}
