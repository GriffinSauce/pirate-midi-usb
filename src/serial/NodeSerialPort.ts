import { SerialPort } from 'serialport';
import { RegexParser } from '@serialport/parser-regex';
import EventEmitter from 'events';

/**
 * Commands and response streams are delimited with ~
 */
const DELIMITER = '~';

/**
 * Maintain node serial port for device
 */
export class NodeSerialPort extends EventEmitter {
  // Serial port for sending/receiving data
  #port: SerialPort;

  // Serial port with parser inlined to chunk received data
  #parser: RegexParser;

  constructor(port: SerialPort) {
    super();

    this.#port = port;
    this.#parser = port.pipe(new RegexParser({ regex: new RegExp(DELIMITER) }));

    this.#parser.on('data', data => this.emit('data', data));
  }

  async connect(): Promise<void> {
    // Auto open is async so instead we'll manually open it so we can wait for it
    return new Promise<void>((resolve, reject) => {
      this.#port.open(error => (error ? reject(error) : resolve()));
    });
  }

  write(data: string): void {
    this.#port.write(data);
  }
}
