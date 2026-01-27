import { createClient, type RedisClientType } from "redis";
import { logger } from "devdad-express-utils";

let client: RedisClientType | null = null;

// NOTE: Redis Client Singleton
export async function initializeRedisClient() {
  if (!client) {
    // client = createClient({
    //   url: "specify cloud based url here",
    // });

    client = createClient();
    client.on("error", (error) => {
      logger.error(error || "Something went wrong while connecting to redis.", {
        error,
      });
    });
    client.on("connect", () => {
      logger.info("Redis Connected Successfully");
    });
    await client.connect();
  }

  return client;
}
