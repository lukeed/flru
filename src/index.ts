interface LRUCache<K extends string | number, V> {
	clear: () => void;
	has: (key: K) => boolean;
	get: (key: K) => V | undefined;
	set: (key: K, value: V) => void;
}

export default function <K extends string | number = string, V = any>(max?: number): LRUCache<K, V> {
	let num: number;
	let curr: Record<K, V>;
	let prev: Record<K, V>;
	const limit = max || 1;

	function keep(key: K, value: V): void {
		if (++num > limit) {
			prev = curr;
			reset(true);
			++num;
		}
		curr[key] = value;
	}

	function reset(isPartial?: boolean): void {
		num = 0;
		curr = Object.create(null);
		isPartial || (prev = Object.create(null));
	}

	reset();

	return {
		clear: reset,
		has: function (key: K): boolean {
			return curr[key] !== void 0 || prev[key] !== void 0;
		},
		get: function (key: K): V | undefined {
			let val = curr[key];
			if (val !== void 0) return val;
			if ((val = prev[key]) !== void 0) {
				keep(key, val);
				return val;
			}
		},
		set: function (key: K, value: V): void {
			if (curr[key] !== void 0) {
				curr[key] = value;
			} else {
				keep(key, value);
			}
		}
	};
}
