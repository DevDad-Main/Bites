/**
 * A Utility method to grab a redis key by it's name
 * @param args string[] The passed in arguments to later join by ':'
 * @returns A string joint by ':' with all the strings passed in
 */
export function getKeyName(...args: string[]) {
  return `bites:${args.join(":")}`;
}

/**
 * Hashes
 * - Field-value Pairs
 * - Represent basic objects, counters, etc
 * - No nested data (Arrays,Objects)
 * - Fields added and removed as needed
 * - - - - - - - - - - - -
 * Redis Hashes Cheat Sheet
 * HSET -> Sets the value of one or more fields on a hash.
 * HGET -> Returns the value at a given field
 * HGETALL -> Returns all fields and values of the hash stored at a given key.
 * HMGET -> Returns the values at one or more given fields
 * HINCRBY -> Increments the vaalue at a given field by the interger provided
 */

/**
 * Utility method to get a redis stored hash with the prefix 'restaurants'
 * @param {string} id Unique keyword passed to reference in redis.
 * @returns a string that gets a redis key by it's given id
 */
export const restaurantKeyById = (id: string) => getKeyName("restaurants", id);

/**
 * Lists
 * - Linked list of string values
 * - Optimized for adding/removing.
 * - Either Add to the head/tail
 * - - - - - - - - - - - -
 * Redis Lists (Linked Lists)
 * LPUSH/RPUSH -> Adds a new element to the head/tail
 * LPOP/RPOP  -> Removes and returns an element from the head/tail of a list.
 * LLEN -> Returns the length of a list
 * LMOVE -> Atomically moves elements from one list to another
 * LRANGE -> Extracts a range of elements from a list
 * LTRIM -> Reduces a list to the specified range of elements
 */

/**
 * Utility method to get the stored redis lists with the prefix 'reviews'
 * @param {string} id Unique keyword passed to reference in redis.
 * @returns The cached linked lists in the redis db by its given id.
 */
export const reviewKeyById = (id: string) => getKeyName("reviews", id);
