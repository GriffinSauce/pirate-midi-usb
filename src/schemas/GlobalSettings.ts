import { suretype, v, compile, TypeOf } from 'suretype';
import { schemaEnabledMidiOuts } from './EnabledMidiOuts';
import { schemaAuxMessages, schemaExpMessage } from './Messages';

export const schemaFlexiMode = suretype(
  {
    name: 'FlexiMode',
  },
  v.anyOf([
    v.string().const('unassigned'),
    v.string().const('midiOutA'),
    v.string().const('midiOutB'),
    v.string().const('deviceLink'),
    v.string().const('expSingle'),
    v.string().const('expDual'),
    v.string().const('switchIn'),
    v.string().const('switchOut'),
    v.string().const('tapTempo'),
  ])
);

export const schemaMidiClock = suretype(
  {
    name: 'MidiClock',
  },
  v.object({
    outputs: schemaEnabledMidiOuts,
  })
);

export const schemaMidiChannel = suretype(
  {
    name: 'MidiChannel',
  },
  v.anyOf([
    v.number().const(0),
    v.number().const(1),
    v.number().const(2),
    v.number().const(3),
    v.number().const(4),
    v.number().const(5),
    v.number().const(6),
    v.number().const(7),
    v.number().const(8),
    v.number().const(9),
    v.number().const(10),
    v.number().const(11),
    v.number().const(12),
    v.number().const(13),
    v.number().const(14),
    v.number().const(15),
    v.number().const(16),
  ])
);

export const schemaBankPcMidiOutputChannels = suretype(
  {
    name: 'BankPcMidiOutputChannels',
  },
  v.object({
    midi0: schemaMidiChannel,
    flexi1: schemaMidiChannel,
    flexi2: schemaMidiChannel,
    usb: schemaMidiChannel,
  })
);

export const schemaGlobalSettings = suretype(
  {
    name: 'GlobalSettings',
  },
  v.object({
    currentBank: v.number().required(),
    midiChannel: schemaMidiChannel,
    uiMode: v
      .anyOf([v.string().const('simple'), v.string().const('standard')])
      .required(),
    ledBrightness: v
      .anyOf([
        v.number().const(0),
        v.number().const(1),
        v.number().const(2),
        v.number().const(3),
      ])
      .required(),
    preserveStates: v.boolean().required(),
    sendStates: v.boolean().required(),
    deviceName: v.string().required(),
    profileId: v.string().required(),
    customLedColours: v.array(v.string()).required(),
    bankTemplateIndex: v.number().required(),
    bankPcMidiOutputs: schemaBankPcMidiOutputChannels,
    midiClocks: v.array(schemaMidiClock).required(),
    flexi1Mode: schemaFlexiMode,
    flexi2Mode: schemaFlexiMode,
    flexi1ThruHandles: schemaEnabledMidiOuts,
    flexi2ThruHandles: schemaEnabledMidiOuts,
    midi0ThruHandles: schemaEnabledMidiOuts,
    usbThruHandles: schemaEnabledMidiOuts,
    expMessages: v.array(schemaExpMessage).required(),
    auxMessages: v.array(schemaAuxMessages).required(),
  })
);

export type GlobalSettings = TypeOf<typeof schemaGlobalSettings>;

/**
 * Validate that a variable is a GlobalSettings
 *
 * @returns ValidationResult
 */
export const validateGlobalSettings = compile(schemaGlobalSettings);

/**
 * Ensure a variable is a GlobalSettings
 *
 * This call will throw a ValidationError if the variable isn't a GlobalSettings.
 *
 * If the variable **is** a GlobalSettings, the returned variable will be of that type.
 */
export const ensureGlobalSettings = compile<
  typeof schemaGlobalSettings,
  GlobalSettings
>(schemaGlobalSettings, { ensure: true });

/**
 * Validates that a variable is a GlobalSettings
 *
 * @returns boolean
 */
export const isGlobalSettings = compile(schemaGlobalSettings, { simple: true });
