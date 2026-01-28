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
 * @param id string Unique keyword passed to reference in redis.
 * @returns a string that gets a redis key by it's given id
 */
export const restaurantKeyById = (id: string) => getKeyName("restaurants", id);
