import { MessageTransformer } from './MessageTransformer';
import { EventEmitter } from 'events';

/**
 * Device vendor id, use to filter USB devices
 */
const USB_VENDOR_ID = 1155;

/**
 * Maintain web serial port for device
 */
export class WebSerialPort extends EventEmitter {
  port?: SerialPort;
  isOpening = false;
  isOpen = false;
  writer?: WritableStreamDefaultWriter<string>;
  writableStreamClosed?: Promise<void>;
  reader?: ReadableStreamDefaultReader<string>;
  readableStreamClosed?: Promise<void>;

  async connect(): Promise<void> {
    try {
      // Prompt user to select any serial port.
      this.port = await navigator.serial.requestPort({
        filters: [{ usbVendorId: USB_VENDOR_ID }],
      });
      await this.#open();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : (error as string);
      throw new Error(`Requesting port failed - ${message}`);
    }
  }

  async #open(): Promise<void> {
    if (this.isOpen) throw new Error('Port is already opened');
    if (this.isOpening) throw new Error('Port is opening');

    this.isOpening = true;
    try {
      await this.port!.open({ baudRate: 9600 });

      this.#createWriter();
      void this.#listenToPort();
      this.#monitorConnection();

      this.isOpen = true;
      this.isOpening = false;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : (error as string);
      throw new ErrorEvent(`Opening port Failed - ${message}`);
    }

    this.emit('connect', true);
  }

  #createWriter(): void {
    const textEncoder = new TextEncoderStream();
    this.writableStreamClosed = textEncoder.readable.pipeTo(
      this.port!.writable!
    );
    this.writer = textEncoder.writable.getWriter();
  }

  async #listenToPort(): Promise<void> {
    const textDecoder = new TextDecoderStream();
    this.readableStreamClosed = this.port!.readable!.pipeTo(
      textDecoder.writable
    );
    this.reader = textDecoder.readable
      .pipeThrough(new TransformStream(new MessageTransformer()))
      .getReader();

    // Listen to data coming from the serial device.
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const { value, done } = await this.reader.read();
      if (done) {
        // Allow the serial port to be closed later.
        this.reader.releaseLock();
        break;
      }
      this.emit('data', value);
    }
  }

  async write(data: string): Promise<void> {
    if (!this.isOpen) throw new Error('Port not open');

    await this.writer!.write(data);
  }

  close = async (): Promise<void> => {
    if (!this.isOpen) throw new Error('Port not open');

    try {
      void this.reader!.cancel();
    } catch (error) {
      console.error(error);
    }
    await this.readableStreamClosed!.catch(() => {
      /* Ignore the error */
    });

    try {
      void this.writer!.close();
    } catch (error) {
      console.error(error);
    }
    await this.writableStreamClosed;

    await this.port!.close();

    this.isOpen = false;
  };

  #onDisconnect = (event: Event): void => {
    if (event.target !== this.port) return;

    this.emit('disconnect');
    console.info('Device disconnected');

    navigator.serial.removeEventListener('disconnect', this.#onDisconnect);

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    navigator.serial.addEventListener('connect', this.#onReconnect);

    void this.close();
  };

  #onReconnect = async (event: Event): Promise<void> => {
    const ports = await navigator.serial.getPorts();

    if (ports.length > 2) {
      console.log('Cannot safely reconnect, unsure which device is which');
      return;
    }

    const port = ports.find(
      port => port.getInfo().usbVendorId === USB_VENDOR_ID
    );

    if (!port) return;

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    navigator.serial.removeEventListener('connect', this.#onReconnect);

    console.info('Trying to reopen port');

    if (this.isOpen) return;
    if (this.isOpening) return;

    this.port = port;
    await this.#open();
    console.info('Device reconnected');
    // connect is emitted in open so the first connection can be handled by the same implementation
  };

  #monitorConnection(): void {
    navigator.serial.addEventListener('disconnect', this.#onDisconnect);
  }
}
