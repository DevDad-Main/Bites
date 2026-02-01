import app from "./app.js";
import { logger } from "devdad-express-utils";

const PORT = process.env.PORT || 3000;

app
  .listen(PORT, () => {
    logger.info(`Server is running on http://localhost:${PORT}`);
    logger.info(`Redis Insight is running on http://localhost:8001`);
    logger.info(
      `Bites API Docs can be found at http://localhost:3000/api-docs`,
    );
  })
  .on("error", (error: any) => {
    logger.error("Something went wrong while connecting to the server..", {
      error,
    });
    throw new Error(error.message);
  });
