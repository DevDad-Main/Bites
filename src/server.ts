import app from "@/app";
import { logger } from "devdad-express-utils";

const PORT = process.env.PORT || 3000;

app
  .listen(PORT, () => {
    logger.info(`Server is running on http://localhost:${PORT}`);
  })
  .on("error", (error: any) => {
    logger.error("Something went wrong while connecting to the server..", {
      error,
    });
    throw new Error(error.message);
  });
