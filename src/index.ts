export interface flruCache<T = any> {
	clear(isPartial?: boolean): void;
	has(key: string): boolean;
	get(key: string): T | undefined;
	set(key: string, value: T): void;
}

export default function flru<T = any>(max?: number): flruCache<T> {
	let num: number;
	let curr: Record<string, T>;
	let prev: Record<string, T>;
	const limit = max || 1;

	function keep(key: string, value: T): void {
		if (++num > limit) {
			prev = curr;
			reset(1);
			++num;
		}
		curr[key] = value;
	}

	function reset(isPartial?: number): void {
		num = 0;
		curr = Object.create(null);
		isPartial || (prev = Object.create(null));
	}

	reset();

	return {
		clear: reset,
		has: function (key: string): boolean {
			return curr[key] !== void 0 || prev[key] !== void 0;
		},
		get: function (key: string): T | undefined {
			let val = curr[key];
			if (val !== void 0) return val;
			if ((val = prev[key]) !== void 0) {
				keep(key, val);
				return val;
			}
		},
		set: function (key: string, value: T): void {
			if (curr[key] !== void 0) {
				curr[key] = value;
			} else {
				keep(key, value);
			}
		}
	};
}
