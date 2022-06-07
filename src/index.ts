import { SerialPort } from 'serialport';
import { RegexParser } from '@serialport/parser-regex';
import { DeviceInfo } from './types';

// Consider WebSerial binding to make this portable
// https://github.com/nathanjel/serialport-binding-web-serial-api

enum Command {
  Check = 'CHCK',
  Control = 'CTRL',
  DataRequest = 'DREQ',
  DataTransmitRequest = 'DTXR',
  Reset = 'RSET',
}

/**
 * Device manufacturer key, use to filter USB devices
 */
const MANUFACTURER = 'Pirate MIDI';

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
const MESSAGE_PARSE_REGEX = /^(\d+),([\S\s]*)/;
// /^(?<commandId>\d+),(?<data>[\S\s]*)/

class PirateMidiDevice {
  // Serial port for sending/receiving data
  #port: SerialPort;

  // Serial port with parser inlined to chunk received data
  #parser: RegexParser;

  // Increment index for command ids
  #commandIndex = 0;

  deviceInfo?: DeviceInfo;

  constructor(serialPortPath: string) {
    this.#port = new SerialPort({ path: serialPortPath, baudRate: 9600 });
    this.#parser = this.#port.pipe(
      new RegexParser({ regex: new RegExp(DELIMITER) })
    );
  }

  /**
   * Every command should have a unique id, keep a private incrementing counter
   */
  #getCommandId() {
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
   * @param  {...String} args - any arguments for the command
   * @returns
   */
  async #runCommand(command: Command, ...args: string[]) {
    const commandId = this.#getCommandId();

    let data = await this.#sendReceive(commandId, command);

    // When a command has arguments they are sent as a second message
    if (args.length) {
      if (data !== 'ok') throw new Error(data);
      const dataCommandId = this.#getCommandId();
      data = await this.#sendReceive(dataCommandId, args.join(','));
    }

    // Some commands receive JSON either directly or in response to the second data message
    const parseResponse = COMMANDS_RECEIVING_DATA.includes(command);
    if (parseResponse) {
      if (data === 'ok') throw new Error('no data received');
      try {
        // TODO: add generic to type output
        const parsed: unknown = JSON.parse(data);
        return parsed;
      } catch (error) {
        throw new Error(data); // Could be malformed JSON but most likely an error
      }
    }

    if (data !== 'ok') throw new Error(data);

    return data;
  }

  async updateDeviceInfo() {
    this.deviceInfo = (await this.#runCommand(Command.Check)) as DeviceInfo;
  }

  getGlobalSettings() {
    return this.#runCommand(Command.DataRequest, 'globalSettings');
  }

  getBankSettings(bank: number) {
    // TODO: validate input
    return this.#runCommand(Command.DataRequest, 'bankSettings', String(bank));
  }

  bankUp() {
    return this.#runCommand(Command.Control, 'bankUp');
  }

  bankDown() {
    return this.#runCommand(Command.Control, 'bankDown');
  }

  goToBank(bank: number) {
    // TODO: validate input
    return this.#runCommand(Command.Control, 'goToBank', String(bank));
  }

  toggleFootswitch(footswitch: number) {
    // TODO: validate input
    return this.#runCommand(
      Command.Control,
      'toggleFootswitch',
      String(footswitch)
    );
  }

  deviceRestart() {
    return this.#runCommand(Command.Control, 'deviceRestart');
  }

  enterBootloader() {
    return this.#runCommand(Command.Control, 'enterBootloader');
  }

  // Disabled for safety because there might not be a confirmation
  // factoryReset() {
  //   return this.#runCommand(Command.Control, 'factoryReset');
  // }
}

/**
 * Get any available Pirate Midi devices with device info set
 * @returns { PirateMidiDevice[] }
 */
export const getDevices = async (): Promise<PirateMidiDevice[]> => {
  // TODO: error handling
  const portsInfo = await SerialPort.list();

  return Promise.all(
    portsInfo
      .filter(({ manufacturer }) => manufacturer === MANUFACTURER)
      .map(async portInfo => {
        const device = new PirateMidiDevice(portInfo.path);

        // Populate deviceInfo immediately to reduce friction
        // TODO: error handling
        await device.updateDeviceInfo();

        return device;
      })
  );
};
