export interface flruCache<T = any> {
	clear(isPartial?: boolean): void;
	has(key: string): boolean;
	get(key: string): undefined | T;
	set(key: string, value: T): void;
}

export default function flru<T = any>(max?: number): flruCache<T>;
