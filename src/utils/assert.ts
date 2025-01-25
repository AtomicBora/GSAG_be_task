export function assertIsDefined<T>(
	value: T,
	message: string
): asserts value is NonNullable<T> {
	if (value === undefined || value === null) {
		throw new Error(`Error!\n` + message);
	}
}
