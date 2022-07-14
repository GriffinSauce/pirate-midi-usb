import { PirateMidiDevice } from './PirateMidiDevice';
import { bankSettings, deviceInfo, globalSettings } from '../test/fixtures';
import { DevicePortMock } from '../test/mocks/DevicePortMock';

describe('PirateMidiDevice', () => {
  let port: DevicePortMock;
  let device: PirateMidiDevice;

  beforeEach(() => {
    port = new DevicePortMock({
      deviceInfo,
      globalSettings,
      banks: [],
    });
    device = new PirateMidiDevice(port);
  });

  describe('pre-updateDeviceInfo', () => {
    describe('constructor', () => {
      it('should initialize without errors', () => {
        expect(device).toBeInstanceOf(PirateMidiDevice);
      });
    });

    it('should throw an error before device info is populated', () => {
      expect(() => device.validateBankNumber(0)).toThrowError(/device info/);
    });

    describe('updateDeviceInfo', () => {
      it('should request device info, store and return it', async () => {
        expect(device.deviceInfo).toEqual(undefined);

        const response = await device.updateDeviceInfo();

        expect(device.deviceInfo).toEqual(deviceInfo);
        expect(response).toEqual(deviceInfo);
      });

      it('should send/receive the right messages', async () => {
        await device.updateDeviceInfo();

        expect(port.sentMessages).toHaveLength(1);
        expect(port.sentMessages[0]).toMatch(/\d,CHCK~/);
        expect(port.receivedMessages.length).toEqual(1);
      });
    });
  });

  describe('post-updateDeviceInfo', () => {
    beforeEach(async () => {
      await device.updateDeviceInfo();
      port.resetRecording();
    });

    describe('getGlobalSettings', () => {
      it('should request global settings', async () => {
        const response = await device.getGlobalSettings();

        expect(response).toEqual(globalSettings);
      });

      it('should send/receive the right messages', async () => {
        await device.getGlobalSettings();

        expect(port.sentMessages).toHaveLength(2);
        expect(port.sentMessages[0]).toMatch(/\d,DREQ~/);
        expect(port.sentMessages[1]).toMatch(/\d,globalSettings~/);
        expect(port.receivedMessages.length).toEqual(2);
      });
    });

    describe('getBankSettings', () => {
      const bank0 = { ...bankSettings, bankId: '0' };
      const bank1 = { ...bankSettings, bankId: '1' };

      beforeEach(async () => {
        port = new DevicePortMock({
          deviceInfo,
          globalSettings,
          banks: [bank0, bank1],
        });
        device = new PirateMidiDevice(port);

        await device.updateDeviceInfo();
        port.resetRecording();
      });

      it('should request bank settings for the right banks', async () => {
        expect(await device.getBankSettings(0)).toEqual(bank0);
        expect(await device.getBankSettings(1)).toEqual(bank1);
      });

      it('should send/receive the right messages', async () => {
        await device.getBankSettings(0);

        expect(port.sentMessages).toHaveLength(2);
        expect(port.sentMessages[0]).toMatch(/\d,DREQ~/);
        expect(port.sentMessages[1]).toMatch(/\d,bankSettings,0~/);
        expect(port.receivedMessages.length).toEqual(2);
      });

      it('should throw a validation error for invalid arguments', () => {
        // @ts-expect-error
        expect(() => device.getBankSettings('test')).toThrowError(/valid/);
      });

      it('should throw a validation error when out of range', () => {
        expect(() => device.getBankSettings(-1)).toThrowError(/range/);
        expect(() => device.getBankSettings(200)).toThrowError(/range/);
      });
    });

    describe('setProfileId', () => {
      it('should resolve', async () => {
        await expect(device.setProfileId('0')).resolves.not.toThrow();
      });

      it('should send/receive the right messages', async () => {
        await device.setProfileId('0');

        expect(port.sentMessages).toHaveLength(2);
        expect(port.sentMessages[0]).toMatch(/\d,DTXR~/);
        expect(port.sentMessages[1]).toMatch(/\d,profileId,0~/);
        expect(port.receivedMessages.length).toEqual(2);
      });
    });

    describe('setGlobalSettings', () => {
      it('should resolve', async () => {
        await expect(
          device.setGlobalSettings({ midiChannel: 1 })
        ).resolves.not.toThrow();
      });

      it('should send/receive the right messages', async () => {
        await device.setGlobalSettings({ midiChannel: 1 });

        expect(port.sentMessages).toHaveLength(3);
        expect(port.sentMessages[0]).toMatch(/\d,DTXR~/);
        expect(port.sentMessages[1]).toMatch(/\d,globalSettings~/);
        expect(port.sentMessages[2]).toMatch(/\d,{"midiChannel":1}~/);
        expect(port.receivedMessages.length).toEqual(3);
      });
    });

    describe('setBankSettings', () => {
      it('should resolve', async () => {
        await expect(
          device.setBankSettings(0, { bankName: 'Test' })
        ).resolves.not.toThrow();
      });

      it('should send/receive the right messages', async () => {
        await device.setBankSettings(0, { bankName: 'Test' });

        expect(port.sentMessages).toHaveLength(3);
        expect(port.sentMessages[0]).toMatch(/\d,DTXR~/);
        expect(port.sentMessages[1]).toMatch(/\d,bankSettings,0~/);
        expect(port.sentMessages[2]).toMatch(/\d,{"bankName":"Test"}~/);
        expect(port.receivedMessages.length).toEqual(3);
      });

      it('should throw a validation error for invalid arguments', () => {
        expect(() =>
          // @ts-expect-error
          device.setBankSettings('test', { bankName: 'Test' })
        ).toThrowError(/valid/);
      });

      it('should throw a validation error when out of range', () => {
        expect(() =>
          device.setBankSettings(-1, { bankName: 'Test' })
        ).toThrowError(/range/);
        expect(() =>
          device.setBankSettings(200, { bankName: 'Test' })
        ).toThrowError(/range/);
      });
    });

    describe('bankUp', () => {
      it('should resolve', async () => {
        await expect(device.bankUp()).resolves.not.toThrow();
      });

      it('should send/receive the right messages', async () => {
        await device.bankUp();

        expect(port.sentMessages).toHaveLength(2);
        expect(port.sentMessages[0]).toMatch(/\d,CTRL~/);
        expect(port.sentMessages[1]).toMatch(/\d,bankUp~/);
        expect(port.receivedMessages.length).toEqual(2);
      });
    });

    describe('bankDown', () => {
      it('should resolve', async () => {
        await expect(device.bankDown()).resolves.not.toThrow();
      });

      it('should send/receive the right messages', async () => {
        await device.bankDown();

        expect(port.sentMessages).toHaveLength(2);
        expect(port.sentMessages[0]).toMatch(/\d,CTRL~/);
        expect(port.sentMessages[1]).toMatch(/\d,bankDown~/);
        expect(port.receivedMessages.length).toEqual(2);
      });
    });

    describe('goToBank', () => {
      it('should resolve', async () => {
        await expect(device.goToBank(0)).resolves.not.toThrow();
      });

      it('should send/receive the right messages', async () => {
        await device.goToBank(0);

        expect(port.sentMessages).toHaveLength(2);
        expect(port.sentMessages[0]).toMatch(/\d,CTRL~/);
        expect(port.sentMessages[1]).toMatch(/\d,goToBank,0~/);
        expect(port.receivedMessages.length).toEqual(2);
      });
    });

    describe('toggleFootswitch', () => {
      it('should resolve', async () => {
        await expect(device.toggleFootswitch(0)).resolves.not.toThrow();
      });

      it('should send/receive the right messages', async () => {
        await device.toggleFootswitch(0);

        expect(port.sentMessages).toHaveLength(2);
        expect(port.sentMessages[0]).toMatch(/\d,CTRL~/);
        expect(port.sentMessages[1]).toMatch(/\d,toggleFootswitch,0~/);
        expect(port.receivedMessages.length).toEqual(2);
      });

      it('should throw a validation error for invalid arguments', () => {
        // @ts-expect-error
        expect(() => device.toggleFootswitch('test')).toThrowError(/valid/);
      });

      it('should throw a validation error when out of range', () => {
        expect(() => device.toggleFootswitch(-1)).toThrowError(/range/);
        expect(() => device.toggleFootswitch(20)).toThrowError(/range/);
      });
    });

    describe('deviceRestart', () => {
      it('should resolve', async () => {
        await expect(device.deviceRestart()).resolves.not.toThrow();
      });

      it('should send/receive the right messages', async () => {
        await device.deviceRestart();

        expect(port.sentMessages).toHaveLength(2);
        expect(port.sentMessages[0]).toMatch(/\d,CTRL~/);
        expect(port.sentMessages[1]).toMatch(/\d,deviceRestart~/);
        expect(port.receivedMessages.length).toEqual(2);
      });
    });

    describe('enterBootloader', () => {
      it('should resolve', async () => {
        await expect(device.enterBootloader()).resolves.not.toThrow();
      });

      it('should send/receive the right messages', async () => {
        await device.enterBootloader();

        expect(port.sentMessages).toHaveLength(2);
        expect(port.sentMessages[0]).toMatch(/\d,CTRL~/);
        expect(port.sentMessages[1]).toMatch(/\d,enterBootloader~/);
        expect(port.receivedMessages.length).toEqual(2);
      });
    });

    describe('factoryReset', () => {
      it('should resolve', async () => {
        await expect(
          device.factoryReset({ sure: true })
        ).resolves.not.toThrow();
      });

      it('should send/receive the right messages', async () => {
        await device.factoryReset({ sure: true });

        expect(port.sentMessages).toHaveLength(2);
        expect(port.sentMessages[0]).toMatch(/\d,CTRL~/);
        expect(port.sentMessages[1]).toMatch(/\d,factoryReset~/);
        expect(port.receivedMessages.length).toEqual(2);
      });

      it('should throw with an error referencing "sure"', () => {
        expect(() => device.factoryReset()).toThrowError(/sure/);
      });

      it('should not send any messages when not sure', async () => {
        try {
          await device.factoryReset();
        } catch (err) {
          /* no op */
        }
        expect(port.sentMessages).toHaveLength(0);
      });
    });
  });
});
