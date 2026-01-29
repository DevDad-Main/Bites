/**
 * A Utility method to grab a redis key by its name
 * @param args string[] The passed in arguments to later join by ':'
 * @returns A string joined by ':' with all the strings passed in
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
 * HINCRBY -> Increments the value at a given field by the integer provided
 * 
 * Example: Restaurant Hash
 * Key: bites:restaurants:123
 * ----------------------------------------
 * | Field       | Value                   |
 * |-------------|------------------------|
 * | name        | "Pasta Paradise"       |
 * | cuisine     | "Italian"              |
 * | rating      | "4.5"                  |
 * | open_hours  | "10:00-22:00"          |
 */
export const restaurantKeyById = (id: string) => getKeyName("restaurants", id);

/**
 * Lists
 * - Linked list of string values
 * - Optimized for adding/removing
 * - Either add to the head/tail
 * - - - - - - - - - - - -
 * Redis Lists (Linked Lists)
 * LPUSH/RPUSH -> Adds a new element to the head/tail
 * LPOP/RPOP  -> Removes and returns an element from the head/tail of a list.
 * LLEN -> Returns the length of a list
 * LMOVE -> Atomically moves elements from one list to another
 * LRANGE -> Extracts a range of elements from a list
 * LTRIM -> Reduces a list to the specified range of elements
 *
 * Example: Reviews List
 * Key: bites:reviews:123
 * ------------------------------
 * | Index | Value                 |
 * |-------|-----------------------|
 * | 0     | "Great pasta!"        |
 * | 1     | "Loved the ambiance"  |
 * | 2     | "Service could improve"|
 */
export const reviewKeyById = (id: string) => getKeyName("reviews", id);

/**
 * Utility method to get the review details for a specific review.
 * @param {string} id Unique review id passed to reference in redis.
 * @returns The cached review data for the given id parameter.
 * 
 * Example: Review Details Hash
 * Key: bites:review_details:987
 * ----------------------------------------
 * | Field      | Value                   |
 * |------------|------------------------|
 * | user       | "John Doe"             |
 * | rating     | "5"                    |
 * | comment    | "Best dining experience"|
 * | date       | "2026-01-29"           |
 */
export const reviewDetailsKeyByID = (id: string) =>
	getKeyName("review_details", id);

/**
 * Sets
 * - Unordered collection
 * - Unique strings, allows for tracking unique items (no duplicates)
 * - - - - - - - - - - - -
 * Redis Sets Cheat Sheet
 * SADD -> Adds one or more members to a set (Ignores if the member is already apart of the set)
 * SMEMBERS -> Returns all members of a set
 * SISMEMBER -> Checks if a member exists
 * SREM -> Removes a member from a set
 * SCARD -> Returns the number of members (size of the set, aka cardinality)
 *
 * Example: Cuisine Set
 * Key: bites:cuisines
 * ---------------------
 * | Member           |
 * |------------------|
 * | "Italian"        |
 * | "Mexican"        |
 * | "Japanese"       |
 * | "Indian"         |
 */

/**
 * Static utility method that just returns the cuisines key name.
 * @returns {string} "cuisines"
 */
export const cuisinesKey = getKeyName("cuisines")
/**
 * 
 * @param {name} string
 * @returns A prefixed string with 'cuisines' and {name} passed into the parameter declaration.
 */
export const cuisineKey = (name: string) => getKeyName("cuisines", name)
/**
 * 
 * @param {id} string
 * @returns A prefixed string with 'restaurant_cuisines' and {id} passed into the parameter declaration.
 */
export const restaurantCuisinesKeyById = (id: string) => getKeyName("restaurant_cuisines", id)
