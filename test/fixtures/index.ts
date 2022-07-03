import {
  BankSettings,
  DeviceInfo,
  Footswitch,
  GlobalSettings,
} from '../../src/types';

export const deviceInfo: DeviceInfo = {
  deviceModel: 'Bridge6',
  firmwareVersion: '1.1.0',
  hardwareVersion: '1.0.1',
  uId: '4d00344d00384d003c',
  deviceName: 'Bridge 6',
  profileId: '0',
};

export const globalSettings: GlobalSettings = {
  currentBank: 1,
  midiChannel: 0,
  ledBrightness: 1,
  flexi1Mode: 'unassigned',
  flexi2Mode: 'unassigned',
  uiMode: 'standard',
  preserveStates: false,
  sendStates: true,
  bankPcMidiOutputs: {
    flexi1: 1,
    flexi2: 1,
    midi0: 1,
    usb: 1,
  },
  bankTemplateIndex: 0,
  deviceName: 'Bridge 6',
  profileId: '0',
  customLedColours: [
    '0',
    '0',
    '0',
    '0',
    '0',
    '0',
    '0',
    '0',
    '0',
    '0',
    '0',
    '0',
  ],
  midiClocks: [
    {
      outputs: {
        flexi1: true,
        flexi2: true,
        midi0: true,
        usb: true,
      },
    },
    {
      outputs: {
        flexi1: true,
        flexi2: true,
        midi0: true,
        usb: true,
      },
    },
  ],
  flexi1ThruHandles: {
    flexi1: false,
    flexi2: false,
    midi0: false,
    usb: false,
  },
  flexi2ThruHandles: {
    flexi1: false,
    flexi2: false,
    midi0: false,
    usb: false,
  },
  midi0ThruHandles: {
    flexi1: false,
    flexi2: false,
    midi0: false,
    usb: false,
  },
  usbThruHandles: {
    flexi1: false,
    flexi2: false,
    midi0: false,
    usb: false,
  },
  expMessages: [
    {
      numMessages: 0,
      messages: [],
    },
    {
      numMessages: 0,
      messages: [],
    },
    {
      numMessages: 0,
      messages: [],
    },
    {
      numMessages: 0,
      messages: [],
    },
  ],
  auxMessages: [
    {
      tip: {
        pressMessages: {
          numMessages: 0,
          messages: [],
        },
        holdMessages: {
          numMessages: 0,
          messages: [],
        },
      },
      ring: {
        pressMessages: {
          numMessages: 0,
          messages: [],
        },
        holdMessages: {
          numMessages: 0,
          messages: [],
        },
      },
      tipRing: {
        pressMessages: {
          numMessages: 0,
          messages: [],
        },
        holdMessages: {
          numMessages: 0,
          messages: [],
        },
      },
    },
    {
      tip: {
        pressMessages: {
          numMessages: 0,
          messages: [],
        },
        holdMessages: {
          numMessages: 0,
          messages: [],
        },
      },
      ring: {
        pressMessages: {
          numMessages: 0,
          messages: [],
        },
        holdMessages: {
          numMessages: 0,
          messages: [],
        },
      },
      tipRing: {
        pressMessages: {
          numMessages: 0,
          messages: [],
        },
        holdMessages: {
          numMessages: 0,
          messages: [],
        },
      },
    },
  ],
};

const footSwitch: Footswitch = {
  name: 'FS',
  primaryState: false,
  secondaryState: false,
  primaryMode: 'toggle',
  secondaryMode: 'doublePressToggle',
  primaryColor: 'f08080',
  secondaryColor: 'ffff',
  primaryLedMode: 'onOff',
  secondaryLedMode: 'onOff',
  stepInterval: 1,
  minScrollLimit: 0,
  maxScrollLimit: 127,
  sequentialPattern: 'forward',
  sequentialRepeat: 'all',
  sequentialSendMode: 'always',
  linkedSwitch: 0,
  numSteps: 12,
  numSequentialMessages: [],
  sequentialLabels: [],
  sequentialColors: [],
  currentStep: 0,
  midiClock: null,
  lfo: {
    state: null,
    frequency: '0.1',
    minLimit: 0,
    maxLimit: 127,
    trigger: 'null',
    messages: null,
    waveform: 'sine',
    resolution: 1,
    resetOnStop: true,
    clock: null,
  },
  toggleOnMessages: {
    numMessages: 1,
    messages: [
      {
        statusByte: 'b0',
        dataByte1: '0',
        dataByte2: '7f',
        outputs: {
          midi0: true,
          flexi1: true,
          flexi2: true,
          usb: true,
        },
      },
    ],
  },
  toggleOffMessages: {
    numMessages: 1,
    messages: [
      {
        statusByte: 'b0',
        dataByte1: '0',
        dataByte2: '0',
        outputs: {
          midi0: true,
          flexi1: true,
          flexi2: true,
          usb: true,
        },
      },
    ],
  },
  pressMessages: {
    numMessages: 0,
    messages: [],
  },
  releaseMessages: {
    numMessages: 0,
    messages: [],
  },
  doublePressMessages: {
    numMessages: 0,
    messages: [],
  },
  holdMessages: {
    numMessages: 0,
    messages: [],
  },
  holdReleaseMessages: {
    numMessages: 0,
    messages: [],
  },
  secondaryToggleOnMessages: {
    numMessages: 0,
    messages: [],
  },
  secondaryToggleOffMessages: {
    numMessages: 0,
    messages: [],
  },
};

export const bankSettings: BankSettings = {
  bankName: 'Bank',
  bankId: '0',
  bankMessages: {
    numMessages: 0,
    messages: [],
  },
  expMessages: [
    {
      numMessages: 0,
      messages: [],
    },
    {
      numMessages: 0,
      messages: [],
    },
    {
      numMessages: 0,
      messages: [],
    },
    {
      numMessages: 0,
      messages: [],
    },
  ],
  auxMessages: [
    {
      tip: {
        pressMessages: {
          numMessages: 0,
          messages: [],
        },
        holdMessages: {
          numMessages: 0,
          messages: [],
        },
      },
      ring: {
        pressMessages: {
          numMessages: 0,
          messages: [],
        },
        holdMessages: {
          numMessages: 0,
          messages: [],
        },
      },
      tipRing: {
        pressMessages: {
          numMessages: 0,
          messages: [],
        },
        holdMessages: {
          numMessages: 0,
          messages: [],
        },
      },
    },
    {
      tip: {
        pressMessages: {
          numMessages: 0,
          messages: [],
        },
        holdMessages: {
          numMessages: 0,
          messages: [],
        },
      },
      ring: {
        pressMessages: {
          numMessages: 0,
          messages: [],
        },
        holdMessages: {
          numMessages: 0,
          messages: [],
        },
      },
      tipRing: {
        pressMessages: {
          numMessages: 0,
          messages: [],
        },
        holdMessages: {
          numMessages: 0,
          messages: [],
        },
      },
    },
  ],
  switchGroups: [[], [], [], [], [], [], [], []],
  footswitches: [
    footSwitch,
    footSwitch,
    footSwitch,
    footSwitch,
    footSwitch,
    footSwitch,
  ],
};
