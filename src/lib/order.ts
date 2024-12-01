export const ORDER_BUFFER = 100;

export function orderForReorderedElement(
	orders: number[],
	source: number,
	destination: number,
): number {
	if (destination === 0) {
		return orders[0] / 2;
	}
	if (destination >= orders.length - 1) {
		return orders[orders.length - 1] + ORDER_BUFFER;
	}

	if (destination < source) {
		const before = orders[destination - 1];
		const after = orders[destination];
		return (after - before) / 2 + before;
	}

	const before = orders[destination];
	const after = orders[destination + 1];
	return (after - before) / 2 + before;
}
