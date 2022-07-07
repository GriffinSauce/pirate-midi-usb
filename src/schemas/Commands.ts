import { suretype, v, compile } from 'suretype';

export enum Command {
  Check = 'CHCK',
  Control = 'CTRL',
  DataRequest = 'DREQ',
  DataTransmitRequest = 'DTXR',
  Reset = 'RSET',
}

export const schemaCommandOptions = suretype(
  {
    name: 'CommandOptions',
  },
  v.object({
    args: v.array(v.string()),
    data: v.string(),
  })
);

export type CommandOptions = { args?: string[]; data?: string };

/**
 * Validate that a variable is a CommandOptions
 *
 * @returns ValidationResult
 */
export const validateCommandOptions = compile(schemaCommandOptions);

/**
 * Ensure a variable is a CommandOptions
 *
 * This call will throw a ValidationError if the variable isn't a CommandOptions.
 *
 * If the variable **is** a CommandOptions, the returned variable will be of that type.
 */
export const ensureCommandOptions = compile<
  typeof schemaCommandOptions,
  CommandOptions
>(schemaCommandOptions, { ensure: true });

/**
 * Validates that a variable is a CommandOptions
 *
 * @returns boolean
 */
export const isCommandOptions = compile(schemaCommandOptions, { simple: true });
