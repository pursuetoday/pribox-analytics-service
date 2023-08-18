function errorJsonReplacer(_, value) {
	if (value instanceof Error) {
		return {
			...value,
			name: value.name,
			message: value.message,
			stack: value.stack,
		};
	}
	return value;
}
export function serializeError(obj) {
	return JSON.stringify(obj, errorJsonReplacer, 4);
}

export function parseError(obj) {
	return JSON.parse(serializeError(obj));
}
