# pirate-midi-usb

[![npm package][npm-img]][npm-url]
[![Build Status][build-img]][build-url]
[![Downloads][downloads-img]][downloads-url]
[![Issues][issues-img]][issues-url]
[![Code Coverage][codecov-img]][codecov-url]
[![Commitizen Friendly][commitizen-img]][commitizen-url]
[![Semantic Release][semantic-release-img]][semantic-release-url]

> Easily interact with Pirate Midi devices over USB from JavaScript

<!-- vscode-markdown-toc -->
* [Install](#Install)
* [Usage](#Usage)
* [API](#API)
	* [Use `getDevices` to retrieve available devices](#UsegetDevicestoretrieveavailabledevices)
	* [Use `PirateMidiDevice` methods to interact with the device](#UsePirateMidiDevicemethodstointeractwiththedevice)
	* [Managing the connection](#Managingtheconnection)
	* [Debugging & testing](#Debugging)
* [Examples](#Examples)
* [Thanks](#Thanks)

<!-- vscode-markdown-toc-config
	numbering=false
	autoSave=true
	/vscode-markdown-toc-config -->
<!-- /vscode-markdown-toc -->

## <a id='Install'></a>Install

```bash
npm install pirate-midi-usb
```

## <a id='Usage'></a>Usage

```ts
import { getDevices } from 'pirate-midi-usb';

const devices = await getDevices();

await device[0].goToBank(2);
```

## <a id='API'></a>API

This package implements the _Pirate Midi Device API_ to interact with Bridge4 and Bridge6 devices, see the [API documentation](https://github.com/Pirate-MIDI/device-descriptors-api) for the underlying details.

### <a id='UsegetDevicestoretrieveavailabledevices'></a>Use `getDevices` to retrieve available devices

Scans USB devices and returns a promise with an array of [PirateMidiDevice](#PirateMidiDevice) instances (one per device) to interact with.

> **Note**
> In the browser a dialog will be triggered for the user to select and give access to a single device. Currently only a single device will be returned.

```ts
import { getDevices } from 'pirate-midi-usb';

const devices = await getDevices();

const bridge6 = device.find(device => device.deviceName === 'Bridge6');
```

Each instance of a device is returned with the `deviceInfo` prefetched. This information could be used to select a specific device when multiple are connected. When no devices are found an empty array will be returned

### <a id='UsePirateMidiDevicemethodstointeractwiththedevice'></a>Use `PirateMidiDevice` methods to interact with the device

Check [PirateMidiDevice.ts](src/PirateMidiDevice.ts) to see all implemented methods.

### <a id='Managingtheconnection'></a>Managing the connection

Devices may be plugged out while your app/script is running. When a device it returned it is ready to use but you should monitor the connection and respond accordingly to avoid interacting with an unavailable device:

```.ts
const [device] = await getDevices();

// Activate UI

device.on('disconnect', () => {
  // Deactivate UI
});

// When the same device is plugged in again the instance will auto-reconnect and fire a "connect" event.
device.on('connect', () => {
  // Activate UI
});
```
> **Note**
> This behaviour is only implemented for browsers at the moment.

### <a id='Mock'></a>Mock device

To aid in testing or running a demo, a mock device can be created using `getMockDevice`:

```.ts
// Provide device data to the mock
const device = await getMockDevice({
  deviceInfo,
  globalSettings,
  bankSettings,
});

// Methods will behave as if a real device is connected BUT it's state will never change from the data given.
device.getGlobalSettings()
```

The mock device is **static**, `set..` and control methods will respond as usual but have no actual effect.

### <a id='Debugging'></a>Debugging

Use environment variables to enable logging:

- `DEBUG=pmu*` - high level logs
- `DEBUG=verbose:pmu*` - verbose (large output!)

The logs can be filtered by keys, like `pmu:runCommand*`, see Debug docs.

## <a id='Examples'></a>Examples

See the [examples](./examples/) folder, check out the [intro example](./examples/intro.ts) to get started!

Run examples by their filename:

```
npm run examples:intro
```

## <a id='Thanks'></a>Thanks

Thanks to Pirate Midi for the awesome devices and the openness.

This repo was started with [typescript-npm-package-template](https://github.com/ryansonshine/typescript-npm-package-template)

<!-- Image sources -->

[build-img]: https://github.com/GriffinSauce/pirate-midi-usb/actions/workflows/release.yml/badge.svg
[build-url]: https://github.com/GriffinSauce/pirate-midi-usb/actions/workflows/release.yml
[downloads-img]: https://img.shields.io/npm/dt/pirate-midi-usb
[downloads-url]: https://www.npmtrends.com/pirate-midi-usb
[npm-img]: https://img.shields.io/npm/v/pirate-midi-usb
[npm-url]: https://www.npmjs.com/package/pirate-midi-usb
[issues-img]: https://img.shields.io/github/issues/GriffinSauce/pirate-midi-usb
[issues-url]: https://github.com/GriffinSauce/pirate-midi-usb/issues
[codecov-img]: https://codecov.io/gh/GriffinSauce/pirate-midi-usb/branch/main/graph/badge.svg
[codecov-url]: https://codecov.io/gh/GriffinSauce/pirate-midi-usb
[semantic-release-img]: https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg
[semantic-release-url]: https://github.com/semantic-release/semantic-release
[commitizen-img]: https://img.shields.io/badge/commitizen-friendly-brightgreen.svg
[commitizen-url]: http://commitizen.github.io/cz-cli/
