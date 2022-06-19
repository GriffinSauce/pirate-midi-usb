import { parseMessage } from './parseMessage';

describe('parseMessage', () => {
  it('should parse message with delimiter', () => {
    const { id, data } = parseMessage('0,ok~');

    expect(id).toEqual(0);
    expect(data).toEqual('ok');
  });

  it('should parse message without delimiter', () => {
    const { id, data } = parseMessage('0,ok');

    expect(id).toEqual(0);
    expect(data).toEqual('ok');
  });

  it('should parse JSON message', () => {
    const { id, data } = parseMessage('0,{test:"hello~"}~');

    expect(id).toEqual(0);
    expect(data).toEqual('{test:"hello~"}');
  });

  it('should throw for unhandled formats', () => {
    expect(() => parseMessage('bla')).toThrowError();
    expect(() => parseMessage('0,')).toThrowError();
    expect(() => parseMessage(',~')).toThrowError();
  });
});
