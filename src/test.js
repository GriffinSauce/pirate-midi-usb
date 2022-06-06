import { getDevices } from "./index.js";

/**
 * TEST PAD
 */

// Get all connected PM devices
const devices = await getDevices();

// deviceInfo is already populated so you can easily select a target
const bridge6 = devices.find(
  ({ deviceInfo }) => deviceInfo.deviceModel === "Bridge6"
);

console.log("bridge6", bridge6.deviceInfo);

// Commands are bound to simple functions and return a promise
const globalSettings = await bridge6.getGlobalSettings();
