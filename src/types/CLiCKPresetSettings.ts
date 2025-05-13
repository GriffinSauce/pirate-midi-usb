// Extend Record to help infer the runCommand type
export interface CLiCKPresetSettings extends Record<string, unknown> {
	name: string;
	tipState: boolean;
	ringState: boolean;
	expValue: number;
}
