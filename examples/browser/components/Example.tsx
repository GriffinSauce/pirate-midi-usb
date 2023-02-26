import { useState } from 'react';
import { PirateMidiDevice } from '../../..';

export default function Example() {
	const [log, setLog] = useState<Record<string, unknown>[]>([]);
	const [active, setActive] = useState<boolean>(false);
	const [device, setDevice] = useState<PirateMidiDevice>();

	const addLogItem = (msg: typeof log[number]) =>
		setLog((log) => [...log, msg]);

	const connect = async () => {
		let _device: PirateMidiDevice;
		try {
			// Dynamic import so Next picks the browser export
			const { getDevices } = await import('../../..');

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

	const logDeviceInfo = () => addLogItem(device.deviceInfo);

	const setBankName = async () => {
		const { currentBank } = await device.getGlobalSettings();
		await device.setBankSettings(currentBank, {
			bankName: `Browser ${(Math.random() * 100).toFixed()}`,
		});
		await device.refreshDisplay();
		addLogItem({ msg: 'done' });
	};

	const getGlobalSettings = async () =>
		addLogItem(await device.getGlobalSettings());

	return (
		<>
			<main>
				<div>
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
				</div>
				<div>
					{log.map((msg, index) => (
						// rome-ignore lint/suspicious/noArrayIndexKey: yolo
						<div key={index}>{JSON.stringify(msg, null, 2)}</div>
					))}
				</div>
			</main>
		</>
	);
}
