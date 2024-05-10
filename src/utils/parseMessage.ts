export const parseMessage = (rawData: string): string => {
	const data = rawData.trim().replace(/~$/, '');
	if (!data) throw new Error('no data');
	return data;
};
