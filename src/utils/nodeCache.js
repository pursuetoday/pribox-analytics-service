import NodeCache from 'node-cache';

const myCache = new NodeCache();

export const setCacheData = (key, val, ttl = 1200) => {
	const success = myCache.set(key, val, ttl);
	return success;
};

export const getCacheData = (key) => {
	const value = myCache.get(key);
	if (value !== undefined) {
		return value;
	}
};

export const isCacheKey = (key) => {
	const success = myCache.has(key);
	return success;
};

export const deleteCacheKey = (key) => {
	const success = myCache.del(key);
	return success;
};
