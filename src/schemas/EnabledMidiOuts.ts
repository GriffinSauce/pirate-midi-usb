import { suretype, v } from 'suretype';

export const schemaEnabledMidiOuts = suretype(
  {
    name: 'EnabledMidiOuts',
  },
  v.object({
    midi0: v.boolean().required(),
    flexi1: v.boolean().required(),
    flexi2: v.boolean().required(),
    usb: v.boolean().required(),
  })
);
