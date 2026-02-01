import { restaurantBloomKey } from "@/utils/getKeys.utils.js";
import { initializeRedisClient } from "@/utils/redisClient.utils.js";

/*
Total size of a Bloom filter

The actual memory used by a Bloom filter is a function of the chosen error rate:

The optimal number of hash functions is ceil(-ln(error_rate) / ln(2)).

The required number of bits per item, given the desired error_rate and the optimal number of hash functions, is -ln(error_rate) / ln(2)^2. Hence, the required number of bits in the filter is capacity * -ln(error_rate) / ln(2)^2.

1% error rate requires 7 hash functions and 9.585 bits per item.
0.1% error rate requires 10 hash functions and 14.378 bits per item.
0.01% error rate requires 14 hash functions and 19.170 bits per item.
*/
async function createBloomFilter() {
  const client = await initializeRedisClient();

  await Promise.all([
    client.del(restaurantBloomKey),
    //NOTE: The above is the in depth explanation of the bloom filter
    // The bloom filter will take up a fixed amount of memory based on the error rate and capacity
    //                              //Error Rate  // capacity
    client.bf.reserve(restaurantBloomKey, 0.0001, 1000000),
  ]);
}
//NOTE: Run this command similiar to the index one.
// pnpm dlx tsx src/seed/bloomFilter.seed.ts
await createBloomFilter();
process.exit();
