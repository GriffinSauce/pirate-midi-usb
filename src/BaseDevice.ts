import { SerialPort } from 'serialport';
import { RegexParser } from '@serialport/parser-regex';
import { Command, CommandOptions } from './types';
import Debug from 'debug';
import Queue from './Queue';

const debugVerbose = Debug('verbose:pmu');

/**
 * Commands and response streams are delimited with ~
 */
const DELIMITER = '~';

/**
 * Command timeout
 */
const TIMEOUT_MS = 5000;

/**
 * Commands receiving JSON structured data
 */
const COMMANDS_RECEIVING_DATA = [Command.Check, Command.DataRequest];

/**
 * Parse a message to it's components (eg. "0,ok~" => "0" and "ok")
 */
const MESSAGE_PARSE_REGEX = /^(\d+),([\S\s]*)/; // TODO: Consider using named groups: /^(?<commandId>\d+),(?<data>[\S\s]*)/

/**
 * Encapsulates the serial protocol, exposing only simple runCommand and queueCommand methods
 */
export class BaseDevice extends Queue {
  // Serial port for sending/receiving data
  #port: SerialPort;

  // Serial port with parser inlined to chunk received data
  #parser: RegexParser;

  // Increment index for command ids
  #commandIndex = 0;

  /**
   * We can only run one multi-part command at one time.
   * Consumers should queue commands externally or use queueCommand
   */
  #busy = false;

  constructor(serialPortPath: string) {
    super();
    this.#port = new SerialPort({ path: serialPortPath, baudRate: 9600 });
    this.#parser = this.#port.pipe(
      new RegexParser({ regex: new RegExp(DELIMITER) })
    );
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
    const formattedCommand = `${[commandId, data].join(',')}~`;

    return new Promise((_resolve, _reject) => {
      const timeout = setTimeout(() => {
        console.error(`Timeout executing "${formattedCommand}"`); // TODO: use debug
        _reject('command timed out');
      }, TIMEOUT_MS);

      const cleanup = () => {
        clearTimeout(timeout);
        this.#parser.off('data', handleResponse);
      };

      // Wrap resolve with cleanup
      const resolve = (returnValue: string) => {
        cleanup();
        _resolve(returnValue);
      };

      // Wrap reject with cleanup and error debug
      const reject = (errorMessage: string) => {
        // TODO: use debug
        console.error(
          `Error executing "${formattedCommand}" - ${errorMessage}`
        );
        cleanup();
        _reject(errorMessage);
      };

      const handleResponse = (rawData: string) => {
        // TODO: data format validation
        const matches = MESSAGE_PARSE_REGEX.exec(rawData.trim());

        if (matches === null) return reject('error parsing response');

        const [, idString, data] = matches;

        const id = parseInt(idString);
        if (id !== commandId) return;

        return resolve(data);
      };

      this.#parser.on('data', handleResponse);

      this.#port.write(formattedCommand);
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

    const debug = Debug('pmu:runCommand');

    const { args, data } = options;
    const commandId = this.#getCommandId();

    debug(`Send command: ${command}`);

    let response = await this.#sendReceive(commandId, command);
    debugVerbose(response);

    // When a command has arguments they are sent as a second message
    if (args?.length) {
      // if (response !== 'ok') throw new Error(response);

      const argsJoined = args.join(',');
      debug(`Send args: ${argsJoined.slice(0, 30)}`);

      // Send args
      const argCommandId = this.#getCommandId();
      response = await this.#sendReceive(argCommandId, argsJoined);
      debugVerbose(response);
    }

    // Data is sent in another subsequent message
    if (data) {
      debug(`Send data: ${data.slice(0, 30)}`);

      if (command !== Command.DataTransmitRequest)
        throw new Error(`sending data not supported for command ${command}`);

      // if (response !== 'ok') throw new Error(response);

      const dataCommandId = this.#getCommandId();
      response = await this.#sendReceive(dataCommandId, data);
      debugVerbose(response);
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
  protected async queueCommand(
    command: Command,
    options?: CommandOptions | undefined
  ): Promise<string>;

  // Overload with response data
  protected async queueCommand<ResponseData extends Record<string, unknown>>(
    command: Command,
    options?: CommandOptions | undefined
  ): Promise<ResponseData>;

  protected queueCommand<ResponseData extends Record<string, unknown>>(
    command: Command,
    options: CommandOptions = {}
  ): Promise<string | ResponseData> {
    return this.enqueue(() => this.runCommand(command, options)) as Promise<
      string | ResponseData
    >;
  }
}
