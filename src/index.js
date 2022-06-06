import { SerialPort } from "serialport";
import { ReadyParser } from "@serialport/parser-ready";
import { RegexParser } from "@serialport/parser-regex";

// Consider WebSerial binding to make this portable
// https://github.com/nathanjel/serialport-binding-web-serial-api

/**
 * Device manufacturer key, use to filter USB devices
 */
const MANUFACTURER = "Pirate MIDI";

/**
 * Commands and response streams are delimited with ~
 */
const DELIMITER = "~";

/**
 * Command timeout
 */
const TIMEOUT_MS = 5000;

/**
 * Commands receiving JSON structured data
 */
const COMMANDS_RECEIVING_DATA = ["CHCK", "DREQ"];

class PirateMidiDevice {
  // Serial port for sending/receiving data
  #port = null;

  // Serial port with parser inlined to chunk received data
  #parser = null;

  // Increment index for command ids
  #commandIndex = 0;

  deviceInfo = null;

  constructor(serialPortPath) {
    this.#port = new SerialPort({ path: serialPortPath, baudRate: 9600 });
    this.#parser = this.#port.pipe(
      new RegexParser({ regex: new RegExp(DELIMITER) })
    );
  }

  /**
   * Every command should have a unique id, keep a private incrementing counter
   */
  #getCommandId = () => {
    return (this.#commandIndex += 1);
  };

  /**
   * Sends data to the device and returns a promise with returned data
   * @param {Int} commandId - a command id to tie together command- and data transfers
   * @param {String} data - data to send
   * @returns
   */
  #sendRecieve = (commandId, data) => {
    const formattedCommand = `${[commandId, data].join(",")}~`;

    return new Promise((_resolve, _reject) => {
      const timeout = setTimeout(() => {
        console.error(`Timeout executing "${formattedCommand}"`); // TODO: use debug
        _reject(`command timed out`);
      }, TIMEOUT_MS);

      const cleanup = () => {
        clearTimeout(timeout);
        this.#parser.off("data", handleResponse);
      };

      // Wrap resolve with cleanup
      const resolve = (returnValue) => {
        cleanup();
        _resolve(returnValue);
      };

      // Wrap reject with cleanup and error debug
      const reject = (error) => {
        console.error(`Error executing "${formattedCommand}" - ${error}`); // TODO: use debug
        cleanup();
        _reject(error);
      };

      const handleResponse = (rawData) => {
        // TODO: data format validation
        const matches = rawData.trim().match(/^(\d+),([\S\s]*)/);
        if (!matches) reject("error parsing response");

        const [_, idString, data] = matches;

        const id = parseInt(idString);

        if (id !== commandId) return;

        return resolve(data);
      };

      this.#parser.on("data", handleResponse);

      this.#port.write(formattedCommand);
    });
  };

  /**
   * Send a command, optionally with arguments and return response data (if any)
   * @param {String} command - a command string like CHCK
   * @param  {...String} args - any arguments for the command
   * @returns
   */
  #runCommand = async (command, ...args) => {
    const commandId = this.#getCommandId();

    let data = await this.#sendRecieve(commandId, command);
    if (args.length) {
      if (data !== "ok") throw new Error(commandResponse);
      data = await this.#sendRecieve(commandId, args.join(","));
    }

    const parseResponse = COMMANDS_RECEIVING_DATA.includes(command);
    if (parseResponse) {
      if (data === "ok") return reject("no data received");
      try {
        return JSON.parse(data);
      } catch (error) {
        throw new Error(data); // Could be malformed JSON but most likely an error
      }
    }

    if (data !== "ok") throw new Error(data);

    return data;
  };

  updateDeviceInfo = async () => {
    this.deviceInfo = await this.#runCommand("CHCK");
  };

  getGlobalSettings = async () => this.#runCommand("DREQ", "globalSettings");

  getBankSettings = async (bank) => {
    // TODO: validate input
    return this.#runCommand("DREQ", "bankSettings", bank);
  };

  bankUp = () => this.#runCommand("CTRL", "bankUp");

  bankDown = () => this.#runCommand("CTRL", "bankDown");

  goToBank = (bank) => {
    // TODO: validate input
    return this.#runCommand("CTRL", "goToBank", bank);
  };

  toggleFootswitch = (footswitch) => {
    // TODO: validate input
    return this.#runCommand("CTRL", "toggleFootswitch", footswitch);
  };

  deviceRestart = () => this.#runCommand("CTRL", "deviceRestart");

  enterBootloader = () => this.#runCommand("CTRL", "enterBootloader");

  factoryReset = () => this.#runCommand("CTRL", "factoryReset");
}

/**
 * Get any available Pirate Midi devices with device info set
 * @returns { PirateMidiDevice[] }
 */
export const getDevices = async () => {
  // TODO: error handling
  const portsInfo = await SerialPort.list();

  return Promise.all(
    portsInfo
      .filter(({ manufacturer }) => manufacturer === MANUFACTURER)
      .map(async (portInfo) => {
        const device = new PirateMidiDevice(portInfo.path);

        // Populate deviceInfo immediately to reduce friction
        // TODO: error handling
        await device.updateDeviceInfo();

        return device;
      })
  );
};
