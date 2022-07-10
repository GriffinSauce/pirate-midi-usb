import { useState } from 'react';
import { getDevices, PirateMidiDevice } from '../../..';

export default function Example() {
  const [active, setActive] = useState<boolean>(false);
  const [device, setDevice] = useState<PirateMidiDevice>();

  const connect = async () => {
    let _device: PirateMidiDevice;
    try {
      [_device] = await getDevices();
    } catch (error) {
      console.error(error);
      return;
    }

    setDevice(_device);
    setActive(true);

    _device.on('disconnect', () => {
      setActive(false);
    });

    _device.on('connect', () => {
      setActive(true);
    });
  };

  const logDeviceInfo = () => console.log(device.deviceInfo);

  const setBankName = () =>
    device.setBankSettings(1, { bankName: 'Browser 2' });

  const getGlobalSettings = async () =>
    console.log(await device.getGlobalSettings());

  return (
    <>
      <main>
        {active ? (
          <>
            <button onClick={logDeviceInfo}>Log device info</button>
            <button onClick={setBankName}>Set bank name</button>
            <button onClick={getGlobalSettings}>Get global settings</button>
          </>
        ) : (
          <>
            <button onClick={connect}>Connect with device</button>
          </>
        )}
      </main>
    </>
  );
}
