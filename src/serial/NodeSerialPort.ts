import { SerialPort } from 'serialport';
import { RegexParser } from '@serialport/parser-regex';
import { EventEmitter } from 'events';

/**
 * Commands and response streams are delimited with ~
 */
const DELIMITER = '~';

/**
 * Device manufacturer key, use to filter USB devices
 */
const MANUFACTURER = 'Pirate MIDI';

/**
 * Maintain node serial port for device
 */
export class NodeSerialPort extends EventEmitter {
	type = 'node' as const;

	// Serial port for sending/receiving data
	#port: SerialPort;

	// Serial port with parser inlined to chunk received data
	#parser: RegexParser;

	constructor(port: SerialPort) {
		super();

		this.#port = port;
		this.#parser = port.pipe(new RegexParser({ regex: new RegExp(DELIMITER) }));

		this.#parser.on('data', (data) => this.emit('data', data));
	}

	static async list(): Promise<NodeSerialPort[]> {
		// TODO: error handling
		const portsInfo = await SerialPort.list();
		return Promise.all(
			portsInfo
				.filter(({ manufacturer }) => manufacturer === MANUFACTURER)
				.map((portInfo) => {
					const port = new SerialPort({
						path: portInfo.path,
						baudRate: 115200,
						autoOpen: false,
					});
					return new NodeSerialPort(port);
				}),
		);
	}

	async connect(): Promise<void> {
		// Auto open doesn't wait so manually open
		return new Promise((resolve, reject) => {
			this.#port.open((error) => {
				if (error) {
					return reject(error);
				}
				resolve();
			});
		});
	}

	write(data: string): void {
		this.#port.write(data);
	}

	async close(): Promise<void> {
		return new Promise((resolve, reject) => {
			this.#port.close((error) => {
				if (error) {
					return reject(error);
				}
				resolve();
			});
		});
	}
}
