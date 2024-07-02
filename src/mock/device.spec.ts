import { createDevice } from './device';

/**
 * Collects responses and check them once the expected amount is reached
 * Caveats: does not check for superfluous responses, will hang when responses are missing
 */
const assertResponses = (expected: string[], done: () => void) => {
	const responses: string[] = [];
	return (response: string) => {
		responses.push(response);

		if (responses.length < expected.length) {
			return;
		}

		expected.forEach((expectedResponse, index) =>
			expect(responses[index]).toEqual(expectedResponse),
		);

		done();
	};
};

describe('deviceMachine', () => {
	describe('CHCK', () => {
		it('should return deviceInfo immediately', (done) => {
			const device = createDevice({
				onResponse: assertResponses(['{"deviceName":"Bridge 6"}~'], done),
			});

			device.send('CHCK~');
		});
	});

	describe('CTRL', () => {
		it('should return ok for command and args', (done) => {
			const device = createDevice({
				onResponse: assertResponses(['ok~', 'ok~'], done),
			});

			device.send('CTRL~');
			device.send('bankUp~');
		});
	});

	describe('DREQ', () => {
		it('should return ok and requested data', (done) => {
			const device = createDevice({
				onResponse: assertResponses(['ok~', '{"currentBank":0}~'], done),
			});

			device.send('DREQ~');
			device.send('globalSettings~');
		});
	});

	describe('DTXR', () => {
		it('should return ok for each step', (done) => {
			const device = createDevice({
				onResponse: assertResponses(['ok~', 'ok~', 'ok~'], done),
			});

			device.send('DTXR~');
			device.send('globalSettings~');
			device.send(
				`${JSON.stringify({
					name: 'Bridge 8',
				})}~`,
			);
		});
	});

	describe('RSET', () => {
		it('should return to waiting state & reset context', () => {
			const device = createDevice();

			device.send('DTXR~');
			device.send('RSET~');

			expect(device.state.context.command).toBeUndefined();
			expect(device.state.context.args).toBeUndefined();
			expect(device.state.context.data).toBeUndefined();
			expect(device.state.context.response).toBeUndefined();
		});

		it('should behave as expected after reset', (done) => {
			const device = createDevice({
				onResponse: assertResponses(['ok~', 'ok~', 'ok~', 'ok~'], done),
			});

			device.send('DTXR~');
			device.send('RSET~');
			device.send('CTRL~');
			device.send('bankUp~');
		});
	});
});
