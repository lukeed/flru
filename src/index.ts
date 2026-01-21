export interface flruCache<T = any> {
	clear(isPartial?: boolean): void;
	has(key: string): boolean;
	get(key: string): undefined | T;
	set(key: string, value: T): void;
}

export default function flru<T = any>(max?: number): flruCache<T> {
	let num: number, curr: Record<string, T>, prev: Record<string, T>;
	const limit = max || 1;

	function keep(key: string, value: T): void {
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
		has: function (key: string): boolean {
			return curr[key] !== void 0 || prev[key] !== void 0;
		},
		get: function (key: string): undefined | T {
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
