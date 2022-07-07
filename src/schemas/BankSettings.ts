import { suretype, v, compile, TypeOf } from 'suretype';
import {
  schemaAuxMessages,
  schemaExpMessage,
  schemaMessageStack,
} from './Messages';

export const schemaLfo = suretype(
  {
    name: 'Lfo',
  },
  v.object({
    state: v.anyOf([v.boolean(), v.null()]).required(),
    frequency: v.string().required(),
    minLimit: v.number().required(),
    maxLimit: v.number().required(),
    trigger: v.string().required(),
    messages: v.anyOf([v.null(), v.string()]).required(),
    waveform: v.string().required(),
    resolution: v.number().required(),
    resetOnStop: v.boolean().required(),
    clock: v.anyOf([v.number(), v.null()]).required(),
  })
);

export const schemaFootswitch = suretype(
  {
    name: 'Footswitch',
  },
  v.object({
    name: v.string().required(),
    primaryState: v.boolean().required(),
    secondaryState: v.boolean().required(),
    primaryMode: v.string().required(),
    secondaryMode: v.string().required(),
    primaryColor: v.string().required(),
    secondaryColor: v.string().required(),
    primaryLedMode: v.string().required(),
    secondaryLedMode: v.string().required(),
    stepInterval: v.number().required(),
    minScrollLimit: v.number().required(),
    maxScrollLimit: v.number().required(),
    sequentialPattern: v.string().required(),
    sequentialRepeat: v.string().required(),
    sequentialSendMode: v.string().required(),
    linkedSwitch: v.number().required(),
    numSteps: v.number().required(),
    numSequentialMessages: v.array(v.number()).required(),
    sequentialLabels: v.array(v.string()).required(),
    sequentialColors: v.array(v.string()).required(),
    currentStep: v.number().required(),
    midiClock: v.anyOf([v.number(), v.null()]).required(),
    toggleOnMessages: schemaMessageStack,
    toggleOffMessages: schemaMessageStack,
    secondaryToggleOnMessages: schemaMessageStack,
    secondaryToggleOffMessages: schemaMessageStack,
    pressMessages: schemaMessageStack,
    releaseMessages: schemaMessageStack,
    doublePressMessages: schemaMessageStack,
    holdMessages: schemaMessageStack,
    holdReleaseMessages: schemaMessageStack,
    lfo: schemaLfo,
  })
);

export const schemaSwitchGroup = suretype(
  {
    name: 'SwitchGroup',
  },
  v.object({
    switch: v.number().required(),
    isPrimary: v.boolean().required(),
    broadcastMode: v.string().required(),
    respondTo: v.string().required(),
    responseType: v.string().required(),
  })
);

export const schemaBankSettings = suretype(
  {
    name: 'BankSettings',
  },
  v.object({
    bankName: v.string().required(),
    bankId: v.string().required(),
    bankMessages: schemaMessageStack,
    expMessages: v.array(schemaExpMessage).required(),
    switchGroups: v.array(v.array(schemaSwitchGroup)).required(),
    auxMessages: v.array(schemaAuxMessages).required(),
    footswitches: v.array(schemaFootswitch).required(),
  })
);

export type BankSettings = TypeOf<typeof schemaBankSettings>;

/**
 * Validate that a variable is a BankSettings
 *
 * @returns ValidationResult
 */
export const validateBankSettings = compile(schemaBankSettings);

/**
 * Ensure a variable is a BankSettings
 *
 * This call will throw a ValidationError if the variable isn't a BankSettings.
 *
 * If the variable **is** a BankSettings, the returned variable will be of that type.
 */
export const ensureBankSettings = compile<
  typeof schemaBankSettings,
  BankSettings
>(schemaBankSettings, { ensure: true });

/**
 * Validates that a variable is a BankSettings
 *
 * @returns boolean
 */
export const isBankSettings = compile(schemaBankSettings, { simple: true });
