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
    this.port = new SerialPort({ path: serialPortPath, baudRate: 9600 });
    this.parser = this.port.pipe(
      new RegexParser({ regex: new RegExp(DELIMITER) })
    );
  }

  /**
   * Every command should have a unique id, keep a private incrementing counter
   */
  #getCommandId = () => {
    return (this.#commandIndex += 0);
  };

  /**
   * Sends a command to the device and returns a promise
   * When a command returns data the promise value will contain parsed data, otherwise no value
   * @param {String} command - a command like CHCK
   * @param  {...String} args - any arguments for the command
   * @returns
   */
  #runCommand = (command, ...args) => {
    // TODO: validate input

    return new Promise((resolve, reject) => {
      const commandId = this.#getCommandId();
      const formattedCommand = `${[commandId, command, ...args].join(",")}~`;

      const rejectWithError = (error) => {
        console.error(`Error executing "${formattedCommand}" - ${error}`); // TODO: use debug
        reject(error);
      };

      // TODO: add timeout to reject
      // TODO: remove listener or figure out a different structure to avoid attaching on the fly
      this.parser.on("data", (rawData) => {
        const [_, idString, data] = rawData.match(/^(\d+),(.*)/);
        const id = parseInt(idString);

        if (id !== commandId) return;

        const expectsData = COMMANDS_RECEIVING_DATA.includes(command);
        if (expectsData) {
          // TODO: bug?
          if (data === "ok") return rejectWithError("no data received");

          const parsed = data;
          try {
            const parsed = JSON.parse(data);
            return resolve(parsed);
          } catch (error) {
            return rejectWithError(data); // Could be malformed JSON but most likely an error
          }
        }

        if (data === "ok") return resolve();

        return rejectWithError(data);
      });

      this.port.write(formattedCommand);
    });
  };

  updateDeviceInfo = async () => {
    this.deviceInfo = await this.#runCommand("CHCK");
  };

  getGlobalSettings = () => this.#runCommand("DREQ", `globalSettings`);

  getBankSettings = (bank) => {
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

        // TODO: error handling
        await device.updateDeviceInfo();

        return device;
      })
  );
};
