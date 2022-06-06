import { getDevices } from "./index.js";

/**
 * TEST PAD
 */
const devices = await getDevices();

console.log(
  "devices",
  devices.map((device) => device.deviceInfo)
);
