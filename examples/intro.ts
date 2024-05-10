import { getDevices } from '../src';
import { globalSettings as globalSettingsData } from '../test/fixtures';

const wait = (delay: number) =>
	new Promise((resolve) => setTimeout(resolve, delay));

/**
 * This is a nice test pad for development that shows how to use a few commands
 */
void (async () => {
	// Get all connected PM devices
	const devices = await getDevices();

	// deviceInfo is already populated so you can easily select a target with find, or just select the first
	const device = devices[0];

	if (!device) {
		console.log('No device found');
		return;
	}

	console.log('device', device.deviceInfo);

	// Commands are bound to simple functions and return a promise
	// The returned promise _should_ reject when there is malformed input or an error with the device.
	const bankSettings = await device.getBankSettings(0);
	console.log('bankSettings.bankName', bankSettings.bankName);

	// Some commands might take arguments & don't return any data
	await device.goToBank(0);

	await device.setBankSettings(0, { bankName: 'Hello' });
	await device.refreshDisplay();
	await wait(1000);

	// Send data to the device
	// TODO: we're sending a complete object here as a workaround, sending a partial borks the device
	await device.setGlobalSettings({ ...globalSettingsData, midiChannel: 0 });
	await wait(1000);

	// And read it
	const globalSettings = await device.getGlobalSettings();
	console.log('globalSettings.midiChannel', globalSettings.midiChannel);

	// Commands are queued so you can fire off multiple promises without waiting for them
	for (var i = 0; i < 3; i++) {
		console.log(`Going to bank${i}`);
		await device.goToBank(i);
		await wait(1000);
	}

	// But note that you should not exit without waiting because the device might stay in a waiting state
	process.exit(0); // eslint-disable-line no-process-exit
})();
