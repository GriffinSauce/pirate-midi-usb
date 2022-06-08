# pirate-midi-usb

[![npm package][npm-img]][npm-url]
[![Build Status][build-img]][build-url]
[![Downloads][downloads-img]][downloads-url]
[![Issues][issues-img]][issues-url]
[![Code Coverage][codecov-img]][codecov-url]
[![Commitizen Friendly][commitizen-img]][commitizen-url]
[![Semantic Release][semantic-release-img]][semantic-release-url]

> Easily interact with Pirate Midi devices over USB from Node.js

## Install

```bash
npm install pirate-midi-usb
```

## Usage

```ts
import { getDevices } from 'pirate-midi-usb';

const devices = await getDevices();

await device[0].goToBank(2);
```

## API

This package implements the _Pirate Midi Device API_ to interact with Bridge4 and Bridge6 devices, see the [API documentation](https://github.com/Pirate-MIDI/device-descriptors-api) for the underlying details.

### Use `getDevices` to retrieve available devices

Scans USB devices and returns a promise with an array of [PirateMidiDevice](#PirateMidiDevice) instances (one per device) to interact with.

```ts
import { getDevices } from 'pirate-midi-usb';

const devices = await getDevices();

const bridge6 = device.find(device => device.deviceName === 'Bridge6')
```

Each instance of a device is returned with the `deviceInfo` prefetched. This information could be used to select a specific device when multiple are connected. When no devices are found an empty array will be returned

### Use `PirateMidiDevice` methods to interact with the device

Check [PirateMidiDevice.ts](src/PirateMidiDevice.ts) to see all implemented methods.

#### Examples

```ts
// Fetch data from the device
const globalSettings = await device.getGlobalSettings();

// Send data to the device
await device.setGlobalSettings({ midiChannel: 2 })

// Control the device
await device[0].goToBank(2);
```

The returned promise will reject when there is malformed input or an error with the device.

## Thanks

Thanks to Pirate Midi for the awesome devices and the openness.

This repo was started with [typescript-npm-package-template](https://github.com/ryansonshine/typescript-npm-package-template)

### Tooling used

- [Semantic Release](https://github.com/semantic-release/semantic-release)
- [Issue Templates](https://github.com/GriffinSauce/pirate-midi-usb/tree/main/.github/ISSUE_TEMPLATE)
- [GitHub Actions](https://github.com/GriffinSauce/pirate-midi-usb/tree/main/.github/workflows)
- [Codecov](https://about.codecov.io/)
- [VSCode Launch Configurations](https://github.com/GriffinSauce/pirate-midi-usb/blob/main/.vscode/launch.json)
- [TypeScript](https://www.typescriptlang.org/)
- [Husky](https://github.com/typicode/husky)
- [Lint Staged](https://github.com/okonet/lint-staged)
- [Commitizen](https://github.com/search?q=commitizen)
- [Jest](https://jestjs.io/)
- [ESLint](https://eslint.org/)
- [Prettier](https://prettier.io/)

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
