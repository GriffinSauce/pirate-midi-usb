import { parseMessage } from './parseMessage';

describe('parseMessage', () => {
	it('should parse message with delimiter', () => {
		const data = parseMessage('ok~');
		expect(data).toEqual('ok');
	});

	it('should parse message without delimiter', () => {
		const data = parseMessage('ok');
		expect(data).toEqual('ok');
	});

	it('should parse JSON message', () => {
		const data = parseMessage('{test:"hello~"}~');
		expect(data).toEqual('{test:"hello~"}');
	});

	it('should throw for empty raw data', () => {
		expect(() => parseMessage('')).toThrowError();
	});
});
