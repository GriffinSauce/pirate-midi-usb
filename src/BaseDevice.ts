import { Command, CommandOptions } from './types';
import Queue from './Queue';
import { parseMessage } from './utils/parseMessage';
import { NodeSerialPort } from './serial/NodeSerialPort';
import { WebSerialPort } from './serial/WebSerialPort';
import { DevicePortMock } from './mock/DevicePortMock';
import { createDebug } from './utils/debug';

type PortImplementation = NodeSerialPort | WebSerialPort | DevicePortMock;

const debugVerbose = createDebug('pmu-verbose');

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
  // Increment index for command ids
  #commandIndex = 0;

  /**
   * We can only run one multi-part command at one time.
   * Consumers should queue commands externally or use queueCommand
   */
  #busy = false;

  #port: PortImplementation;

  #queue: Queue;

  constructor(port: PortImplementation) {
    this.#port = port;
    this.#queue = new Queue();
  }

  /**
   * Every command should have a unique id, keep a private incrementing counter
   */
  #getCommandId(): number {
    return (this.#commandIndex += 1);
  }

  /**
   * Sends data to the device and returns a promise with returned data
   * @param {Int} commandId - a command id to tie together command- and data transfers
   * @param {String} data - data to send
   * @returns
   */
  #sendReceive(commandId: number, data: string): Promise<string> {
    const debug = createDebug('pmu:sendReceive');
    const formattedCommand = `${[commandId, data].join(',')}~`;

    return new Promise((_resolve, _reject) => {
      const timeout = setTimeout(() => {
        debug(`Timeout executing "${formattedCommand}"`);
        this.#port.off('data', handleResponse);
        _reject('command timed out');
      }, TIMEOUT_MS);

      const cleanup = () => {
        clearTimeout(timeout);
        this.#port.off('data', handleResponse);
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
          const { id, data } = parseMessage(rawData);
          if (id !== commandId) return;
          return resolve(data);
        } catch (error: unknown) {
          if (error instanceof Error) {
            return reject(error.message);
          }
          debug('unhandled error', error);
          reject('unhandled error');
        }
      };

      this.#port.on('data', handleResponse);

      debug('out', formattedCommand);
      void this.#port.write(formattedCommand as string & Buffer);
    });
  }

  /**
   * Send a command, optionally with arguments and return response data (if any)
   * @param {Command} command - a command string like CHCK
   * @param  {CommandOptions} options
   * @param  {String[]} options.args - any arguments for the command
   * @param  {String} options.data - any (stringified) data to transmit (only valid for data transmit commands)
   * @returns
   */

  // Overload without response data
  protected async runCommand(
    command: Command,
    options?: CommandOptions | undefined
  ): Promise<string>;

  // Overload with response data
  protected async runCommand<ResponseData extends Record<string, unknown>>(
    command: Command,
    options?: CommandOptions | undefined
  ): Promise<ResponseData>;

  protected async runCommand<ResponseData extends Record<string, unknown>>(
    command: Command,
    options: CommandOptions = {}
  ): Promise<string | ResponseData> {
    if (this.#busy)
      throw new Error(
        'Busy running a command, please queue commands externally to run them in serial'
      );
    this.#busy = true;

    const debug = createDebug('pmu:runCommand');

    const { args, data } = options;
    const commandId = this.#getCommandId();

    debug(`Send command: ${command}`);

    let response;
    try {
      response = await this.#sendReceive(commandId, command);
    } catch (error) {
      this.#busy = false;
      throw error;
    }
    debugVerbose(response);

    // When a command has arguments they are sent as a second message
    if (args?.length) {
      // if (response !== 'ok') throw new Error(response);

      const argsJoined = args.join(',');
      debug(`Send args: ${argsJoined.slice(0, 30)}`);

      // Send args
      const argCommandId = this.#getCommandId();
      try {
        response = await this.#sendReceive(argCommandId, argsJoined);
      } catch (error) {
        this.#busy = false;
        throw error;
      }

      debugVerbose(response);
    }

    // Data is sent in another subsequent message
    if (data) {
      debug(`Send data: ${data.slice(0, 30)}`);

      if (command !== Command.DataTransmitRequest)
        throw new Error(`sending data not supported for command ${command}`);

      // if (response !== 'ok') throw new Error(response);

      const dataCommandId = this.#getCommandId();
      try {
        response = await this.#sendReceive(dataCommandId, data);
      } catch (error) {
        this.#busy = false;
        throw error;
      }

      debugVerbose(response);
    }

    // Help TS pick the right response type
    if (typeof response !== 'string')
      throw new Error(`Unexpected data ${typeof response}`);

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
            'error parsing response data - run with DEBUG=pmu:*,verbose:pmu* to log response'
          );
        }
        throw new Error(response); // Could be malformed JSON but most likely an error
      }
    }

    debug(`Return response: ${response}`);
    this.#busy = false;
    return response;
  }

  /**
   * Queue a command to be sent when previous commands are finished, optionally with arguments and return response data (if any)
   * @param {Command} command - a command string like CHCK
   * @param  {CommandOptions} options
   * @param  {String[]} options.args - any arguments for the command
   * @param  {String} options.data - any (stringified) data to transmit (only valid for data transmit commands)
   * @returns
   */

  // Overload without response data
  async queueCommand(
    command: Command,
    options?: CommandOptions | undefined
  ): Promise<string>;

  // Overload with response data
  async queueCommand<ResponseData extends Record<string, unknown>>(
    command: Command,
    options?: CommandOptions | undefined
  ): Promise<ResponseData>;

  queueCommand<ResponseData extends Record<string, unknown>>(
    command: Command,
    options: CommandOptions = {}
  ): Promise<string | ResponseData> {
    return this.#queue.enqueue(() =>
      this.runCommand(command, options)
    ) as Promise<string | ResponseData>;
  }

  disconnect(): Promise<void> {
    return this.#port.close();
  }
}
