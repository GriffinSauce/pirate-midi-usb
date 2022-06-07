import { getDevices } from '../src';

describe('index', () => {
  describe('getDevices', () => {
    it('should return nothing', async () => {
      const devices = await getDevices();

      expect(devices).toEqual([]);
    });
  });
});
