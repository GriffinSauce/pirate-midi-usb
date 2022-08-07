import { createDevice, Device, DeviceState } from './device';
import { EventEmitter } from 'events';

export class DevicePortMock extends EventEmitter {
  /**
   * The emulated hardware device
   */
  device: Device;

  /**
   * All messages sent to the device
   */
  sentMessages: string[] = [];

  /**
   * All messages received from the device
   */
  receivedMessages: string[] = [];

  constructor(initialState: DeviceState) {
    super();

    this.device = createDevice({
      initialState,
      onResponse: this.sendResponse,
    });
  }

  resetRecording(): void {
    this.receivedMessages = [];
    this.sentMessages = [];
  }

  sendResponse = (response: string) => {
    this.receivedMessages.push(response);

    this.emit('data', response);
  };

  write(buffer: Buffer): boolean {
    const rawData = Buffer.from(buffer).toString();

    this.sentMessages.push(rawData);

    this.device.send(rawData);

    return true;
  }
}
