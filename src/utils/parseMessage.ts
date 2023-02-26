interface ParsedMessage {
	id: number;
	data: string;
}

/**
 * Parse a message to it's components (eg. "0,ok~" => "0" and "ok")
 */
const MESSAGE_PARSE_REGEX = /^(\d+),([\S\s]*?)~?$/; // TODO: Consider using named groups: /^(?<commandId>\d+),(?<data>[\S\s]*)/

export const parseMessage = (rawData: string): ParsedMessage => {
	// TODO: data format validation
	const matches = MESSAGE_PARSE_REGEX.exec(rawData.trim());

	if (matches === null) {
		throw new Error('error parsing message');
	}

	const [, idString, data] = matches;

	if (!data) {
		throw new Error('no data');
	}

	const id = parseInt(idString);

	return {
		id,
		data,
	};
};
