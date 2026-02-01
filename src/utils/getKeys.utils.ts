/**
 * A Utility method to grab a redis key by its name
 * @param args string[] The passed in arguments to later join by ':'
 * @returns A string joined by ':' with all the strings passed in
 */
export function getKeyName(...args: string[]) {
  return `bites:${args.join(":")}`;
}

/**
 * Strings
 * - Binary safe data storage
 * - Can store text, JSON, serialized objects, images, etc.
 * - Maximum size: 512MB per string
 * - - - - - - - - - - - -
 * Redis Strings Cheat Sheet
 * SET -> Sets the value of a key
 * GET -> Retrieves the value of a key
 * DEL -> Deletes a key
 * EXISTS -> Checks if a key exists
 * EXPIRE -> Sets a timeout on a key
 * TTL -> Returns remaining time to live
 * INCR/INCRBY -> Increments numeric value
 * DECR/DECRBY -> Decrements numeric value
 * APPEND -> Appends value to existing string
 *
 * Example: Weather Cache String
 * Key: bites:weather:123
 * ----------------------------------------
 * Value: JSON string containing weather data
 * '{"coord":{"lon":-0.1257,"lat":51.5085},"weather":[{"id":803,"main":"Clouds","description":"broken clouds","icon":"04d"}],"main":{"temp":15.6,"feels_like":15.2,"temp_min":14.5,"temp_max":16.8,"pressure":1012,"humidity":78},"visibility":10000,"wind":{"speed":3.6,"deg":240},"clouds":{"all":75},"dt":1643673600,"sys":{"type":2,"id":2075535,"country":"GB","sunrise":1643632000,"sunset":1643664000},"timezone":0,"id":2643743,"name":"London","cod":200}'
 *
 * Use Cases:
 * - Caching API responses (weather data, user sessions)
 * - Storing configuration values
 * - Simple counters and flags
 * - JSON serialization for complex objects
 * - Image or file storage (up to 512MB)
 */

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
export const cuisinesKey = getKeyName("cuisines");
/**
 *
 * @param {name} string
 * @returns A prefixed string with 'cuisines' and {name} passed into the parameter declaration.
 */
export const cuisineKey = (name: string) => getKeyName("cuisines", name);
/**
 *
 * @param {id} string
 * @returns A prefixed string with 'restaurant_cuisines' and {id} passed into the parameter declaration.
 */
export const restaurantCuisinesKeyById = (id: string) =>
  getKeyName("restaurant_cuisines", id);

/**
 * Sorted Sets
 * - Ordered by a 'score'
 * - Unique strings, allows for tracking unique items (no duplicates)
 * - Leaderboard like table
 * - - - - - - - - - - - -
 * Redis Sorted Sets Cheat Sheet
 * ZADD -> Adds a new member and associated score to a sorted set. If the member
 * ZRANGE(low -> high) -> Returns members of a sorted set, sorted within a given range
 * ZRANK -> Returns the rank of the provided member, assuming the sorted is in
 * ZREVRANK -> Returns the rank of the provided member, assuming the sorted set is
 *
 * Example: Restaurants Sorted Set
 * Key: restaurants:by_rating
 * --------------------------------------
 * | Member               | Score       |
 * |----------------------|-------------|
 * | "restaurant1"        | 3.2         |
 * | "restaurant2"        | 5.2         |
 * | "restaurant3"        | 7.2         |
 */

/**
 * Static variable to return the restaurantsByRating redis key.
 */
export const restaurantsByRatingKey = getKeyName("restaurants_by_rating");

/**
 * Utility method to get the weather cache key for a specific restaurant.
 * @param {string} id Unique restaurant id passed to reference in redis.
 * @returns The key for storing cached weather data for the given restaurant id.
 *
 * Example Usage:
 * - Stores cached OpenWeatherMap API response for 10 minutes
 * - Used to reduce external API calls and improve response times
 * - Contains JSON weather data with temperature, humidity, conditions, etc.
 *
 * Redis Key Structure:
 * Key: bites:weather:restaurant123
 * Value Type: String (JSON)
 * TTL: 600 seconds (10 minutes)
 *
 * Example Stored Value:
 * '{"coord":{"lon":-0.1257,"lat":51.5085},"weather":[{"id":803,"main":"Clouds","description":"broken clouds"}],"main":{"temp":15.6,"feels_like":15.2,"humidity":78},"name":"London","cod":200}'
 */
export const weatherKeyById = (id: string) => getKeyName("weather", id);

export const restaurantDetailsKeyById = (id: string) =>
  getKeyName("restaurant_details", id);

//NOTE: Add the Redis searching documentation
export const restaurantsIndexKey = getKeyName("idx", "restaurants");
