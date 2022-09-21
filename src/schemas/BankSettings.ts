import { z } from 'zod';
import { SmartMessageType } from '../types';
import { Bridge, DeviceDescription } from '../types/DeviceDescription';

const switchGroupSchema = z.object({
  switch: z.number(),
  isPrimary: z.boolean(),
  broadcastMode: z.string(),
  respondTo: z.string(),
  responseType: z.string(),
});

const lfoSchema = z.object({
  state: z.boolean().nullable(),
  frequency: z.string(),
  minLimit: z.number(),
  maxLimit: z.number(),
  trigger: z.string(),
  messages: z.string().nullable(),
  waveform: z.string(),
  resolution: z.number(),
  resetOnStop: z.boolean(),
  clock: z.number().nullable(),
});

const midiOutsSchema = z.object({
  midi0: z.boolean(),
  flexi1: z.boolean(),
  flexi2: z.boolean(),
  usb: z.boolean(),
});

const rawMessageSchema = z.object({
  statusByte: z.string().min(1).max(2), // TODO: 8-bit hex
  dataByte1: z.string().min(1).max(2), // TODO: 8-bit hex
  dataByte2: z.string().min(1).max(2).optional(), // TODO: 8-bit hex
  outputs: midiOutsSchema,
});

const rawSmartMessageSchema = z.object({
  statusByte: z.string().min(1).max(2), // TODO: 8-bit hex
  dataByte1: z.string().min(1).max(2), // TODO: 8-bit hex
  dataByte2: z.string().min(1).max(2).optional(), // TODO: 8-bit hex
  smartType: z.nativeEnum(SmartMessageType),
});

const rawExpMessageSchema = rawMessageSchema.extend({
  minLimit: z.number(),
  maxLimit: z.number(),
  sweep: z.enum(['linear', 'log', 'reverseLog']),
});

const messageStackSchema = z.object({
  numMessages: z.number(),
  messages: z.array(z.union([rawMessageSchema, rawSmartMessageSchema])),
});

const expMessageStackSchema = z.object({
  numMessages: z.number(),
  messages: z.array(rawExpMessageSchema),
});

const auxMessageStacksSchema = z.object({
  pressMessages: messageStackSchema,
  holdMessages: messageStackSchema,
});

const auxMessagesSchema = z.object({
  tip: auxMessageStacksSchema,
  ring: auxMessageStacksSchema,
  tipRing: auxMessageStacksSchema,
});

const stepSchema = z.object({
  numMessages: z.number(),
  label: z.string(),
  color: z.string(), // TODO: 24-bit hex
  messages: z.array(rawMessageSchema),
});

const sequentialMessagesSchema = z.object({
  numSteps: z.number(),
  steps: z.array(stepSchema),
});

const scrollingMessagesSchema = z.object({
  stepInterval: z.number(), // 1-32
  minScrollLimit: z.number(), // 0-126
  maxScrollLimit: z.number(), // 1-127
  numMessages: z.number(),
  messages: z.array(rawMessageSchema),
});

export const footswitchSchema = z.object({
  name: z.string(),
  primaryState: z.boolean(),
  secondaryState: z.boolean(),
  primaryMode: z.string(),
  secondaryMode: z.string(),
  primaryColor: z.string(),
  secondaryColor: z.string(),
  primaryLedMode: z.string(),
  secondaryLedMode: z.string(),
  sequentialPattern: z.string(),
  sequentialRepeat: z.string(),
  sequentialSendMode: z.string(),
  linkedSwitch: z.number(),
  currentStep: z.number(),
  midiClock: z.number().nullable(),
  lfo: lfoSchema,
  toggleOnMessages: messageStackSchema,
  toggleOffMessages: messageStackSchema,
  secondaryToggleOnMessages: messageStackSchema,
  secondaryToggleOffMessages: messageStackSchema,
  pressMessages: messageStackSchema,
  releaseMessages: messageStackSchema,
  doublePressMessages: messageStackSchema,
  holdMessages: messageStackSchema,
  holdReleaseMessages: messageStackSchema,
  sequentialMessages: sequentialMessagesSchema,
  scrollingMessages: scrollingMessagesSchema,
});

// TODO: This may need to be refined to properly reflect how partial merging actually works
export const footswitchInputSchema = footswitchSchema.partial();

export type Footswitch = z.infer<typeof footswitchSchema>;
export type FootswitchInput = z.infer<typeof footswitchInputSchema>;

export const bankSettingsSchema = z.object({
  bankName: z.string(),
  bankId: z.string(),
  switchGroups: z.array(z.array(switchGroupSchema)),
  bankMessages: messageStackSchema,
  expMessages: z.array(expMessageStackSchema),
  auxMessages: z.array(auxMessagesSchema),
  footswitches: z.array(footswitchSchema),
});

// TODO: This may need to be refined to properly reflect how partial merging actually works
export const bankSettingsInputSchema = bankSettingsSchema.partial();

export type BankSettings = z.infer<typeof bankSettingsSchema>;
export type BankSettingsInput = z.infer<typeof bankSettingsInputSchema>;

const isBridge = (d: DeviceDescription): d is Bridge =>
  !!(d as Bridge).hardware.displayH;

export const makeFootswitchSchema = (deviceDescription: DeviceDescription) => {
  // Only narrowing name lengths for now
  return isBridge(deviceDescription)
    ? footswitchSchema
        .extend({
          name: z.string().max(deviceDescription.switchNameLength),
        })
        .partial()
    : footswitchSchema;
};

export const makeBankSettingsSchema = (
  deviceDescription: DeviceDescription
) => {
  // Only narrowing name lengths for now
  return isBridge(deviceDescription)
    ? bankSettingsInputSchema
        .extend({
          bankName: z.string().max(deviceDescription.bankNameLength),
          footswitches: z.array(makeFootswitchSchema(deviceDescription)),
        })
        .partial()
    : bankSettingsInputSchema;
};
