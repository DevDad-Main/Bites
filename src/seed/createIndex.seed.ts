import { SCHEMA_FIELD_TYPE } from "redis";
import { initializeRedisClient } from "@/utils/redisClient.utils.js";
import { getKeyName, restaurantsIndexKey } from "@/utils/getKeys.utils.js";
import { logger } from "devdad-express-utils";

async function createIndex() {
  const client = await initializeRedisClient();

  try {
    await client.ft.dropIndex(restaurantsIndexKey);
  } catch (error) {
    //NOTE: Technically the above returns us an error but we don't want to throw an error if it dosent exist so we just catch the error and put out a simple log.
    console.log("No existing index to delete");
    logger.error("No existing index to delete", { error });
  }

  //NOTE: After the above logic is dealt with drop any existing indexs we can now create our new index.
  await client.ft.create(
    restaurantsIndexKey,
    {
      id: {
        type: SCHEMA_FIELD_TYPE.TEXT,
        AS: "id",
      },
      name: {
        type: SCHEMA_FIELD_TYPE.TEXT,
        AS: "name",
      },
      avgStars: {
        type: SCHEMA_FIELD_TYPE.NUMERIC,
        AS: "avgStars",
        SORTABLE: true,
      },
    },
    {
      ON: "HASH",
      PREFIX: getKeyName("restaurants"),
    },
  );
}

//NOTE: We need to run the index once to create it. We use the process.exit to ensure our application/process exits after the function is called for safety and not duplicate data.

//NOTE: Run the following command from the root dir 'Bites'
//pnpm dlx tsx src/seed/createIndex.seed.ts
await createIndex();
process.exit();
