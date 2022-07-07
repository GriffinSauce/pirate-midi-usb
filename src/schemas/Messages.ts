import { suretype, v } from 'suretype';
import { schemaEnabledMidiOuts } from './EnabledMidiOuts';

export const schemaMessage = suretype(
  {
    name: 'Message',
  },
  v.object({
    statusByte: v.string().required(),
    dataByte1: v.string().required(),
    dataByte2: v.string(),
    outputs: schemaEnabledMidiOuts,
  })
);

export const schemaMessageStack = suretype(
  {
    name: 'MessageStack',
  },
  // v.unknown()
  v.object({
    numMessages: v.number(),
    messages: v.array(schemaMessage).required(),
  })
);

export const schemaAuxMessageStacks = suretype(
  {
    name: 'AuxMessageStacks',
  },
  v.object({
    pressMessages: schemaMessageStack,
    holdMessages: schemaMessageStack,
  })
);

export const schemaAuxMessages = suretype(
  {
    name: 'AuxMessages',
  },
  v.object({
    tip: schemaAuxMessageStacks,
    ring: schemaAuxMessageStacks,
    tipRing: schemaAuxMessageStacks,
  })
);

export const schemaExpMessage = suretype(
  {
    name: 'ExpMessage',
  },
  v.object({
    statusByte: v.string().required(),
    dataByte1: v.string().required(),
    dataByte2: v.string(),
    outputs: schemaEnabledMidiOuts,
    minLimit: v.number().required(),
    maxLimit: v.number().required(),
    sweep: v
      .anyOf([
        v.string().const('linear'),
        v.string().const('log'),
        v.string().const('reverseLog'),
      ])
      .required(),
  })
);
