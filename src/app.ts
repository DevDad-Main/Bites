import express from "express";
import restaurantsRoutes from "./routes/restaurants.routes.js";
import { errorHandler } from "devdad-express-utils";

const app = express();
const VERSION = process.env.VERSION || "v1";

//#region Middleware
app.use(express.json());
//#endregion

//#region Endpoints
app.use(`/api/${VERSION}/restaurants`, restaurantsRoutes);
app.use(`/api/${VERSION}/cuisines`, restaurantsRoutes);
//#endregion

//#region Error Handler Middleware
app.use(errorHandler);
//#endregion

export default app;
