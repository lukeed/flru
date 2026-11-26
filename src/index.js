export default function (max) {
	var num, curr, prev;
	var limit = max || 1;

	function keep(key, value) {
		if (++num > limit) {
			prev = curr;
			reset(1);
			++num;
		}
		curr[key] = value;
	}

	function reset(isPartial) {
		num = 0;
		curr = Object.create(null);
		isPartial || (prev=Object.create(null));
	}

	reset();

	return {
		clear: reset,
		has: function (key) {
			return key in curr || key in prev;
		},
		get: function (key) {
			if (key in curr) return curr[key];
			if (key in prev) {
				var val = prev[key];
				keep(key, val);
				return val;
			}
		},
		set: function (key, value) {
			if (key in curr) {
				curr[key] = value;
			} else {
				keep(key, value);
			}
		}
	};
}
